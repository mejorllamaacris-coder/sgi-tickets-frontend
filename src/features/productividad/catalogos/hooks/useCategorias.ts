// src/features/productividad/catalogos/hooks/useCategorias.ts

import { useState, useCallback, useEffect } from 'react';
import { notify } from '@/shared/lib/notify';
import { catalogosService } from '../services/catalogos.service';
import type { Area, Categoria, CrearCategoriaDto } from '@/types/productividad.types';

function mensajeError(err: unknown, fallback: string): string {
  const e = err as any;
  const msg = e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargando, setCargando] = useState(true);

  // Carga categorías (todas, con inactivas) + áreas en paralelo
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [cats, ars] = await Promise.all([
        catalogosService.categorias.listarAdmin(),
        catalogosService.areas.listar(),
      ]);
      setCategorias(Array.isArray(cats) ? cats : []);
      setAreas(Array.isArray(ars) ? ars : []);
    } catch {
      notify.error('No se pudieron cargar las categorías');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crearCategoria = useCallback(async (data: CrearCategoriaDto) => {
    try {
      await catalogosService.categorias.crear(data);
      notify.success('Categoría creada');
      await cargar();
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo crear la categoría'));
      throw err;
    }
  }, [cargar]);

  const toggleCategoria = useCallback(async (id: number) => {
    try {
      const res = await catalogosService.categorias.toggle(id);
      notify.success(res?.mensaje || 'Estado de categoría actualizado');
      await cargar();
    } catch (err) {
      notify.error(mensajeError(err, 'No se pudo cambiar el estado'));
      throw err;
    }
  }, [cargar]);

  return { categorias, areas, cargando, cargar, crearCategoria, toggleCategoria };
}
