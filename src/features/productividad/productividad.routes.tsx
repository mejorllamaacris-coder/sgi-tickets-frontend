// src/features/productividad/productividad.routes.tsx

import { Navigate } from 'react-router-dom';
import { lazyProtected } from '@/shared/lib/lazyProtected';

const MODULO = 'Productividad';

export const productividadRoutes = [
  { index: true, element: <Navigate to="tickets" replace /> },
  {
    path: 'tickets',
    element: lazyProtected(MODULO, () =>
      import('@/pages/ProductividadPage/TicketsPage/TicketsPage').then(m => ({ default: m.TicketsPage })),
    ),
  },
  {
    path: 'tableros',
    element: lazyProtected(MODULO, () =>
      import('@/pages/ProductividadPage/TablerosPage/TablerosPage').then(m => ({ default: m.TablerosPage })),
    ),
  },
  {
    path: 'reportes',
    element: lazyProtected(
      MODULO,
      () =>
        import('@/pages/ProductividadPage/ReportesPage/ReportesPage').then(m => ({ default: m.ReportesPage })),
      'U',
    ),
  },
  {
    path: 'categorias',
    element: lazyProtected(
      MODULO,
      () =>
        import('@/pages/ProductividadPage/CategoriasPage/CategoriasPage').then(m => ({ default: m.CategoriasPage })),
      'admin',
    ),
  },
];
