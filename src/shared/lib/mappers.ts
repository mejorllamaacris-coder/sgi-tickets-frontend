import type { Session, User } from '@/types/auth.types';
import type { MenuItem } from '@/types/menu.types';

interface LoginRawResponse {
  data: {
    status: number;
    response: {
      data: {
        tk: {
          access_token: string;
          refresh_token: string;
          session_id: string;
        };
        usuario: User[];
        empresas: unknown[];
        menu: MenuItem[]; 
        permisos_sys: unknown[];
        mensaje?: string;
      };
    };
  };
}

export function mapLoginResponse(raw: LoginRawResponse): Session {
  const payload = raw.data.response.data;
  const tk = payload.tk;

  return {
    accessToken: tk.access_token,
    refreshToken: tk.refresh_token,
    sessionId: tk.session_id,
    usuario: payload.usuario,
    empresas: payload.empresas,
    menu: payload.menu,  
    permisos: payload.permisos_sys,
    mensaje: payload.mensaje ?? '',
  };
}

export function isLoginSuccess(raw: LoginRawResponse): boolean {
  return raw.data.status === 200;
}