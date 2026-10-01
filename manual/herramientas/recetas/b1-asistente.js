goStep(1); await W(900);
for (const [k, v] of [['goal','answer'],['focus','focused'],['quant','mixed'],['rigor','yes'],['time','mid']]) { const b = q(`#wizard [data-q="${k}"][data-v="${v}"]`); if (b) { b.click(); await W(150); } }
await W(400); return foto([q('#wizard')], 8);
