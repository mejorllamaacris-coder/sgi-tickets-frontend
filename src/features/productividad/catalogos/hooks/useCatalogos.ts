import { useState, useCallback, useEffect } from 'react';
import { notify } from '@/shared/lib/notify';
import { catalogosService } from '../services/catalogos.service';
import type { EstadoTicket, Complejidad, Categoria, Area } from '@/types/productividad.types';

export function useCatalogos() {
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [complejidades, setComplejidades] = useState<Complejidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);

    // Cada catálogo carga de forma independiente:
    // si uno falla, no tumba a los demás.
    const [est, comp, cats, ars] = await Promise.all([
      catalogosService.estados.listar().catch(() => {
        notify.error('No se pudieron cargar los estados');
        return [];
      }),
      catalogosService.complejidades.listar().catch(() => {
        notify.error('No se pudieron cargar las complejidades');
        return [];
      }),
      // SIN idArea: el backend devuelve TODAS las categorías activas con su area_nombre
      catalogosService.categorias.listar().catch(() => {
        notify.error('No se pudieron cargar las categorías');
        return [];
      }),
      catalogosService.areas.listar().catch(() => {
        notify.error('No se pudieron cargar las áreas');
        return [];
      }),
    ]);

    setEstados(Array.isArray(est) ? est : []);
    setComplejidades(Array.isArray(comp) ? comp : []);
    setCategorias(Array.isArray(cats) ? cats : []);
    setAreas(Array.isArray(ars) ? ars : []);
    setCargando(false);
  }, []); // Quitamos idArea de las dependencias

  useEffect(() => { cargar(); }, [cargar]);

  return { estados, complejidades, categorias, areas, cargando, cargar };
}