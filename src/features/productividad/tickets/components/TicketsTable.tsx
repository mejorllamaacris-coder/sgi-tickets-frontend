// src/features/productividad/tickets/components/TicketsTable.tsx

import { Eye, Pencil } from 'lucide-react';
import type { Ticket, EstadoTicket, Complejidad } from '@/types/productividad.types';

interface Props {
  tickets: Ticket[];
  estados: EstadoTicket[];
  complejidades: Complejidad[];
  onVer: (t: Ticket) => void;
  onEditar: (t: Ticket) => void;
  puedeEditar?: boolean;
}

const ESTADO_PILL: Record<string, string> = {
  inicial: 'prd-pill prd-pill--info',
  progreso: 'prd-pill prd-pill--warn',
  final: 'prd-pill prd-pill--success',
};

// Colores determinísticos para los avatares (siempre el mismo color para el mismo nombre)
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];
const colorPara = (nombre: string): string => {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const inicialDe = (nombre: string): string => nombre.charAt(0).toUpperCase();

export function TicketsTable({ tickets, estados, complejidades, onVer, onEditar, puedeEditar = true }: Props) {
  const estadoById = new Map(estados.map(e => [e.id, e]));
  const compById = new Map(complejidades.map(c => [c.id, c]));

  const fmtFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  const estaVencido = (t: Ticket) => {
    const est = estadoById.get(t.id_estado);
    return est?.tipo !== 'final' && new Date(t.fecha_limite) < new Date();
  };

  return (
    <table className="prd-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Título</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Asignado</th>
          <th>Complejidad</th>
          <th>Fecha límite</th>
          <th className="prd-th--center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map(t => {
          const est = estadoById.get(t.id_estado);
          const comp = compById.get(t.id_complejidad);
          const tieneAsignado = !!(t.usuario_asignado?.nombre);
          
          return (
            <tr key={t.id}>
              <td><span className="prd-codigo">{t.codigo}</span></td>
              <td className="prd-titulo">{t.titulo}</td>
              <td>
                <span className={t.tipo === 'soporte' ? 'prd-pill prd-pill--contrast' : 'prd-pill prd-pill--info'}>
                  {t.tipo}
                </span>
              </td>
              <td>
                <span className={ESTADO_PILL[est?.tipo ?? 'inicial']}>
                  {est?.nombre ?? t.id_estado}
                </span>
              </td>
              
              {/* ── COLUMNA ASIGNADO CON AVATAR ── */}
              <td>
                {tieneAsignado ? (
                  <span className="prd-asignado" title={t.usuario_asignado?.nombre || ''}>
                    <span
                      className="prd-asignado__avatar"
                      style={{ backgroundColor: colorPara(t.usuario_asignado?.nombre || '') }}
                    >
                      {inicialDe(t.usuario_asignado?.nombre || '')}
                    </span>
                    <span className="prd-asignado__nombre">{t.usuario_asignado?.nombre}</span>
                  </span>
                ) : (
                  <span className="prd-asignado--vacio">Sin asignar</span>
                )}
              </td>
              
              <td>
                <span className="prd-comp">
                  <span className="prd-dot" style={{ background: comp?.color ?? '#9ca3af' }} />
                  {comp?.nombre ?? '—'}
                </span>
              </td>
              <td className={estaVencido(t) ? 'prd-fecha--vencida' : undefined}>
                {fmtFecha(t.fecha_limite)}
              </td>
              <td className="prd-td--center">
                <div className="prd-row-actions">
                  <button className="prd-icon-btn" title="Ver" onClick={() => onVer(t)}>
                    <Eye size={14} />
                  </button>
                  {puedeEditar && (
                    <button className="prd-icon-btn prd-icon-btn--info" title="Editar" onClick={() => onEditar(t)}>
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}