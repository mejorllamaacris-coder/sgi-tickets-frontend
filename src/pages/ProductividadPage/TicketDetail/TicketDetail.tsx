import { useEffect, useState } from 'react';
import { X, Send, Clock, User, MessageSquare, Info, History } from 'lucide-react';
import { useTicketDetail } from '@/features/productividad/tickets/hooks/useTicketDetail';
import { ticketsService } from '@/features/productividad/tickets/services/tickets.service';
import type { Comentario, Historial, Ticket } from '@/types/productividad.types';
import './TicketDetail.css';

interface TicketDetailProps {
  ticketId: number | null;
  currentUserId?: number | string | null;
  currentAreaId?: number | null;
  onAsignadoChange?: (ticket: Ticket) => void;
  onClose: () => void;
}

type TabId = 'info' | 'historial' | 'comentarios';

interface UsuarioAsignable {
  id: number;
  nombre: string;
}

export function TicketDetail({ ticketId, currentUserId, currentAreaId, onAsignadoChange, onClose }: TicketDetailProps) {
  const {
    ticket, historial, comentarios, loading, enviandoComentario,
    cargar, actualizarAsignado, refrescarHistorial, agregarComentario, cerrar,
  } = useTicketDetail();

  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [esInterno, setEsInterno] = useState(false);
  const [usuariosAsignables, setUsuariosAsignables] = useState<UsuarioAsignable[]>([]);
  const [asignandoTicket, setAsignandoTicket] = useState(false);

  useEffect(() => {
    if (ticketId) {
      cargar(ticketId);
      setActiveTab('info');
      setNuevoComentario('');
      setEsInterno(false);
    }
  }, [ticketId, cargar]);

  useEffect(() => {
    if (ticket?.id_area) {
      ticketsService.tickets
        .listarAsignables(ticket.id_area)
        .then((res: any) => setUsuariosAsignables(Array.isArray(res) ? res : []))
        .catch(() => setUsuariosAsignables([]));
    }
  }, [ticket?.id_area]);

  useEffect(() => {
    if (!ticketId) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [ticketId]);

  const handleClose = () => {
    cerrar();
    onClose();
  };

  const handleEnviarComentario = async () => {
    if (!ticket || !nuevoComentario.trim()) return;
    try {
      await agregarComentario(ticket.id, { contenido: nuevoComentario.trim(), es_interno: esInterno });
      setNuevoComentario('');
      setEsInterno(false);
    } catch {
      // el hook ya muestra el toast
    }
  };

  const handleAsignar = async (idAsignado: number | null) => {
    if (!ticket) return;
    const anterior = { id: ticket.id_asignado, nombre: ticket.usuario_asignado?.nombre ?? null };
    const nuevo = idAsignado ? usuariosAsignables.find(u => u.id === idAsignado) : null;

    actualizarAsignado(idAsignado, nuevo?.nombre ?? null);
    setAsignandoTicket(true);

    try {
      await ticketsService.tickets.asignar(ticket.id, idAsignado);
      await refrescarHistorial(ticket.id);
      if (onAsignadoChange) {
        onAsignadoChange({ ...ticket, id_asignado: idAsignado, usuario_asignado: nuevo ? { id: idAsignado!, nombre: nuevo.nombre } : null });
      }
    } catch (error: any) {
      actualizarAsignado(anterior.id ?? null, anterior.nombre ?? null);
      const msg = error?.response?.data?.message || 'Error al asignar';
      alert(typeof msg === 'string' ? msg : 'Error al asignar el ticket');
    } finally {
      setAsignandoTicket(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTipoBadge = (tipo: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      creado: { label: 'Creación', cls: 'prd-tipo--creado' },
      cambio_estado: { label: 'Cambio de estado', cls: 'prd-tipo--estado' },
      edicion: { label: 'Edición', cls: 'prd-tipo--edicion' },
      asignacion: { label: 'Asignación', cls: 'prd-tipo--asignacion' },
      promocion: { label: 'Promoción', cls: 'prd-tipo--promocion' },
    };
    return map[tipo] || { label: tipo, cls: '' };
  };

  if (!ticketId) return null;

  const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
  const ticketAsignadoNum = ticket?.id_asignado ? Number(ticket.id_asignado) : null;
  const currentAreaIdNum = currentAreaId ? Number(currentAreaId) : null;
  
  // Validación simple: solo si el área del ticket coincide con tu área
  const ticketEsDeMiArea = !!(currentAreaIdNum && ticket?.id_area && Number(ticket.id_area) === currentAreaIdNum);

  return (
    <>
      <div className="prd-drawer-backdrop" onClick={handleClose} />
      <aside className="prd-drawer">
        <header className="prd-drawer__header">
          <div className="prd-drawer__title-block">
            <h3 className="prd-drawer__codigo">{ticket?.codigo || '...'}</h3>
            <p className="prd-drawer__titulo">{loading ? 'Cargando...' : ticket?.titulo}</p>
          </div>
          <button className="prd-drawer__close" onClick={handleClose} title="Cerrar">
            <X size={18} />
          </button>
        </header>

        {!loading && ticket && (
          <div className="prd-drawer__pills">
            {ticket.estado_nombre && (
              <span className={`prd-pill prd-pill--estado prd-pill--estado-${ticket.estado_tipo}`}>{ticket.estado_nombre}</span>
            )}
            <span className={`prd-pill prd-pill--tipo prd-pill--${ticket.tipo}`}>{ticket.tipo}</span>
            {ticket.complejidad_nombre && (
              <span className="prd-pill prd-pill--complejidad" style={{ backgroundColor: ticket.complejidad_color || '#6c757d' }}>{ticket.complejidad_nombre}</span>
            )}
          </div>
        )}

        <nav className="prd-drawer__tabs">
          <button className={`prd-tab ${activeTab === 'info' ? 'prd-tab--active' : ''}`} onClick={() => setActiveTab('info')}>
            <Info size={14} /> Info
          </button>
          <button className={`prd-tab ${activeTab === 'historial' ? 'prd-tab--active' : ''}`} onClick={() => setActiveTab('historial')}>
            <History size={14} /> Historial ({historial.length})
          </button>
          <button className={`prd-tab ${activeTab === 'comentarios' ? 'prd-tab--active' : ''}`} onClick={() => setActiveTab('comentarios')}>
            <MessageSquare size={14} /> Comentarios ({comentarios.length})
          </button>
        </nav>

        <div className="prd-drawer__body">
          {loading ? (
            <div className="prd-drawer__loading"><div className="prd-spinner" /><span>Cargando detalle...</span></div>
          ) : !ticket ? (
            <div className="prd-drawer__empty">No se pudo cargar el ticket.</div>
          ) : (
            <>
              {activeTab === 'info' && (
                <div className="prd-tab-info">
                  <section className="prd-info-section">
                    <h4 className="prd-info-section__title">Descripción</h4>
                    <p className="prd-info-section__text">{ticket.descripcion || 'Sin descripción'}</p>
                  </section>

                  <section className="prd-info-section">
                    <h4 className="prd-info-section__title">Asignación</h4>
                    <div className="prd-asignacion">
                      <select
                        className="prd-select"
                        value={ticketAsignadoNum || ''}
                        onChange={(e) => handleAsignar(e.target.value ? Number(e.target.value) : null)}
                        disabled={asignandoTicket}
                      >
                        <option value="">Sin asignar</option>
                        {usuariosAsignables.map((u) => (
                          <option key={u.id} value={u.id}>{u.nombre}</option>
                        ))}
                      </select>
                      {asignandoTicket && <span className="prd-asignacion__loading">...</span>}
                    </div>

                    {currentUserIdNum && ticketEsDeMiArea && (
                      <div className="prd-asignacion__acciones" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        {ticketAsignadoNum !== currentUserIdNum && (
                          <button
                            type="button"
                            className="prd-btn prd-btn--ghost prd-btn--sm"
                            onClick={() => handleAsignar(currentUserIdNum)}
                            disabled={asignandoTicket}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <User size={12} /> Asignarme
                          </button>
                        )}
                        {ticketAsignadoNum === currentUserIdNum && (
                          <button
                            type="button"
                            className="prd-btn prd-btn--ghost prd-btn--sm prd-btn--danger-ghost"
                            onClick={() => handleAsignar(null)}
                            disabled={asignandoTicket}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <X size={12} /> Desasignarme
                          </button>
                        )}
                      </div>
                    )}
                  </section>

                  <section className="prd-info-section">
                    <h4 className="prd-info-section__title">Detalles</h4>
                    <dl className="prd-info-grid">
                      <dt>Código</dt><dd>{ticket.codigo}</dd>
                      <dt>Tipo</dt><dd className="prd-capitalize">{ticket.tipo}</dd>
                      <dt>Área origen</dt><dd>{ticket.area_origen_nombre || '—'}</dd>
                      <dt>Área destino</dt><dd>{ticket.area_nombre || '—'}</dd>
                      {ticket.categoria_nombre && (<><dt>Categoría</dt><dd>{ticket.categoria_nombre}</dd></>)}
                      <dt>Creado por</dt><dd>{ticket.usuario_creador?.nombre || '—'}</dd>
                      <dt>SLA</dt><dd>{ticket.sla_horas}h</dd>
                      <dt>Fecha límite</dt><dd>{formatDate(ticket.fecha_limite)}</dd>
                      <dt>Fecha creación</dt><dd>{formatDate(ticket.fecha_creacion)}</dd>
                      {ticket.fecha_cierre && (<><dt>Fecha cierre</dt><dd>{formatDate(ticket.fecha_cierre)}</dd></>)}
                    </dl>
                  </section>
                </div>
              )}

              {activeTab === 'historial' && (
                <div className="prd-tab-historial">
                  {historial.length === 0 ? (
                    <div className="prd-tab-empty">Sin historial todavía.</div>
                  ) : (
                    <ul className="prd-timeline">
                      {historial.map((h: Historial) => {
                        const badge = getTipoBadge(h.accion);
                        return (
                          <li key={h.id} className="prd-timeline__item">
                            <div className="prd-timeline__dot" />
                            <div className="prd-timeline__body">
                              <div className="prd-timeline__header">
                                <span className={`prd-tipo-badge ${badge.cls}`}>{badge.label}</span>
                                {h.campo && <span className="prd-timeline__campo">{h.campo}</span>}
                              </div>
                              <div className="prd-timeline__meta">
                                <User size={12} /><span>{h.usuario_nombre}</span>
                                <Clock size={12} /><span>{formatDate(h.fecha)}</span>
                              </div>
                              {(h.valor_anterior !== null || h.valor_nuevo !== null) && (
                                <div className="prd-timeline__valores">
                                  {h.valor_anterior !== null && <span className="prd-timeline__valor prd-timeline__valor--anterior">{h.valor_anterior || '—'}</span>}
                                  {(h.valor_anterior !== null && h.valor_nuevo !== null) && <span className="prd-timeline__arrow">→</span>}
                                  {h.valor_nuevo !== null && <span className="prd-timeline__valor prd-timeline__valor--nuevo">{h.valor_nuevo || '—'}</span>}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'comentarios' && (
                <div className="prd-tab-comentarios">
                  <div className="prd-comentarios__lista">
                    {comentarios.length === 0 ? (
                      <div className="prd-tab-empty">Sin comentarios todavía. ¡Sé el primero!</div>
                    ) : (
                      comentarios.map((c: Comentario) => (
                        <article key={c.id} className={`prd-comentario ${c.es_interno ? 'prd-comentario--interno' : ''}`}>
                          <header className="prd-comentario__header">
                            <div className="prd-comentario__avatar">{(c.usuario_nombre || '?').charAt(0).toUpperCase()}</div>
                            <div className="prd-comentario__meta">
                              <strong>{c.usuario_nombre || 'Usuario'}</strong>
                              <time>{formatDate(c.fecha_creacion)}</time>
                            </div>
                            {c.es_interno && <span className="prd-comentario__badge-interno">Interno</span>}
                          </header>
                          <div className="prd-comentario__contenido">{c.contenido}</div>
                        </article>
                      ))
                    )}
                  </div>

                  <div className="prd-comentarios__input">
                    <textarea
                      className="prd-comentarios__textarea"
                      placeholder="Escribe un comentario..."
                      value={nuevoComentario}
                      onChange={e => setNuevoComentario(e.target.value)}
                      rows={3}
                      disabled={enviandoComentario}
                    />
                    <div className="prd-comentarios__actions">
                      <label className="prd-comentarios__check">
                        <input type="checkbox" checked={esInterno} onChange={e => setEsInterno(e.target.checked)} disabled={enviandoComentario} />
                        <span>Comentario interno</span>
                      </label>
                      <button className="prd-btn prd-btn--primary" onClick={handleEnviarComentario} disabled={!nuevoComentario.trim() || enviandoComentario}>
                        <Send size={14} /> {enviandoComentario ? 'Enviando...' : 'Enviar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}