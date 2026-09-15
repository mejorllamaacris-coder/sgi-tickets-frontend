import { useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { ticketsService } from '@/features/productividad/tickets/services/tickets.service';
import type { Ticket, Complejidad, Categoria, Area } from '@/types/productividad.types';

export type TicketDialogMode = 'crear' | 'editar';

const schema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres'),
  descripcion: z.string().optional(),
  id_area: z.string().min(1, 'Selecciona un área'),
  id_complejidad: z.string().min(1, 'Selecciona una complejidad'),
  id_categoria: z.string().optional(),
  id_asignado: z.string().optional(),
});

export type TicketFormData = z.infer<typeof schema>;

interface UsuarioAsignable {
  id: number;
  nombre: string;
}

interface Props {
  open: boolean;
  mode: TicketDialogMode;
  selected: Ticket | null;
  complejidades: Complejidad[];
  categorias: Categoria[];
  areas: Area[];
  idAreaUsuario: number | null;
  esAdmin: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: TicketFormData) => void;
}

export function TicketDialog({
  open,
  mode,
  selected,
  complejidades,
  categorias,
  areas,
  idAreaUsuario,
  esAdmin,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      titulo: '', 
      descripcion: '', 
      id_area: '', 
      id_complejidad: '', 
      id_categoria: '',
      id_asignado: '' 
    },
  });

  const idAreaSeleccionada = watch('id_area');
  const [usuariosAsignables, setUsuariosAsignables] = useState<UsuarioAsignable[]>([]);
  const [cargandoAsignables, setCargandoAsignables] = useState(false);

  // ── FIX: useRef para trackear el área anterior y NO resetear id_asignado en la carga inicial ──
  const areaAnteriorRef = useRef<string>('');

  // 1. Cargar usuarios asignables cuando cambia el área
  useEffect(() => {
    if (!idAreaSeleccionada) {
      setUsuariosAsignables([]);
      return;
    }
    setCargandoAsignables(true);
    ticketsService.tickets
      .listarAsignables(Number(idAreaSeleccionada))
      .then((res: any) => setUsuariosAsignables(Array.isArray(res) ? res : []))
      .catch(() => setUsuariosAsignables([]))
      .finally(() => setCargandoAsignables(false));
  }, [idAreaSeleccionada]);

  // 2. Reset del formulario al abrir el dialog
  useEffect(() => {
    if (!open) return;
    
    if (mode === 'editar' && selected) {
      const idAsignadoStr = selected.id_asignado ? String(selected.id_asignado) : '';
      const idAreaStr = String(selected.id_area);
      
      // Trackeamos el área para el useEffect de abajo
      areaAnteriorRef.current = idAreaStr;
      
      reset({
        titulo: selected.titulo,
        descripcion: selected.descripcion ?? '',
        id_area: idAreaStr,
        id_complejidad: String(selected.id_complejidad),
        id_categoria: selected.id_categoria ? String(selected.id_categoria) : '',
        id_asignado: idAsignadoStr,
      });
    } else {
      const idAreaStr = idAreaUsuario ? String(idAreaUsuario) : '';
      areaAnteriorRef.current = idAreaStr;
      
      reset({
        titulo: '',
        descripcion: '',
        id_area: idAreaStr,
        id_complejidad: '',
        id_categoria: '',
        id_asignado: '',
      });
    }
  }, [open, mode, selected, idAreaUsuario, reset]);

  // 3. FIX: Solo resetea id_asignado si el usuario cambió el área manualmente (no en la carga inicial)
  useEffect(() => {
    if (!idAreaSeleccionada) return;
    
    // Si el área cambió respecto a la anterior (interacción del usuario), reseteamos la asignación
    if (idAreaSeleccionada !== areaAnteriorRef.current) {
      areaAnteriorRef.current = idAreaSeleccionada;
      setValue('id_asignado', '');
    }
  }, [idAreaSeleccionada, setValue]);

  const categoriasAgrupadas = useMemo(() => {
    return categorias.reduce((acc, cat) => {
      const area = cat.area_nombre || 'Sin área';
      if (!acc[area]) acc[area] = [];
      acc[area].push(cat);
      return acc;
    }, {} as Record<string, Categoria[]>);
  }, [categorias]);

  if (!open) return null;

  const esLider = esAdmin;

  return (
    <div className="prd-modal-backdrop" onClick={onClose}>
      <div className="prd-modal" onClick={e => e.stopPropagation()}>
        <div className="prd-modal__header">
          <h3>{mode === 'crear' ? 'Nuevo ticket' : 'Editar ticket'}</h3>
          <button className="prd-modal__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="prd-modal__body">
            <div className="prd-field">
              <label>Título *</label>
              <input {...register('titulo')} placeholder="Ej. Error en módulo de ventas" autoFocus />
              {errors.titulo && <span className="prd-field__error">{errors.titulo.message}</span>}
            </div>

            <div className="prd-field">
              <label>Descripción</label>
              <textarea {...register('descripcion')} placeholder="Describe el ticket..." rows={3} />
              {errors.descripcion && <span className="prd-field__error">{errors.descripcion.message}</span>}
            </div>

            <div className="prd-field">
              <label>Área *</label>
              <select {...register('id_area')} disabled={!esLider}>
                <option value="">Selecciona un área</option>
                {areas.map(a => (
                  <option key={a.id} value={String(a.id)}>{a.nombre}</option>
                ))}
              </select>
              {errors.id_area && <span className="prd-field__error">{errors.id_area.message}</span>}
              {!esLider && <small className="prd-field__hint">Solo puedes crear tickets en tu área</small>}
            </div>

            {idAreaSeleccionada && (
              <div className="prd-field">
                <label>Asignar a <span className="prd-field__optional">(opcional)</span></label>
                <select {...register('id_asignado')} disabled={cargandoAsignables}>
                  <option value="">
                    {cargandoAsignables ? 'Cargando usuarios...' : 'Sin asignar'}
                  </option>
                  {usuariosAsignables.map(u => (
                    <option key={u.id} value={String(u.id)}>{u.nombre}</option>
                  ))}
                </select>
                <small className="prd-field__hint">
                  {usuariosAsignables.length} usuarios del área disponibles
                </small>
              </div>
            )}

            <div className="prd-field">
              <label>Complejidad *</label>
              <select {...register('id_complejidad')}>
                <option value="">Selecciona una complejidad</option>
                {complejidades.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.nombre} ({c.sla_horas}h)</option>
                ))}
              </select>
              {errors.id_complejidad && <span className="prd-field__error">{errors.id_complejidad.message}</span>}
            </div>

            <div className="prd-field">
              <label>Categoría <span className="prd-field__optional">(opcional)</span></label>
              <select {...register('id_categoria')}>
                <option value="">Sin categoría</option>
                {Object.entries(categoriasAgrupadas).map(([areaNombre, cats]) => (
                  <optgroup key={areaNombre} label={areaNombre}>
                    {cats.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="prd-modal__footer">
            <button type="button" className="prd-btn prd-btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="prd-btn prd-btn--primary" disabled={saving}>
              {saving ? 'Guardando...' : mode === 'crear' ? 'Crear ticket' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}