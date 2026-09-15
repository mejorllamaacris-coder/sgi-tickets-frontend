// src/features/productividad/tableros/components/KanbanBoard.tsx

import { useState } from 'react';
import type { ListaKanban } from '@/types/productividad.types';
import { KanbanCard } from './KanbanCard';

interface KanbanBoardProps {
  listas: ListaKanban[];
  onDropTarjeta?: (idTicket: number, idListaDestino: number) => void;
  onCardClick?: (idTicket: number) => void;
}

export function KanbanBoard({ listas, onDropTarjeta, onCardClick }: KanbanBoardProps) {
  const sorted = [...listas].sort((a, b) => a.orden - b.orden);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [draggingTicketId, setDraggingTicketId] = useState<number | null>(null);

  const handleDragStart = (idTicket: number) => {
    setDraggingTicketId(idTicket);
  };

  const handleDragOver = (e: React.DragEvent, idLista: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(idLista);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, idListaDestino: number) => {
    e.preventDefault();
    const idTicket = Number(e.dataTransfer.getData('text/plain'));
    setDragOverId(null);
    setDraggingTicketId(null);
    if (idTicket && onDropTarjeta) {
      onDropTarjeta(idTicket, idListaDestino);
    }
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    setDraggingTicketId(null);
  };

  // Calcular estado WIP de una columna
  const getWipStatus = (lista: ListaKanban) => {
    const actual = lista.tarjetas.length;
    const limite = lista.wip_limit;
    
    if (!limite) return { texto: `${actual}`, color: 'verde', porcentaje: 0 };
    
    const porcentaje = (actual / limite) * 100;
    
    if (porcentaje >= 100) return { texto: `${actual}/${limite}`, color: 'rojo', porcentaje };
    if (porcentaje >= 70) return { texto: `${actual}/${limite}`, color: 'amarillo', porcentaje };
    return { texto: `${actual}/${limite}`, color: 'verde', porcentaje };
  };

  return (
    <div className="kanban-board" onDragEnd={handleDragEnd}>
      {sorted.map(lista => {
        const wip = getWipStatus(lista);
        const excedido = wip.color === 'rojo';
        
        return (
          <div
            key={lista.id}
            className={`kanban-column ${dragOverId === lista.id ? 'kanban-column--drag-over' : ''} ${excedido ? 'kanban-column--excedido' : ''}`}
            onDragOver={e => handleDragOver(e, lista.id)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, lista.id)}
          >
            <div className={`kanban-column__header kanban-column__header--${wip.color}`}>
              <span className="kanban-column__name">{lista.nombre}</span>
              <span className="kanban-column__count" title={`WIP: ${wip.texto}`}>
                {wip.texto}
              </span>
            </div>

            <div className="kanban-column__cards">
              {lista.tarjetas.map(card => (
                <div
                  key={card.id}
                  className={draggingTicketId === card.id ? 'kanban-card--dragging' : ''}
                >
                  <KanbanCard
                    tarjeta={card}
                    onDragStart={handleDragStart}
                    onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                  />
                </div>
              ))}

              {lista.tarjetas.length === 0 && (
                <div className="kanban-column__empty">Sin tarjetas</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}