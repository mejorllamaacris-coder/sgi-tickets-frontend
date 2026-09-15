import { api as httpClient } from '@/lib/api';
import type {
  Ticket,
  CrearTicketDto,
  EditarTicketDto,
  CambiarEstadoDto,
  AgregarComentarioDto,
  FiltrosTickets,
  MetaPaginacion,
} from '@/types/productividad.types';

const BASE = '/tickets';

function toQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

function unwrap(res: any): any {
  return res?.data?.response?.data ?? res?.data?.data ?? res?.data ?? res;
}

export const ticketsService = {
  tickets: {
    // Devuelve { data, meta } tal como lo envía el backend (paginación server-side)
    listar: async (filtros?: FiltrosTickets) => {
      const res: any = await httpClient.get(`${BASE}${toQuery(filtros ?? {})}`);

      // El httpClient ya hace unwrap: devuelve {data: [...], meta: {...}}
      if (res && !Array.isArray(res) && res.data && res.meta) {
        return {
          data: res.data as Ticket[],
          meta: res.meta as MetaPaginacion,
        };
      }

      // Fallback para otros formatos (por si el backend cambia)
      const body: any = res?.data?.response ?? res?.data ?? res;
      return {
        data: (Array.isArray(body) ? body : (body?.data ?? [])) as Ticket[],
        meta: (body?.meta ?? null) as MetaPaginacion | null,
      };
    },
    obtenerDetalle: async (id: number) =>
      unwrap(await httpClient.get(`${BASE}/${id}`)),

    crear: async (data: CrearTicketDto) =>
      unwrap(await httpClient.post(`${BASE}`, data)),

    editar: async (id: number, data: EditarTicketDto) =>
      unwrap(await httpClient.patch(`${BASE}/${id}`, data)),

    cambiarEstado: async (id: number, data: CambiarEstadoDto) =>
      unwrap(await httpClient.patch(`${BASE}/${id}/estado`, data)),

    asignar: async (id: number, idAsignado: number | null) =>
      unwrap(await httpClient.patch(`${BASE}/${id}/asignar`, { id_asignado: idAsignado })),

    listarAsignables: async (idArea: number) =>
      unwrap(await httpClient.get(`${BASE}/asignables?area=${idArea}`)),

    promover: async (id: number) =>
      unwrap(await httpClient.post(`${BASE}/${id}/promover`)),

    eliminar: async (id: number) =>
      unwrap(await httpClient.patch(`${BASE}/${id}/eliminar`, {})),

    obtenerHistorial: async (id: number) =>
      unwrap(await httpClient.get(`${BASE}/${id}/historial`)),
  },

  comentarios: {
    agregar: async (id: number, data: AgregarComentarioDto) =>
      unwrap(await httpClient.post(`/comentarios`, { ...data, id_ticket: id })),

    obtener: async (id: number) =>
      unwrap(await httpClient.get(`/comentarios/ticket/${id}`)),
  },
} as const;