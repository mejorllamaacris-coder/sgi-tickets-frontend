import { api } from '@/lib/api';
import type {
  Area,
  EstadoTicket,
  Complejidad,
  Categoria,
} from '@/types/productividad.types';

function unwrap<T = any>(res: any): T {
  return (res?.data?.response?.data ?? res?.data?.data ?? res?.data ?? res) as T;
}

export const catalogosService = {
  estados: {
    listar: async () => {
      const res = await api.get('/tickets/estados');
      return unwrap<EstadoTicket[]>(res);
    },
  },
  complejidades: {
    listar: async () => {
      const res = await api.get('/tickets/complejidades');
      return unwrap<Complejidad[]>(res);
    },
  },
  categorias: {
    listar: async (id_area?: number) => {
      const url = id_area ? `/tickets/categorias?id_area=${id_area}` : '/tickets/categorias';
      const res = await api.get(url);
      return unwrap<Categoria[]>(res);
    },
  },
  areas: {
    listar: async () => {
      const res = await api.get('/tickets/areas');
      return unwrap<Area[]>(res);
    },
  },
};
