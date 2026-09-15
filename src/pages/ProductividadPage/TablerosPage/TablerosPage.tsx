// src/pages/ProductividadPage/TablerosPage/TablerosPage.tsx

import { RefreshCw, LayoutDashboard, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTableros } from '@/features/productividad/tableros/hooks/useTableros';
import { useCatalogos } from '@/features/productividad/catalogos/hooks/useCatalogos';
import { usePermisoModulo } from '@/shared/hooks/usePermisoModulo';
import { useAuth } from '@/features/auth/hooks/use-auth.hook'; // ← AGREGADO
import { KanbanBoard } from '@/features/productividad/tableros/components/KanbanBoard';
import { TicketDialog, type TicketFormData } from '@/features/productividad/tickets/components/TicketDialog';
import { CrearTableroDialog, type CrearTableroFormData } from '@/features/productividad/tableros/components/CrearTableroDialog';
import { TicketDetail } from '../TicketDetail/TicketDetail';
import { ticketsService } from '@/features/productividad/tickets/services/tickets.service';
import { tablerosService } from '@/features/productividad/tableros/services/tableros.service';
import { notify } from '@/shared/lib/notify';
import '../TicketsPage/TicketsPage.css';
import './TablerosPage.css';

export function TablerosPage() {
  const { session } = useAuth(); // ← AGREGADO
  const currentUserId = session?.usuario?.[0]?.id ?? null; // ← AGREGADO

  const {
    tableros,
    tableroActual,
    idSeleccionado,
    cargandoLista,
    cargandoDetalle,
    seleccionarTablero,
    recargar,
    moverTarjeta,
  } = useTableros();

  const [detailId, setDetailId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crearOpen, setCrearOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { complejidades, categorias, areas } = useCatalogos();
  const { idArea, esAdmin } = usePermisoModulo('Productividad');

  const openCrear = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSaving(false);
  }, []);

  const handleSubmitDialog = useCallback(async (data: any) => {
    if (!tableroActual) return;
    
    const payload = {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion?.trim() || undefined,
      id_complejidad: Number(data.id_complejidad),
      id_categoria: data.id_categoria ? Number(data.id_categoria) : undefined,
      id_asignado: data.id_asignado ? Number(data.id_asignado) : undefined, // ← AGREGADO: Soporte para asignar al crear desde el tablero
      id_area: tableroActual.id_area,
    };

    setSaving(true);
    try {
      await ticketsService.tickets.crear(payload);
      notify.success('Ticket creado. Aparecerá en Backlog.');
      closeDialog();
      recargar();
    } catch (err) {
      const e = err as any;
      const msg = e?.response?.data?.message;
      if (Array.isArray(msg)) notify.error(msg.join(', '));
      else if (typeof msg === 'string') notify.error(msg);
      else notify.error('No se pudo crear el ticket');
    } finally {
      setSaving(false);
    }
  }, [tableroActual, closeDialog, recargar]);

  const handleSubmitCrear = useCallback(async (data: CrearTableroFormData) => {
    setSaving(true);
    try {
      await tablerosService.crear({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || undefined,
        id_area: Number(data.id_area),
      });
      notify.success('Tablero creado');
      setCrearOpen(false);
      recargar();
    } catch (err) {
      const e = err as any;
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string') notify.error(msg);
      else notify.error('No se pudo crear el tablero');
    } finally {
      setSaving(false);
    }
  }, [recargar]);

  return (
    <div className="prd-page">
      <div className="prd-header">
        <div>
          <h2 className="prd-title">Tableros Kanban</h2>
          <p className="prd-sub">Visualiza y gestiona tickets en tableros por área</p>
        </div>
      </div>

      <div className="prd-table-wrap">
        <div className="prd-table-toolbar">
          {cargandoLista ? (
            <span className="prd-table-count">Cargando tableros...</span>
          ) : tableros.length === 0 ? (
            <span className="prd-table-count">No tienes tableros disponibles</span>
          ) : (
            <select
              className="prd-filter-select"
              value={idSeleccionado ?? ''}
              onChange={e => seleccionarTablero(Number(e.target.value))}
            >
              {tableros.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          )}

          <div className="prd-table-actions">
            <button
              className="prd-btn prd-btn--ghost"
              onClick={recargar}
              title="Actualizar tablero"
              disabled={cargandoDetalle || !idSeleccionado}
            >
              <RefreshCw size={15} className={cargandoDetalle ? 'prd-spin' : ''} />
            </button>
            {esAdmin && (
              <button
                className="prd-btn prd-btn--primary"
                onClick={() => setCrearOpen(true)}
                title="Crear tablero"
              >
                <Plus size={15} />
              </button>
            )}
            <button
              className="prd-btn prd-btn--primary"
              onClick={openCrear}
              disabled={!tableroActual}
            >
              <Plus size={15} /> Nuevo ticket
            </button>
          </div>
        </div>

        {cargandoLista ? (
          <div className="prd-skeleton">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="prd-skeleton__row" style={{ height: 120, marginBottom: 12 }} />
            ))}
          </div>
        ) : tableros.length === 0 ? (
          <div className="prd-empty">
            <LayoutDashboard size={32} />
            {esAdmin ? (
              <>
                <p>No hay tableros creados. Crea el primero.</p>
                <button className="prd-btn prd-btn--primary" onClick={() => setCrearOpen(true)} style={{ marginTop: 16 }}>
                  <Plus size={15} /> Crear tablero
                </button>
              </>
            ) : (
              <p>No tienes tableros asignados. Contacta a un administrador.</p>
            )}
          </div>
        ) : cargandoDetalle ? (
          <div className="prd-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="prd-skeleton__row" style={{ height: 200, marginBottom: 12 }} />
            ))}
          </div>
        ) : tableroActual ? (
          <div className="prd-kanban-info">
            <div className="prd-kanban-header">
              <h3>{tableroActual.nombre}</h3>
              {tableroActual.descripcion && (
                <p className="prd-kanban-desc">{tableroActual.descripcion}</p>
              )}
              <span className="prd-kanban-area">{tableroActual.area_nombre}</span>
            </div>
            <KanbanBoard
              listas={tableroActual.listas}
              onCardClick={id => setDetailId(id)}
              onDropTarjeta={(idTicket, idListaDestino) => {
                const listaDestino = tableroActual.listas.find(l => l.id === idListaDestino);
                const ordenDestino = (listaDestino?.tarjetas.length ?? 0) + 1;
                moverTarjeta(idTicket, idListaDestino, ordenDestino);
              }}
            />
          </div>
        ) : null}
      </div>

      {/* ← FIX: Se pasan las props necesarias para que el drawer funcione igual que en la vista de lista */}
      <TicketDetail 
        ticketId={detailId} 
        currentUserId={currentUserId}
        currentAreaId={idArea}
        onAsignadoChange={() => recargar()} // ← Esto actualiza el tablero en tiempo real al asignar
        onClose={() => setDetailId(null)} 
      />

      <TicketDialog
        open={dialogOpen}
        mode="crear"
        selected={null}
        complejidades={complejidades}
        categorias={categorias}
        areas={areas}
        idAreaUsuario={idArea}
        esAdmin={esAdmin}
        saving={saving}
        onClose={closeDialog}
        onSubmit={handleSubmitDialog}
      />

      <CrearTableroDialog
        open={crearOpen}
        areas={areas}
        saving={saving}
        onClose={() => setCrearOpen(false)}
        onSubmit={handleSubmitCrear}
      />
    </div>
  );
}