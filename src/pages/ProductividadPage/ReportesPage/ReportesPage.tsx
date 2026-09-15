// src/pages/ProductividadPage/ReportesPage/ReportesPage.tsx

import { useState } from 'react';
import {
  RefreshCw, Download, TrendingUp, Clock, Layers,
  CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useReportes } from '@/features/productividad/reportes/hooks/useReportes';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './ReportesPage.css';

type TabType = 'sla' | 'estimacion';

/** Tooltip custom estilo Silicon Valley */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="reportes-tooltip">
      {label && <p className="reportes-tooltip__label">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export function ReportesPage() {
  const { sla, estimacion, cargando, recargar } = useReportes();
  const [tab, setTab] = useState<TabType>('sla');

  const exportarCSV = () => {
    const data = tab === 'sla' ? sla : estimacion;
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${tab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Totales SLA para KPIs ──
  const tot = sla.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      cerrados: acc.cerrados + r.cerrados,
      cumplidos: acc.cumplidos + r.cumplidos,
      vencidos: acc.vencidos + r.vencidos,
      en_riesgo: acc.en_riesgo + r.en_riesgo,
    }),
    { total: 0, cerrados: 0, cumplidos: 0, vencidos: 0, en_riesgo: 0 },
  );
  const pctGlobal = tot.cerrados > 0 ? Math.round((tot.cumplidos / tot.cerrados) * 100) : 0;

  const kpisSLA = [
    { label: 'Total tickets', valor: tot.total, icon: Layers, color: 'indigo' },
    { label: 'Cumplidos', valor: tot.cumplidos, icon: CheckCircle2, color: 'emerald' },
    { label: 'En riesgo', valor: tot.en_riesgo, icon: AlertTriangle, color: 'amber' },
    { label: 'Vencidos', valor: tot.vencidos, icon: Clock, color: 'rose' },
    { label: 'Cumplimiento', valor: `${pctGlobal}%`, icon: TrendingUp, color: 'violet' },
  ];

  // ── Totales Estimación para KPIs ──
  const totEst = estimacion.reduce(
    (acc, r) => ({
      proyectos: acc.proyectos + r.total_proyectos,
      desv: acc.desv + r.desviacion_pct,
    }),
    { proyectos: 0, desv: 0 },
  );
  const desvProm = estimacion.length > 0 ? Math.round((totEst.desv / estimacion.length) * 10) / 10 : 0;

  const kpisEst = [
    { label: 'Total proyectos', valor: totEst.proyectos, icon: Layers, color: 'indigo' },
    {
      label: 'Desviación promedio',
      valor: `${desvProm > 0 ? '+' : ''}${desvProm}%`,
      icon: TrendingUp,
      color: Math.abs(desvProm) <= 10 ? 'emerald' : Math.abs(desvProm) <= 25 ? 'amber' : 'rose',
    },
  ];

  // ── Donut: paleta Aurora (suave) ──
  const pieData = [
    { id: 'cumplidos', name: 'Cumplidos', solid: '#2ec4b6', value: tot.cumplidos },
    { id: 'progreso', name: 'En progreso', solid: '#5d7bf7', value: tot.total - tot.cerrados - tot.en_riesgo },
    { id: 'riesgo', name: 'En riesgo', solid: '#9b5de5', value: tot.en_riesgo },
    { id: 'vencidos', name: 'Vencidos', solid: '#f15bb5', value: tot.vencidos },
  ].filter(d => d.value > 0);

  // ── Barras: agregado por área ──
  const barData = Object.values(
    sla.reduce<Record<string, { area: string; cumplidos: number; vencidos: number; en_riesgo: number }>>(
      (acc, r) => {
        if (!acc[r.area]) acc[r.area] = { area: r.area, cumplidos: 0, vencidos: 0, en_riesgo: 0 };
        acc[r.area].cumplidos += r.cumplidos;
        acc[r.area].vencidos += r.vencidos;
        acc[r.area].en_riesgo += r.en_riesgo;
        return acc;
      },
      {},
    ),
  );

  const kpis = tab === 'sla' ? kpisSLA : kpisEst;

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <div>
          <h2 className="reportes-title">Reportes</h2>
          <p className="reportes-sub">Métricas de SLA y estimación de proyectos</p>
        </div>
        <div className="reportes-header__actions">
          <button className="reportes-btn" onClick={recargar} disabled={cargando} title="Actualizar">
            <RefreshCw size={15} className={cargando ? 'reportes-spin' : ''} />
          </button>
          <button className="reportes-btn reportes-btn--primary" onClick={exportarCSV} disabled={cargando}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="reportes-tabs">
        <button
          className={`reportes-tab ${tab === 'sla' ? 'reportes-tab--active' : ''}`}
          onClick={() => setTab('sla')}
        >
          <Clock size={15} /> SLA
        </button>
        <button
          className={`reportes-tab ${tab === 'estimacion' ? 'reportes-tab--active' : ''}`}
          onClick={() => setTab('estimacion')}
        >
          <TrendingUp size={15} /> Estimación
        </button>
      </div>

      {cargando ? (
        <div className="reportes-skeleton">
          {[...Array(5)].map((_, i) => <div key={i} className="reportes-skeleton__row" />)}
        </div>
      ) : (
        <>
          {/* ── KPIs ── */}
          <div className="reportes-kpis">
            {kpis.map(k => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="reportes-kpi">
                  <div className={`reportes-kpi__icon reportes-kpi__icon--${k.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="reportes-kpi__value">{k.valor}</span>
                    <span className="reportes-kpi__label">{k.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {tab === 'sla' ? (
            sla.length === 0 ? (
              <div className="reportes-empty">No hay datos de SLA disponibles.</div>
            ) : (
              <>
                <div className="reportes-charts">
                  {/* ── Donut ── */}
                  <div className="reportes-chart">
                    <h4>Distribución por estado</h4>
                    <div className="reportes-donut-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <linearGradient id="grad-cumplidos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7fe8dc" />
                              <stop offset="100%" stopColor="#17a99b" />
                            </linearGradient>
                            <linearGradient id="grad-progreso" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#93a8ff" />
                              <stop offset="100%" stopColor="#4a6cf7" />
                            </linearGradient>
                            <linearGradient id="grad-riesgo" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c99bf7" />
                              <stop offset="100%" stopColor="#8b45d9" />
                            </linearGradient>
                            <linearGradient id="grad-vencidos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ff8fcb" />
                              <stop offset="100%" stopColor="#e03e9e" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={110}
                            paddingAngle={4}
                            cornerRadius={8}
                            stroke="none"
                          >
                            {pieData.map(entry => (
                              <Cell key={entry.id} fill={`url(#grad-${entry.id})`} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="reportes-donut-center">
                        <span className="reportes-donut-center__num">{tot.total}</span>
                        <span className="reportes-donut-center__label">tickets</span>
                      </div>
                    </div>
                    <div className="reportes-legend">
                      {pieData.map(d => (
                        <span key={d.id} className="reportes-legend__item">
                          <span className="reportes-legend__dot" style={{ background: d.solid }} />
                          {d.name} · {d.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ── Barras ── */}
                  <div className="reportes-chart">
                    <h4>Cumplimiento por área</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
                        <XAxis
                          dataKey="area"
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: '#6b7280' }} />
                        <Bar dataKey="cumplidos" name="Cumplidos" fill="#2ec4b6" radius={[8, 8, 0, 0]} barSize={26} />
                        <Bar dataKey="en_riesgo" name="En riesgo" fill="#9b5de5" radius={[8, 8, 0, 0]} barSize={26} />
                        <Bar dataKey="vencidos" name="Vencidos" fill="#f15bb5" radius={[8, 8, 0, 0]} barSize={26} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="reportes-table-wrap">
                  <table className="reportes-table">
                    <thead>
                      <tr>
                        <th>Área</th>
                        <th>Complejidad</th>
                        <th>Total</th>
                        <th>Cerrados</th>
                        <th>Cumplidos</th>
                        <th>Vencidos</th>
                        <th>En riesgo</th>
                        <th>% Cumplimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sla.map((row, i) => (
                        <tr key={i}>
                          <td>{row.area}</td>
                          <td>{row.complejidad}</td>
                          <td>{row.total}</td>
                          <td>{row.cerrados}</td>
                          <td>{row.cumplidos}</td>
                          <td>{row.vencidos}</td>
                          <td>{row.en_riesgo}</td>
                          <td>
                            <span className={`reportes-badge ${row.porcentaje_cumplimiento >= 80 ? 'reportes-badge--good' : row.porcentaje_cumplimiento >= 60 ? 'reportes-badge--warn' : 'reportes-badge--bad'}`}>
                              {row.porcentaje_cumplimiento}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          ) : estimacion.length === 0 ? (
            <div className="reportes-empty">No hay datos de estimación disponibles.</div>
          ) : (
            <div className="reportes-table-wrap">
              <table className="reportes-table">
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Complejidad</th>
                    <th>Proyectos</th>
                    <th>Prom. Estimado (h)</th>
                    <th>Prom. Invertido (h)</th>
                    <th>Desviación</th>
                  </tr>
                </thead>
                <tbody>
                  {estimacion.map((row, i) => (
                    <tr key={i}>
                      <td>{row.area}</td>
                      <td>{row.complejidad}</td>
                      <td>{row.total_proyectos}</td>
                      <td>{row.promedio_estimado}</td>
                      <td>{row.promedio_invertido}</td>
                      <td>
                        <span className={`reportes-badge ${Math.abs(row.desviacion_pct) <= 10 ? 'reportes-badge--good' : Math.abs(row.desviacion_pct) <= 25 ? 'reportes-badge--warn' : 'reportes-badge--bad'}`}>
                          {row.desviacion_pct > 0 ? '+' : ''}{row.desviacion_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
