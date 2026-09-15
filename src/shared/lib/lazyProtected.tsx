// src/shared/lib/lazyProtected.tsx

import { lazy, Suspense } from 'react';
import { ProtectedModuleRoute } from '@/shared/components/ProtectedModuleRoute/ProtectedModuleRoute';
import type { PermisoRequerido } from '@/shared/hooks/usePermisoModulo';

export function lazyProtected(
  modulo: string,
  importFn: () => Promise<{ default: React.ComponentType }>,
  requiere: PermisoRequerido = 'R',
) {
  const Component = lazy(importFn);
  return (
    <ProtectedModuleRoute modulo={modulo} requiere={requiere}>
      <Suspense fallback={null}>
        <Component />
      </Suspense>
    </ProtectedModuleRoute>
  );
}
