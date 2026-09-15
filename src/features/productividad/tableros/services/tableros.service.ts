import { api } from '@/lib/api';
import type {
  DetalleTablero,
  TableroResumen,
  CrearTableroDto,
  MovimientoLista,
  MovimientoTarjeta,
} from '@/types/productividad.types';

function unwrap<T = any>(res: any): T {
  // Intentamos diferentes niveles donde Axios o tu cliente HTTP pueda haber puesto los datos
  return (res?.data?.response?.data ?? res?.data?.data ?? res?.data ?? res) as T;
}

export const tablerosService = {
  listar: async (idAreas?: number[]) => {
    const query = idAreas && idAreas.length > 0 ? `?areas=${idAreas.join(',')}` : '';
    const res = await api.get(`/tableros${query}`);
    return unwrap<TableroResumen[]>(res);
  },

  detalle: async (id: number) => {
    const res = await api.get(`/tableros/${id}`);
    console.log('🔍 [tablerosService.detalle] Respuesta cruda del API:', res);
    
    const data = unwrap<DetalleTablero>(res);
    console.log('🔍 [tablerosService.detalle] Data después de unwrap:', data);
    
    // Protección contra undefined: usamos || [] para que map nunca falle
    return {
      ...data,
      listas: (data?.listas || []).map((l: any) => ({
        ...l,
        tarjetas: (l?.tarjetas || []).map((t: any) => ({ 
          ...t, 
          id: Number(t.id) 
        })),
      })),
    };
  },

  crear: async (dto: CrearTableroDto) => {
    const res = await api.post(`/tableros`, dto);
    return unwrap(res);
  },

  moverTarjetas: async (_idTablero: number, movimientos: MovimientoTarjeta[]) => {
    if (movimientos.length > 0) {
      const mov = movimientos[0];
      const res = await api.patch(`/tableros/tickets/${mov.id_ticket}/mover`, { 
        id_lista: mov.id_lista 
      });
      return unwrap(res);
    }
    return Promise.resolve();
  },

  reordenarListas: async (idTablero: number, movimientos: MovimientoLista[]) => {
    const res = await api.patch(`/tableros/${idTablero}/listas/reorder`, movimientos);
    return unwrap(res);
  },
} as const;
