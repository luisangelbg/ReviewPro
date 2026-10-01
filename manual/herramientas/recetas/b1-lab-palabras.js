goStep(1); await W(1500); q('.lab-tab[data-lab="labScreen"]').click(); await W(1500);
const r = q('#slRecords'); const lis = [...r.querySelectorAll('li')].slice(0, 2);
return foto([...r.children].filter(n => n.tagName !== 'OL' && n.tagName !== 'UL').concat(lis), 8, 150);
