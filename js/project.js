/* ReviewPro — Copyright (C) 2026 Luis Ángel Barrera-Guzmán.
   Free software under the GNU General Public License, version 3; see LICENSE. */
/* ReviewPro — the review project: saving, opening and autosaving.

   A review lasts months, so the project must survive closing the browser.
   Two layers:
   - autosave in the browser's own storage, a second after every change;
   - a project file (.reviewpro.json) the user downloads, keeps with the
     manuscript, sends to a co-author and archives with the article. It is the
     only thing that travels: records and decisions never go anywhere else.
   Every block keeps its part of the project inside `state` and calls
   Project.touch() after changing it. */

const Project = {};

(function () {
  const KEY = 'reviewpro:project';
  const FORMAT = 'reviewpro-project';
  let timer = null;
  const listeners = [];

  function snapshot() {
    return { format: FORMAT, version: 1, app: APP_VERSION, saved: new Date().toISOString(),
      reviewType: state.reviewType, protocol: state.protocol, search: state.search, screening: state.screening,
      fulltext: state.fulltext, extraction: state.extraction, appraisal: state.appraisal, synthesis: state.synthesis, writing: state.writing, report: state.report };
  }
  function apply(obj) {
    if (!obj || obj.format !== FORMAT) throw new Error(T('El archivo no es un proyecto de ReviewPro.', 'The file is not a ReviewPro project.'));
    state.protocol = Protocol.normalize(obj.protocol);
    state.reviewType = state.protocol.type;
    ['search', 'screening', 'fulltext', 'extraction', 'appraisal', 'synthesis', 'writing', 'report'].forEach(k => { state[k] = obj[k] || null; });
    listeners.forEach(f => f('load'));
  }
  const Proj = {
    KEY, FORMAT, snapshot, apply,
    lastSaved: null,
    /* call after any change; the save happens a second later */
    touch() {
      clearTimeout(timer);
      timer = setTimeout(Proj.saveLocal, 900);
      listeners.forEach(f => f('change'));
    },
    saveLocal() {
      try { localStorage.setItem(KEY, JSON.stringify(snapshot())); Proj.lastSaved = new Date(); listeners.forEach(f => f('saved')); return true; } catch (e) { listeners.forEach(f => f('savefail')); return false; }    },
    loadLocal() {
      try { const s = localStorage.getItem(KEY); if (!s) return false; apply(JSON.parse(s)); return true; } catch (e) { return false; }
    },
    clearLocal() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } },
    fileName() { return slug((state.protocol && state.protocol.title) || 'revision') + '.reviewpro.json'; },
    download() { download(JSON.stringify(snapshot(), null, 1), Proj.fileName(), 'application/json'); },
    /* returns a promise that resolves when the file has been applied */
    open(file) {
      return file.text().then(t => { apply(JSON.parse(t)); Proj.saveLocal(); });
    },
    fresh(type) {
      state.protocol = Protocol.blank(type);
      state.reviewType = state.protocol.type;
      ['search', 'screening', 'fulltext', 'extraction', 'appraisal', 'synthesis', 'writing', 'report'].forEach(k => { state[k] = null; });
      listeners.forEach(f => f('load'));
      Proj.touch();
    },
    on(f) { listeners.push(f); },
  };
  Object.assign(Project, Proj);
  window.Project = Project;
})();
