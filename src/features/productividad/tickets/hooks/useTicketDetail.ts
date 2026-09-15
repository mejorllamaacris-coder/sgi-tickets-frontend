// src/features/productividad/tickets/hooks/useTicketDetail.ts

import { useState, useCallback } from 'react';
import { notify } from '@/shared/lib/notify';
import { ticketsService } from '../services/tickets.service';
import type {
  Ticket,
  Historial,
  Comentario,
  AgregarComentarioDto,
} from '@/types/productividad.types';

function mensajeError(err: unknown, fallback: string): string {
  const e = err as any;
  const msg = e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

export function useTicketDetail() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const cargar = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const [detalle, hist, coms] = await Promise.all([
        ticketsService.tickets.obtenerDetalle(id),
        ticketsService.tickets.obtenerHistorial(id),
        ticketsService.comentarios.obtener(id),
      ]);
      setTicket(detalle);
      setHistorial(Array.isArray(hist) ? hist : []);
      setComentarios(Array.isArray(coms) ? coms : []);
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo cargar el detalle del ticket'));
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── OPTIMISTIC: solo actualiza los campos de asignación, sin refetch ──
  const actualizarAsignado = useCallback((idAsignado: number | null, asignadoNombre: string | null) => {
    setTicket(prev => prev ? { ...prev, id_asignado: idAsignado, usuario_asignado: idAsignado ? { id: idAsignado, nombre: asignadoNombre ?? '' } : null } : prev);
  }, []);

  // ── OPTIMISTIC: actualiza estado sin refetch ──
  const actualizarEstado = useCallback((idEstado: number, estadoNombre: string, estadoTipo: string) => {
    setTicket(prev => prev ? { ...prev, id_estado: idEstado, estado_nombre: estadoNombre, estado_tipo: estadoTipo as any } : prev);
  }, []);

  // ── Refetch SOLO del historial (barato, evita re-render cascada) ──
  const refrescarHistorial = useCallback(async (idTicket: number) => {
    try {
      const hist = await ticketsService.tickets.obtenerHistorial(idTicket);
      setHistorial(Array.isArray(hist) ? hist : []);
    } catch {
      // silencioso, el ticket ya se ve bien
    }
  }, []);

  const agregarComentario = useCallback(async (
    idTicket: number,
    data: AgregarComentarioDto,
  ) => {
    setEnviandoComentario(true);
    try {
      await ticketsService.comentarios.agregar(idTicket, data);
      notify.success('Comentario agregado');
      const coms = await ticketsService.comentarios.obtener(idTicket);
      setComentarios(Array.isArray(coms) ? coms : []);
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo agregar el comentario'));
      throw err;
    } finally {
      setEnviandoComentario(false);
    }
  }, []);

  const cerrar = useCallback(() => {
    setTicket(null);
    setHistorial([]);
    setComentarios([]);
  }, []);

  return {
    ticket,
    historial,
    comentarios,
    loading,
    enviandoComentario,
    cargar,
    actualizarEstado,
    actualizarAsignado,
    refrescarHistorial,
    agregarComentario,
    cerrar,
  };
}