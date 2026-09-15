// src/shared/hooks/usePermisoModulo.ts

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { PermisoSistema } from '@/types/auth.types';

/** Letras que trae el backend + admin. Un solo punto de traducción. */
export type PermisoRequerido = 'R' | 'C' | 'U' | 'D' | 'admin';

export function usePermisoModulo(nombreModulo: string) {
  const session = useAuthStore(s => s.session);

  const permiso = session?.permisos?.find(
    (p: PermisoSistema) => p.modulo.toLowerCase() === nombreModulo.toLowerCase()
  ) as PermisoSistema | undefined;

  const areasFiltro = useMemo(() => {
    if (!permiso) return [];
    if (permiso.mod_admin) return [];
    return permiso.id_area ? [permiso.id_area] : [];
  }, [permiso?.mod_admin, permiso?.id_area]);

  /**
   * Single source of truth de permisos.
   * - admin → wildcard (pasa todo)
   * - 'admin' → solo mod_admin
   * - R/C/U/D → se leen directo del objeto del backend (son sus keys)
   */
  const puede = useCallback((req: PermisoRequerido): boolean => {
    if (!permiso) return false;
    if (permiso.mod_admin) return true;
    if (req === 'admin') return false;
    return Boolean(permiso[req]);
  }, [permiso]);

  return {
    puedeLeer:   permiso?.R  ?? false,
    puedeCrear:  permiso?.C  ?? false,
    puedeEditar: permiso?.U  ?? false,
    puedeBorrar: permiso?.D  ?? false,
    esAdmin:     permiso?.mod_admin ?? false,
    idArea:      permiso?.id_area ?? null,
    areasFiltro,
    puede,
  };
}
