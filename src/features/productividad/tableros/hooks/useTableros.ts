import { useState, useCallback, useEffect } from 'react';
import { notify } from '@/shared/lib/notify';
import { tablerosService } from '../services/tableros.service';
import { usePermisoModulo } from '@/shared/hooks/usePermisoModulo';
import type {
  TableroResumen,
  DetalleTablero,
  MovimientoTarjeta,
  MovimientoLista,
} from '@/types/productividad.types';

function mensajeError(err: unknown, fallback: string): string {
  const e = err as any;
  const msg = e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

export function useTableros() {
  const { idArea, esAdmin } = usePermisoModulo('Productividad');
  
  const [tableros, setTableros] = useState<TableroResumen[]>([]);
  const [tableroActual, setTableroActual] = useState<DetalleTablero | null>(null);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [moviendo, setMoviendo] = useState(false);

  const cargarLista = useCallback(async () => {
    setCargandoLista(true);
    try {
      const areasAFiltrar = esAdmin ? undefined : (idArea ? [idArea] : undefined);
      console.log('🔍 [useTableros] Cargando lista con filtro:', areasAFiltrar);
      
      const lista = await tablerosService.listar(areasAFiltrar);
      const arr = Array.isArray(lista) ? lista : [];
      console.log('✅ [useTableros] Lista de tableros recibida:', arr);
      setTableros(arr);
      
      if (arr.length > 0 && idSeleccionado === null) {
        console.log('🎯 [useTableros] Auto-seleccionando tablero ID:', arr[0].id);
        setIdSeleccionado(arr[0].id);
      }
    } catch (err) {
      console.error('❌ [useTableros] Error cargando lista:', err);
      notify.error('No se pudieron cargar los tableros');
    } finally {
      setCargandoLista(false);
    }
  }, [idSeleccionado, idArea, esAdmin]);

  useEffect(() => { cargarLista(); }, [cargarLista]);

  const cargarDetalle = useCallback(async (id: number, opts?: { silent?: boolean }) => {
    if (!opts?.silent) setCargandoDetalle(true);
    try {
      console.log('🔍 [useTableros] Cargando detalle del tablero ID:', id);
      const detalle = await tablerosService.detalle(id);
      console.log('✅ [useTableros] Detalle recibido:', detalle);
      setTableroActual(detalle);
    } catch (err) {
      console.error('❌ [useTableros] Error cargando detalle:', err);
      notify.error('No se pudo cargar el tablero');
      setTableroActual(null);
    } finally {
      if (!opts?.silent) setCargandoDetalle(false);
    }
  }, []);

  useEffect(() => {
    if (idSeleccionado !== null) {
      cargarDetalle(idSeleccionado);
    } else {
      setTableroActual(null);
    }
  }, [idSeleccionado, cargarDetalle]);

  const seleccionarTablero = useCallback((id: number) => {
    setIdSeleccionado(id);
  }, []);

  const moverTarjeta = useCallback(async (
    idTicket: number,
    idListaDestino: number,
    ordenDestino: number,
  ) => {
    if (idSeleccionado === null || !tableroActual) return;

    const tarjetaMovida = tableroActual.listas
      .flatMap(l => l.tarjetas)
      .find(t => t.id === idTicket);
    if (!tarjetaMovida) return;

    setTableroActual(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        listas: prev.listas.map(lista => {
          const sinTarjeta = lista.tarjetas.filter(t => t.id !== idTicket);
          if (lista.id === idListaDestino) {
            return {
              ...lista,
              tarjetas: [...sinTarjeta, { ...tarjetaMovida, orden_en_lista: ordenDestino }],
            };
          }
          return { ...lista, tarjetas: sinTarjeta };
        }),
      };
    });

    try {
      await tablerosService.moverTarjetas(idSeleccionado, [{
        id_ticket: idTicket,
        id_lista: idListaDestino,
        orden: ordenDestino,
      }]);
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo mover la tarjeta'));
      await cargarDetalle(idSeleccionado, { silent: true });
    }
  }, [idSeleccionado, tableroActual, cargarDetalle]);

  const reordenarListas = useCallback(async (movimientos: MovimientoLista[]) => {
    if (idSeleccionado === null) return;
    setMoviendo(true);
    try {
      await tablerosService.reordenarListas(idSeleccionado, movimientos);
      await cargarDetalle(idSeleccionado);
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudieron reordenar las listas'));
    } finally {
      setMoviendo(false);
    }
  }, [idSeleccionado, cargarDetalle]);

  const recargar = useCallback(async () => {
    if (idSeleccionado !== null) {
      await cargarDetalle(idSeleccionado);
    }
  }, [idSeleccionado, cargarDetalle]);

  return {
    tableros,
    tableroActual,
    idSeleccionado,
    cargandoLista,
    cargandoDetalle,
    moviendo,
    seleccionarTablero,
    moverTarjeta,
    reordenarListas,
    recargar,
  };
}
