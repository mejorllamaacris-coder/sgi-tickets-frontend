// src/features/productividad/tickets/components/MisTicketsFeed.tsx

import { Eye } from 'lucide-react';
import type { Ticket, EstadoTicket, Complejidad } from '@/types/productividad.types';

interface Props {
  tickets: Ticket[];
  estados: EstadoTicket[];
  complejidades: Complejidad[];
  onVer: (t: Ticket) => void;
  mostrarArea?: 'origen' | 'destino' | 'ambas';
}

const ESTADO_COLORS: Record<string, string> = {
  inicial: 'bg-blue-100 text-blue-800',
  progreso: 'bg-yellow-100 text-yellow-800',
  final: 'bg-green-100 text-green-800',
};

// Colores determinísticos para avatares
const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];
const colorPara = (nombre: string): string => {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) hash = (hash * 31 + nombre.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const inicialDe = (nombre: string): string => nombre.charAt(0).toUpperCase();

export function MisTicketsFeed({ tickets, estados, complejidades, onVer, mostrarArea }: Props) {
  const estadoById = new Map(estados.map(e => [e.id, e]));
  const compById = new Map(complejidades.map(c => [c.id, c]));

  const fmtFecha = (iso: string) => {
    const d = new Date(iso);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    return esHoy ? 'Hoy' : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  const estaVencido = (t: Ticket) => {
    const est = estadoById.get(t.id_estado);
    return est?.tipo !== 'final' && new Date(t.fecha_limite) < new Date();
  };

  if (tickets.length === 0) {
    return (
      <div className="prd-empty">
        <div className="prd-empty__icon"></div>
        <p className="prd-empty__text">No tienes tickets asignados</p>
        <p className="prd-empty__hint">Los tickets que te asignen aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="mis-tickets-feed">
      {tickets.map(ticket => {
        const est = estadoById.get(ticket.id_estado);
        const comp = compById.get(ticket.id_complejidad);
        const tieneAsignado = !!(ticket.usuario_asignado?.nombre);
        const esVencido = estaVencido(ticket);

        return (
          <article
            key={ticket.id}
            className={`mis-ticket-card ${esVencido ? 'mis-ticket-card--vencido' : ''}`}
            onClick={() => onVer(ticket)}
          >
            <header className="mis-ticket-card__header">
              <span className="mis-ticket-card__codigo">{ticket.codigo}</span>
              <span className={`mis-ticket-card__estado ${ESTADO_COLORS[est?.tipo ?? 'inicial'] || 'bg-gray-100 text-gray-800'}`}>
                {est?.nombre ?? 'Nuevo'}
              </span>
            </header>

            <h3 className="mis-ticket-card__titulo">{ticket.titulo}</h3>

            <div className="mis-ticket-card__meta">
              {tieneAsignado ? (
                <div className="mis-ticket-card__asignado" title={ticket.usuario_asignado?.nombre ?? undefined}>
                  <span
                    className="mis-ticket-card__avatar"
                    style={{ backgroundColor: colorPara(ticket.usuario_asignado?.nombre || '') }}
                  >
                    {inicialDe(ticket.usuario_asignado?.nombre || '')}
                  </span>
                  <span className="mis-ticket-card__nombre">{ticket.usuario_asignado?.nombre}</span>
                </div>
              ) : (
                <span className="mis-ticket-card__sin-asignar">Sin asignar</span>
              )}
              
              <span className={`mis-ticket-card__tipo ${ticket.tipo === 'proyecto' ? 'mis-ticket-card__tipo--proyecto' : ''}`}>
                {ticket.tipo}
              </span>
            </div>

            <footer className="mis-ticket-card__footer">
              <div className="mis-ticket-card__info">
                <span className="mis-ticket-card__complejidad">
                  <span
                    className="mis-ticket-card__dot"
                    style={{ backgroundColor: comp?.color || '#9ca3af' }}
                  />
                  {comp?.nombre ?? '—'}
                </span>
                
                {mostrarArea === 'ambas' && (ticket.area_origen_nombre || ticket.area_nombre) && (
                  <span className="mis-ticket-card__area">
                    {ticket.area_origen_nombre !== ticket.area_nombre
                      ? `${ticket.area_origen_nombre} → ${ticket.area_nombre}`
                      : ticket.area_nombre}
                  </span>
                )}
                {mostrarArea === 'destino' && ticket.area_nombre && (
                  <span className="mis-ticket-card__area">{ticket.area_nombre}</span>
                )}
                {mostrarArea === 'origen' && ticket.area_origen_nombre && (
                  <span className="mis-ticket-card__area">{ticket.area_origen_nombre}</span>
                )}
                <span className={`mis-ticket-card__fecha ${esVencido ? 'mis-ticket-card__fecha--vencida' : ''}`}>
                  {fmtFecha(ticket.fecha_limite)}
                </span>
              </div>

              <div className="mis-ticket-card__acciones">
                <button
                  className="mis-ticket-card__btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVer(ticket);
                  }}
                  title="Ver detalles"
                >
                  <Eye size={14} />
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}