import { api } from '@/lib/api';

// Placeholder: cuando agreguemos endpoints de métricas al backend
export const reportesService = {
  getResumen: (id_area?: number) =>
    api.get<any>(
      id_area ? `/reportes/resumen?id_area=${id_area}` : '/reportes/resumen'
    ),

  getTicketsPorEstado: (id_area?: number) =>
    api.get<any[]>(
      id_area ? `/reportes/por-estado?id_area=${id_area}` : '/reportes/por-estado'
    ),

  getTicketsPorUsuario: (id_area?: number) =>
    api.get<any[]>(
      id_area ? `/reportes/por-usuario?id_area=${id_area}` : '/reportes/por-usuario'
    ),
};
