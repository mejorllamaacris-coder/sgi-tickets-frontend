import { useAuthStore } from '@/shared/stores/auth.store';

export function usePermisos(modulo: string) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return { puedeLeer: false, puedeCrear: false, puedeEditar: false, puedeBorrar: false, esAdmin: false };
  }

  const esAdmin = user.rol === 'admin' || user.permisos.includes('admin');
  if (esAdmin) {
    return { puedeLeer: true, puedeCrear: true, puedeEditar: true, puedeBorrar: true, esAdmin: true };
  }

  const tienePermiso = (accion: 'leer' | 'crear' | 'editar' | 'borrar') => {
    const accionBackend = accion === 'borrar' ? 'eliminar' : accion;
    const permisoRequerido = `${modulo}.${accionBackend}`;
    return user.permisos.includes(permisoRequerido);
  };

  return {
    puedeLeer: tienePermiso('leer'),
    puedeCrear: tienePermiso('crear'),
    puedeEditar: tienePermiso('editar'),
    puedeBorrar: tienePermiso('borrar'),
    esAdmin: false,
  };
}
