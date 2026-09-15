// src/pages/ProductividadPage/CategoriasPage/CategoriaDialog.tsx

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Area } from '@/types/productividad.types';

export interface CategoriaFormData {
  nombre: string;
  id_area: number | '';
}

interface CategoriaDialogProps {
  open: boolean;
  areas: Area[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaFormData) => void;
}

export function CategoriaDialog({ open, areas, saving, onClose, onSubmit }: CategoriaDialogProps) {
  const [nombre, setNombre] = useState('');
  const [idArea, setIdArea] = useState<number | ''>('');

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setNombre('');
      setIdArea('');
    }
  }, [open]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || idArea === '') return;
    onSubmit({ nombre: nombre.trim(), id_area: idArea });
  };

  return (
    <div className="prd-modal-backdrop" onClick={onClose}>
      <div className="prd-modal" onClick={e => e.stopPropagation()}>
        <header className="prd-modal__header">
          <h3>Nueva categoría</h3>
          <button className="prd-modal__close" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="prd-modal__body">
          <label className="prd-field">
            <span>Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Soporte Técnico"
              autoFocus
              required
            />
          </label>

          <label className="prd-field">
            <span>Área</span>
            <select
              value={idArea}
              onChange={e => setIdArea(e.target.value === '' ? '' : Number(e.target.value))}
              required
            >
              <option value="">Selecciona un área...</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </label>

          <footer className="prd-modal__footer">
            <button type="button" className="prd-btn prd-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="prd-btn prd-btn--primary"
              disabled={!nombre.trim() || idArea === '' || saving}
            >
              {saving ? 'Creando...' : 'Crear categoría'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
