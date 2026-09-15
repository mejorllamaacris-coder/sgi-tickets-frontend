// src/types/productividad.types.ts

// ═══════════════════════════════════════════════════════════
// DTOs (Lo que el frontend ENVÍA al backend)
// ═══════════════════════════════════════════════════════════

export interface CrearTicketDto {
  titulo: string;
  descripcion?: string;
  id_area: number;
  id_complejidad: number;
  id_asignado?: number;
  id_categoria?: number;
}

export interface EditarTicketDto {
  titulo?: string;
  descripcion?: string;
  id_categoria?: number;
  id_complejidad?: number;
}

export interface CambiarEstadoDto {
  id_estado: number;
}

export interface AsignarTicketDto {
  id_asignado: number | null;
}

export interface AgregarComentarioDto {
  contenido: string;
  es_interno?: boolean;
  id_padre?: number;
}

export interface CrearCategoriaDto {
  nombre: string;
  id_area: number;
}

export interface CrearTableroDto {
  nombre: string;
  descripcion?: string;
  id_area: number;
}

// ═══════════════════════════════════════════════════════════
// Entidades (Lo que el backend DEVUELVE al frontend)
// ═══════════════════════════════════════════════════════════

export type TipoTicket = 'soporte' | 'proyecto';

export interface Ticket {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoTicket;
  id_area: number;
  id_creador: number;
  id_asignado: number | null;
  id_categoria: number | null;
  id_complejidad: number;
  id_estado: number;
  sla_horas: number;
  fecha_limite: string;
  estimacion_horas: number | null;
  horas_invertidas: number | null;
  id_tablero: number | null;
  id_lista: number | null;
  orden_en_lista: number | null;
  area_nombre?: string;
  area_origen_nombre?: string;
  usuario_creador?: { id: number; nombre: string; email?: string } | null;
  usuario_asignado?: { id: number; nombre: string; email?: string } | null;
  categoria_nombre?: string;
  estado_nombre?: string;
  estado_tipo?: string;
  complejidad_nombre?: string;
  complejidad_color?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_cierre: string | null;
}

export type TipoEstado = 'inicial' | 'progreso' | 'final';

export interface EstadoTicket {
  id: number;
  nombre: string;
  tipo: TipoEstado;
  orden: number;
}

export interface Complejidad {
  id: number;
  nombre: string;
  sla_horas: number;
  color: string | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  id_area: number;
  area_nombre?: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface Tablero {
  id: number;
  nombre: string;
  descripcion: string | null;
  id_area: number;
  fecha_creacion: string;
}
// ── Paginación y filtros (espejo del backend) ──
export interface MetaPaginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type FiltrosTickets = {
  areas?: string;
  estados?: string;
  tipos?: string;
  busqueda?: string;
  vencidos?: boolean;
  page?: number;
  limit?: number;
  vista?: 'resolver' | 'enviados';
};

export interface Comentario {
  id: number;
  contenido: string;
  es_interno: boolean;
  id_padre: number | null;
  id_usuario: number;
  usuario_nombre: string;
  fecha_creacion: string;
}
// ── Historial de ticket (auditoría) ──
export interface Historial {
  id: number;
  id_ticket: number;
  id_usuario: number;
  usuario_nombre: string;
  accion: string; // creado | cambio_estado | edicion | asignacion | promocion
  campo: string | null;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  fecha: string;
}

// ── Área (catálogo de empresa) ──
export interface Area {
  id: number;
  nombre: string;
}

// ═══════════════════════════════════════════════════════════
// KANBAN — Tableros, listas y tarjetas
// ═══════════════════════════════════════════════════════════

export interface TarjetaKanban {
  id: number;
  codigo: string;
  titulo: string;
  tipo: TipoTicket;
  id_estado: number;
  id_asignado: number | null;
  id_creador: number;
  id_complejidad: number;
  orden_en_lista: number;
  fecha_limite: string;
  estado_nombre: string;
  estado_tipo: TipoEstado;
  complejidad_nombre: string;
  complejidad_color: string | null;
  creador_nombre: string;
  asignado_nombre: string | null;
}

export interface ListaKanban {
  id: number;
  id_tablero: number;
  nombre: string;
  orden: number;
  es_final: boolean;
  wip_limit: number | null;
  total_tarjetas: string;
  tarjetas: TarjetaKanban[];
}

export interface MiembroTablero {
  id: number;
  id_usuario: number;
  usuario_nombre: string;
  rol: string;
  fecha_union: string;
}

export interface DetalleTablero {
  id: number;
  nombre: string;
  descripcion: string | null;
  id_area: number;
  activo: boolean;
  fecha_creacion: string;
  area_nombre: string;
  listas: ListaKanban[];
  miembros: MiembroTablero[];
}

export interface TableroResumen {
  id: number;
  nombre: string;
  descripcion: string | null;
  id_area: number;
  activo: boolean;
  fecha_creacion: string;
  total_listas: string;
  total_tarjetas: string;
  area_nombre: string;
}

// DTOs de movimiento kanban
export interface MovimientoLista {
  id: number;
  orden: number;
}

export interface MovimientoTarjeta {
  id_ticket: number;
  id_lista: number;
  orden: number;
}