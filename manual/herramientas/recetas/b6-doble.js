await ejemplo(); const ex = state.extraction, sid = Block6.studies().find(s => s.label.startsWith('Rossi')).id; const f = ex.fields.find(x => x.label === 'Diseño experimental'); delete ex.final[sid][f.id]; Block6.renderAll();
goStep(6); await W(2500); Block6.renderAll(); await W(600);
return foto(tarjeta(6, 2), 8, 150);
