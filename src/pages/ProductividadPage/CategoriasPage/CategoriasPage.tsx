// src/pages/ProductividadPage/CategoriasPage/CategoriasPage.tsx

import { useMemo, useState, useCallback } from 'react';
import { Plus, RefreshCw, Power, Check } from 'lucide-react';
import { Pagination } from '@/shared/ui/Pagination/Pagination';
import { useCategorias } from '@/features/productividad/catalogos/hooks/useCategorias';
import { CategoriaDialog, type CategoriaFormData } from '@/features/productividad/catalogos/components/CategoriaDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import type { Categoria } from '@/types/productividad.types';
import '../TicketsPage/TicketsPage.css';
import './CategoriasPage.css';

export function CategoriasPage() {
  const { categorias, areas, cargando, cargar, crearCategoria, toggleCategoria } = useCategorias();

  const [fArea, setFArea] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // 1) Filtro por área (en cliente)
  const filtered = useMemo(() => {
    if (fArea === 'all') return categorias;
    return categorias.filter(c => c.id_area === Number(fArea));
  }, [categorias, fArea]);

  // 2) Paginación client-side
  const { paginated, page, totalPages, goTo, next, prev } = usePagination({ data: filtered, pageSize: 10 });

  const handleSubmit = useCallback(async (data: CategoriaFormData) => {
    setSaving(true);
    try {
      await crearCategoria({ nombre: data.nombre, id_area: Number(data.id_area) });
      setDialogOpen(false);
    } catch {
      // el hook ya muestra el toast
    } finally {
      setSaving(false);
    }
  }, [crearCategoria]);

  const handleToggle = useCallback(async (cat: Categoria) => {
    if (cat.activo) {
      const ok = window.confirm(
        `¿Desactivar la categoría "${cat.nombre}"? Dejará de aparecer en los formularios de nuevos tickets.`,
      );
      if (!ok) return;
    }
    setTogglingId(cat.id);
    try {
      await toggleCategoria(cat.id);
    } catch {
      // toast ya mostrado por el hook
    } finally {
      setTogglingId(null);
    }
  }, [toggleCategoria]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="prd-page">
      <div className="prd-header">
        <div>
          <h2 className="prd-title">Categorías</h2>
          <p className="prd-sub">Administra las categorías por área (activas e inactivas)</p>
        </div>
      </div>

      <div className="prd-table-wrap">
        <div className="prd-table-toolbar">
          <span className="prd-table-count">{filtered.length} categorías</span>
          <div className="prd-table-actions">
            <button className="prd-btn prd-btn--ghost" onClick={cargar} title="Actualizar">
              <RefreshCw size={15} />
            </button>
            <button className="prd-btn prd-btn--primary" onClick={() => setDialogOpen(true)}>
              <Plus size={15} /> Nueva categoría
            </button>
          </div>
        </div>

        <div className="prd-filters">
          <select className="prd-filter-select" value={fArea} onChange={e => setFArea(e.target.value)}>
            <option value="all">Todas las áreas</option>
            {areas.map(a => (
              <option key={a.id} value={String(a.id)}>{a.nombre}</option>
            ))}
          </select>
        </div>

        {cargando ? (
          <div className="prd-skeleton">
            {[...Array(5)].map((_, i) => <div key={i} className="prd-skeleton__row" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="prd-empty">No hay categorías para mostrar.</div>
        ) : (
          <>
            <table className="prd-table prd-cat-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Área</th>
                  <th>Estado</th>
                  <th>Creada</th>
                  <th className="prd-cat-table__actions-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(c => (
                  <tr key={c.id} className={!c.activo ? 'prd-cat-row--inactiva' : ''}>
                    <td className="prd-cat-table__nombre">{c.nombre}</td>
                    <td>{c.area_nombre ?? '—'}</td>
                    <td>
                      <span className={`prd-pill ${c.activo ? 'prd-pill--activa' : 'prd-pill--inactiva'}`}>
                        {c.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>{formatDate(c.fecha_creacion)}</td>
                    <td>
                      <button
                        className={`prd-btn prd-action-btn ${c.activo ? 'prd-btn--warning' : 'prd-btn--success'}`}
                        onClick={() => handleToggle(c)}
                        disabled={togglingId === c.id}
                        title={c.activo ? 'Desactivar categoría (ocultar de formularios)' : 'Reactivar categoría (visible de nuevo)'}
                      >
                        {togglingId === c.id ? (
                          <>
                            <RefreshCw size={14} className="prd-spin" />
                            Procesando
                          </>
                        ) : c.activo ? (
                          <>
                            <Power size={14} />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            Reactivar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              page={page}
              totalPages={totalPages}
              onNext={next}
              onPrev={prev}
              onGoTo={goTo}
            />

          </>
        )}
      </div>

      <CategoriaDialog
        open={dialogOpen}
        areas={areas}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
