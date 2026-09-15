import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Area } from '@/types/productividad.types';

const schema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  descripcion: z.string().optional(),
  id_area: z.string().min(1, 'Selecciona un área'),
});

export type CrearTableroFormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  areas: Area[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: CrearTableroFormData) => void;
}

export function CrearTableroDialog({
  open,
  areas,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CrearTableroFormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', descripcion: '', id_area: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ nombre: '', descripcion: '', id_area: '' });
    }
  }, [open, reset]);

  if (!open) return null;

  return (
    <div className="prd-modal-backdrop" onClick={onClose}>
      <div className="prd-modal" onClick={e => e.stopPropagation()}>
        <div className="prd-modal__header">
          <h3>Nuevo tablero</h3>
          <button className="prd-modal__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="prd-modal__body">
            <div className="prd-field">
              <label>Nombre *</label>
              <input {...register('nombre')} placeholder="Ej. Tablero SST" autoFocus />
              {errors.nombre && <span className="prd-field__error">{errors.nombre.message}</span>}
            </div>

            <div className="prd-field">
              <label>Descripción</label>
              <textarea {...register('descripcion')} placeholder="Describe el propósito del tablero..." rows={3} />
            </div>

            <div className="prd-field">
              <label>Área *</label>
              <select {...register('id_area')}>
                <option value="">Selecciona un área</option>
                {areas.map(a => (
                  <option key={a.id} value={String(a.id)}>{a.nombre}</option>
                ))}
              </select>
              {errors.id_area && <span className="prd-field__error">{errors.id_area.message}</span>}
            </div>
          </div>

          <div className="prd-modal__footer">
            <button type="button" className="prd-btn prd-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="prd-btn prd-btn--primary" disabled={saving}>
              {saving ? 'Creando...' : 'Crear tablero'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
