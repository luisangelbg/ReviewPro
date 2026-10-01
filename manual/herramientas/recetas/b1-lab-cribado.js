goStep(1); await W(1500); q('.lab-tab[data-lab="labScreen"]').click(); await W(1500);
return foto([q('.lab-tabs'), q('#slReadout'), q('#slCurve').closest('.pg-pane'), q('#slPrisma').closest('.pg-pane')], 8, 150);
