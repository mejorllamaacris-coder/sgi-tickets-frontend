// src/features/productividad/tableros/components/KanbanCard.tsx

import { CircleUser, UserRoundX } from 'lucide-react';
import type { TarjetaKanban } from '@/types/productividad.types';

interface KanbanCardProps {
  tarjeta: TarjetaKanban;
  onDragStart: (idTicket: number) => void;
  onClick?: () => void;
}

export function KanbanCard({ tarjeta, onDragStart, onClick }: KanbanCardProps) {
    const vencida =
    tarjeta.estado_tipo !== 'final' && new Date(tarjeta.fecha_limite) < new Date();

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move';
        // Guarda el id para leerlo en el drop
        e.dataTransfer.setData('text/plain', String(tarjeta.id));
        onDragStart(tarjeta.id);
      }}
      onClick={onClick}
      className={`kanban-card ${vencida ? 'kanban-card--vencida' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'grab' }}
    >
      <div className="kanban-card__top">
        <span className="kanban-card__code">{tarjeta.codigo}</span>
        <span
          className="kanban-card__complejidad"
          style={{ background: tarjeta.complejidad_color || '#94a3b8' }}
        >
          {tarjeta.complejidad_nombre}
        </span>
      </div>

      <p className="kanban-card__titulo">{tarjeta.titulo}</p>

      <div className="kanban-card__bottom">
        <span className="kanban-card__estado">{tarjeta.estado_nombre}</span>
        {tarjeta.usuario_asignado?.nombre ? (
          <span className="kanban-card__asignado">
            <CircleUser size={12} /> {tarjeta.usuario_asignado?.nombre}
          </span>
        ) : (
          <span className="kanban-card__asignado kanban-card__asignado--vacio">
            <UserRoundX size={12} /> Sin asignar
          </span>
        )}
      </div>
    </div>
  );
}