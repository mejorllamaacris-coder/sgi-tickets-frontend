import { useState, useCallback, useEffect } from 'react';
import { notify } from '@/shared/lib/notify';
import { ticketsService } from '../services/tickets.service';
import { usePermisoModulo } from '@/shared/hooks/usePermisoModulo';
import type {
  Ticket, CrearTicketDto, EditarTicketDto, CambiarEstadoDto,
  AgregarComentarioDto, MetaPaginacion, FiltrosTickets,
} from '@/types/productividad.types';

const META_INICIAL: MetaPaginacion = { total: 0, page: 1, limit: 20, totalPages: 0 };

// Deja que los mensajes del backend lleguen a la UI tal cual
function mensajeError(err: unknown, fallback: string): string {
  const e = err as any;
  const msg = e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<MetaPaginacion>(META_INICIAL);
  const [cargando, setCargando] = useState(true);
  const [totalEnviados, setTotalEnviados] = useState<number | null>(null);
  const [totalResolver, setTotalResolver] = useState<number | null>(null);
  const [filtros, setFiltros] = useState<FiltrosTickets>({ vista: 'resolver' });

  const { areasFiltro, puedeCrear, puedeEditar, esAdmin } = usePermisoModulo('Productividad');

  const cargarTickets = useCallback(async () => {
    setCargando(true);
    try {
      const base: FiltrosTickets = {
        ...filtros,
        ...(areasFiltro.length > 0 ? { areas: areasFiltro.join(',') } : {}),
      };
      const [res, resOtra] = await Promise.all([
        ticketsService.tickets.listar(base),
        !esAdmin
          ? ticketsService.tickets.listar({ ...base, vista: base.vista === 'enviados' ? 'resolver' : 'enviados', limit: 1, page: 1 })
          : Promise.resolve(null),
      ]);
      setTickets(res.data);
      if (res.meta) setMeta(res.meta);
      if (!esAdmin && resOtra?.meta) {
        if (base.vista === 'enviados') {
          setTotalEnviados(res.meta?.total ?? null);
          setTotalResolver(resOtra.meta.total);
        } else {
          setTotalResolver(res.meta?.total ?? null);
          setTotalEnviados(resOtra.meta.total);
        }
      }
    } catch {
      notify.error('No se pudieron cargar los tickets');
      setTickets([]);
    } finally {
      setCargando(false);
    }
  }, [filtros, areasFiltro, esAdmin]);

  useEffect(() => { cargarTickets(); }, [cargarTickets]);

  const irAPagina = useCallback((page: number) => {
    setFiltros(f => ({ ...f, page }));
  }, []);

  const crearTicket = async (data: CrearTicketDto) => {
    try {
      await ticketsService.tickets.crear(data);
      notify.success('Ticket creado exitosamente');
      await cargarTickets();
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo crear el ticket'));
      throw err;
    }
  };

  const editarTicket = async (id: number, data: EditarTicketDto) => {
    try {
      await ticketsService.tickets.editar(id, data);
      notify.success('Ticket actualizado');
      await cargarTickets();
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo actualizar el ticket'));
      throw err;
    }
  };

  const cambiarEstado = async (id: number, data: CambiarEstadoDto) => {
    try {
      await ticketsService.tickets.cambiarEstado(id, data);
      notify.success('Estado actualizado');
      await cargarTickets();
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo cambiar el estado'));
      throw err;
    }
  };

  const asignarTicket = async (id: number, idAsignado: number | null) => {
    try {
      await ticketsService.tickets.asignar(id, idAsignado);
      notify.success('Ticket asignado');
      await cargarTickets();
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo asignar el ticket'));
      throw err;
    }
  };

  const agregarComentario = async (id: number, data: AgregarComentarioDto) => {
    try {
    await ticketsService.comentarios.agregar(id, data);
      notify.success('Comentario agregado');
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo agregar el comentario'));
      throw err;
    }
  };

  return {
    tickets,
    meta,
    cargando,
    totalEnviados,
    totalResolver,
    filtros,
    setFiltros,
    irAPagina,
    cargarTickets,
    crearTicket,
    editarTicket,
    cambiarEstado,
    asignarTicket,
    agregarComentario,
    puedeCrear,
    puedeEditar,
    esAdmin,
  };
}