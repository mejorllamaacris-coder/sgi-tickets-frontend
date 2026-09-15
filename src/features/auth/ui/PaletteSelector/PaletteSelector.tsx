// src/features/auth/ui/PaletteSelector/PaletteSelector.tsx
import React, { useEffect, useRef } from 'react';
import { type SgiPalette } from '@/shared/stores/layout.store';
import './PaletteSelector.css';

interface Props {
  palettes: SgiPalette[];
  activeId: string;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function PaletteSelector({ palettes, activeId, isOpen, onToggle, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const active = palettes.find(p => p.id === activeId);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => onClose();
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isOpen, onClose]);

  return (
    <div className="pal-topbar-left" ref={ref}>
      <button
        type="button"
        className="pal-trigger"
        onClick={onToggle}
        title={`Tema: ${active?.label}`}
        aria-label={`Seleccionar tema. Tema actual: ${active?.label}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="pal-trigger-dot" style={{ background: active?.dot }} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="pal-dropdown" onClick={e => e.stopPropagation()}>
          {palettes.map(p => (
            <button key={p.id} className={`pal-opt ${activeId === p.id ? 'pal-opt--active' : ''}`} onClick={() => onSelect(p.id)}>
              <span className="pal-dot" style={{ background: p.dot }} />
              <span className="pal-label">{p.label}</span>
              {activeId === p.id && <i className="pi pi-check pal-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}