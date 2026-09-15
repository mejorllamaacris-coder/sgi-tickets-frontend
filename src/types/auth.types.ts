// ~/sgi-tickets-frontend/src/types/auth.types.ts
export interface PermisoSistema {
  modulo: string;
  id_area: number | null;
  C: boolean;
  R: boolean;
  U: boolean;
  D: boolean;
  mod_admin: boolean;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  id_area: number | null;
  rol: string | null;
  permisos: PermisoSistema[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}