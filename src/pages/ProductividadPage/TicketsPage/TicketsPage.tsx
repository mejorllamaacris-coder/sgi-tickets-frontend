import { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Plus, Search } from 'lucide-react';
import { useTickets } from '@/features/productividad/tickets/hooks/useTickets';
import { useCatalogos } from '@/features/productividad/catalogos/hooks/useCatalogos';
import { usePermisoModulo } from '@/shared/hooks/usePermisoModulo';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { Pagination } from '@/shared/ui/Pagination/Pagination';
import { TicketsTable } from '@/features/productividad/tickets/components/TicketsTable';
import { MisTicketsFeed } from '@/features/productividad/tickets/components/MisTicketsFeed'; // ← NUEVO IMPORT
import { TicketDialog, type TicketFormData, type TicketDialogMode } from '@/features/productividad/tickets/components/TicketDialog';
import { TicketDetail } from '../TicketDetail/TicketDetail';
import type { Ticket } from '@/types/productividad.types';
import './TicketsPage.css';

export function TicketsPage() {
  const { session } = useAuth();
  const currentUserId = session?.usuario?.[0]?.id ?? null;

  const {
    tickets, meta, totalEnviados, totalResolver, cargando,
    setFiltros, irAPagina, cargarTickets,
    crearTicket, editarTicket,
  } = useTickets();
  const { estados, complejidades, categorias, areas, cargando: cargandoCatalogos } = useCatalogos();
  const { idArea, puedeLeer, puedeEditar, esAdmin } = usePermisoModulo('Productividad');

  const [activeTab, setActiveTab] = useState<'resolver' | 'enviados'>('resolver');
  const [search, setSearch] = useState('');
  const [fEstado, setFEstado] = useState('all');
  const [fTipo, setFTipo] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<TicketDialogMode>('crear');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const primeraCarga = useRef(true);
  useEffect(() => {
    if (primeraCarga.current) { primeraCarga.current = false; return; }
    const t = setTimeout(() => {
      setFiltros(f => ({ ...f, busqueda: search.trim() || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [search, setFiltros]);

  const onEstado = (v: string) => {
    setFEstado(v);
    setFiltros(f => ({ ...f, estados: v === 'all' ? undefined : v, page: 1 }));
  };

  const onTipo = (v: string) => {
    setFTipo(v);
    setFiltros(f => ({ ...f, tipos: v === 'all' ? undefined : v, page: 1 }));
  };

  const loading = (cargando && tickets.length === 0) || cargandoCatalogos;

  const ticketsActivos = tickets;

  const openCrear = useCallback(() => {
    setSelectedTicket(null);
    setDialogMode('crear');
    setDialogOpen(true);
  }, []);

  const openEditar = useCallback((t: Ticket) => {
    setSelectedTicket(t);
    setDialogMode('editar');
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTicket(null);
    setSaving(false);
  }, []);

  const handleSubmitDialog = useCallback(async (data: any) => {
    const payload = {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion?.trim() || undefined,
      id_complejidad: Number(data.id_complejidad),
      id_categoria: data.id_categoria ? Number(data.id_categoria) : undefined,
      id_asignado: data.id_asignado ? Number(data.id_asignado) : undefined,
    };

    setSaving(true);
    try {
      if (dialogMode === 'crear') {
        await crearTicket({ ...payload, id_area: Number(data.id_area) });
      } else if (selectedTicket) {
        await editarTicket(selectedTicket.id, payload);
      }
      closeDialog();
    } catch {
      // El hook ya muestra el toast
    } finally {
      setSaving(false);
    }
  }, [dialogMode, selectedTicket, idArea, crearTicket, editarTicket, closeDialog]);

  const handleAsignadoChange = useCallback(() => {
    cargarTickets();
  }, [cargarTickets]);

  return (
    <div className="prd-page">
      <div className="prd-header">
        <div>
          <h2 className="prd-title">Tickets</h2>
          <p className="prd-sub">Gestiona los tickets de soporte y proyectos</p>
        </div>
      </div>

      {!esAdmin && (
        <div className="prd-tabs">
          <button
            className={`prd-tab ${activeTab === 'resolver' ? 'prd-tab--active' : ''}`}
            onClick={() => { setActiveTab('resolver'); setFiltros(f => ({ ...f, vista: 'resolver', page: 1 })); }}
          >
            Por resolver
            <span className="prd-tab__badge">{totalResolver ?? '—'}</span>
          </button>
          <button
            className={`prd-tab ${activeTab === 'enviados' ? 'prd-tab--active' : ''}`}
            onClick={() => { setActiveTab('enviados'); setFiltros(f => ({ ...f, vista: 'enviados', page: 1 })); }}
          >
            Enviados
            <span className="prd-tab__badge">{totalEnviados ?? '—'}</span>
          </button>
        </div>
      )}

      <div className="prd-table-wrap">
        <div className="prd-table-toolbar">
          <span className="prd-table-count">{esAdmin ? meta.total : ticketsActivos.length} ticket{(esAdmin ? meta.total : ticketsActivos.length) !== 1 ? 's' : ''}</span>
          <div className="prd-table-actions">
            <button className="prd-btn prd-btn--ghost" onClick={cargarTickets} title="Actualizar">
              <RefreshCw size={15} />
            </button>
            {puedeLeer && (
              <button className="prd-btn prd-btn--primary" onClick={openCrear}>
                <Plus size={15} /> Nuevo ticket
              </button>
            )}
          </div>
        </div>

        <div className="prd-filters">
          <div className="prd-search">
            <Search size={14} className="prd-search__icon" />
            <input
              type="text"
              placeholder="Buscar por título o código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="prd-search__input"
            />
          </div>
          <select className="prd-filter-select" value={fEstado} onChange={e => onEstado(e.target.value)}>
            <option value="all">Todos los estados</option>
            {estados.map(e => <option key={e.id} value={String(e.id)}>{e.nombre}</option>)}
          </select>
          <select className="prd-filter-select" value={fTipo} onChange={e => onTipo(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="soporte">Soporte</option>
            <option value="proyecto">Proyecto</option>
          </select>
        </div>

        {/* ── RENDERIZADO CONDICIONAL SEGÚN ROL ── */}
        {loading ? (
          <div className="prd-skeleton">
            {[...Array(5)].map((_, i) => <div key={i} className="prd-skeleton__row" />)}
          </div>
        ) : ticketsActivos.length === 0 ? (
          <div className="prd-empty">No hay tickets que coincidan.</div>
        ) : esAdmin ? (
          // Vista de Admin: Tabla completa con paginación
          <>
            <TicketsTable
              tickets={tickets}
              estados={estados}
              complejidades={complejidades}
              onVer={t => setDetailId(t.id)}
              onEditar={openEditar}
              puedeEditar={puedeEditar}
            />
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onNext={() => irAPagina(meta.page + 1)}
              onPrev={() => irAPagina(meta.page - 1)}
              onGoTo={irAPagina}
            />
          </>
        ) : (
          // Vista de Usuario Común: Feed de tarjetas limpio
          <>
            <MisTicketsFeed
              tickets={ticketsActivos}
              mostrarArea={activeTab === 'enviados' ? 'destino' : undefined}
              estados={estados}
              complejidades={complejidades}
              onVer={t => setDetailId(t.id)}
            />
            {meta.totalPages > 1 && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onNext={() => irAPagina(meta.page + 1)}
                onPrev={() => irAPagina(meta.page - 1)}
                onGoTo={irAPagina}
              />
            )}
          </>
        )}
      </div>

      <TicketDetail 
        ticketId={detailId} 
        currentUserId={currentUserId}
        currentAreaId={idArea}
        esAdmin={esAdmin}
        onAsignadoChange={handleAsignadoChange}
        onClose={() => setDetailId(null)} 
      />

      <TicketDialog
        open={dialogOpen}
        mode={dialogMode}
        selected={selectedTicket}
        complejidades={complejidades}
        categorias={categorias}
        areas={areas}
        idAreaUsuario={idArea}
        esAdmin={esAdmin}
        saving={saving}
        onClose={closeDialog}
        onSubmit={handleSubmitDialog}
      />
    </div>
  );
}