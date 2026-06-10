const { performance } = require('perf_hooks');

// Mock supabase
const supabase = {
  from: (table) => ({
    upsert: async (data, options) => {
      // simulate network delay: say 10ms network roundtrip per request
      await new Promise(resolve => setTimeout(resolve, 10));
      return { error: null };
    }
  })
};

const metricslog = {};
for (let i = 0; i < 50; i++) {
  metricslog[`2024-01-${String(i+1).padStart(2, '0')}`] = {
    weight: 80,
    musculo: 40,
    grasaPct: 15,
    visceral: 5
  };
}
const uId = 'user-123';

async function runOriginal() {
  const start = performance.now();
  const metricEntries = Object.entries(metricslog || {});
  for (const [dateStr, m] of metricEntries) {
    if (!m || m.weight === undefined) continue;
    const { error: metErr } = await supabase.from('metrics_logs').upsert({
      user_id: uId,
      date: dateStr,
      weight: parseFloat(m.weight) || 93.9,
      musculo: parseFloat(m.musculo) || 64.7,
      grasa_pct: parseFloat(m.grasaPct) || 26.2,
      visceral: parseInt(m.visceral) || 9,
      brazo_der: m.brazoDer !== undefined && m.brazoDer !== "" ? parseFloat(m.brazoDer) : null,
      brazo_izq: m.brazoIzq !== undefined && m.brazoIzq !== "" ? parseFloat(m.brazoIzq) : null,
      muslo_der: m.musloDer !== undefined && m.musloDer !== "" ? parseFloat(m.musloDer) : null,
      muslo_izq: m.musloIzq !== undefined && m.musloIzq !== "" ? parseFloat(m.musloIzq) : null,
      pantorrilla_der: m.pantorrillaDer !== undefined && m.pantorrillaDer !== "" ? parseFloat(m.pantorrillaDer) : null,
      pantorrilla_izq: m.pantorrillaIzq !== undefined && m.pantorrillaIzq !== "" ? parseFloat(m.pantorrillaIzq) : null,
      cintura: m.cintura !== undefined && m.cintura !== "" ? parseFloat(m.cintura) : null,
      pecho: m.pecho !== undefined && m.pecho !== "" ? parseFloat(m.pecho) : null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, date' });
    if (metErr) throw metErr;
  }
  const end = performance.now();
  console.log(`Original Time: ${(end - start).toFixed(2)}ms`);
}

async function runOptimized() {
  const start = performance.now();
  const metricEntries = Object.entries(metricslog || {});
  const metricsToUpsert = [];
  for (const [dateStr, m] of metricEntries) {
    if (!m || m.weight === undefined) continue;
    metricsToUpsert.push({
      user_id: uId,
      date: dateStr,
      weight: parseFloat(m.weight) || 93.9,
      musculo: parseFloat(m.musculo) || 64.7,
      grasa_pct: parseFloat(m.grasaPct) || 26.2,
      visceral: parseInt(m.visceral) || 9,
      brazo_der: m.brazoDer !== undefined && m.brazoDer !== "" ? parseFloat(m.brazoDer) : null,
      brazo_izq: m.brazoIzq !== undefined && m.brazoIzq !== "" ? parseFloat(m.brazoIzq) : null,
      muslo_der: m.musloDer !== undefined && m.musloDer !== "" ? parseFloat(m.musloDer) : null,
      muslo_izq: m.musloIzq !== undefined && m.musloIzq !== "" ? parseFloat(m.musloIzq) : null,
      pantorrilla_der: m.pantorrillaDer !== undefined && m.pantorrillaDer !== "" ? parseFloat(m.pantorrillaDer) : null,
      pantorrilla_izq: m.pantorrillaIzq !== undefined && m.pantorrillaIzq !== "" ? parseFloat(m.pantorrillaIzq) : null,
      cintura: m.cintura !== undefined && m.cintura !== "" ? parseFloat(m.cintura) : null,
      pecho: m.pecho !== undefined && m.pecho !== "" ? parseFloat(m.pecho) : null,
      updated_at: new Date().toISOString()
    });
  }
  if (metricsToUpsert.length > 0) {
    const { error: metErr } = await supabase.from('metrics_logs').upsert(metricsToUpsert, { onConflict: 'user_id, date' });
    if (metErr) throw metErr;
  }
  const end = performance.now();
  console.log(`Optimized Time: ${(end - start).toFixed(2)}ms`);
}

async function run() {
  await runOriginal();
  await runOptimized();
}

run();
