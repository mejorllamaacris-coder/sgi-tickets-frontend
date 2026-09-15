import { useState } from 'react';
import { ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { FormInput } from '../FormInput/FormInput';
import type { User } from '@/types/auth.types';
import './LoginCard.css';

interface LoginCardProps {
  onLoginSuccess: (user: User, token: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LoginCard({ onLoginSuccess }: LoginCardProps) {
  const [email, setEmail] = useState('cristian@sgi.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Credenciales inválidas');
      }

      const data = await res.json();
      onLoginSuccess(data.user, data.access_token);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lc-card">
      <div className="lc-header">
        <div className="lc-logo"><span className="lc-logo__text">SGI</span></div>
      </div>

      <div className="lc-text">
        <h1 className="lc-title">Bienvenido de nuevo</h1>
        <p className="lc-subtitle">Accede a tu panel de control</p>
      </div>

      <form className="lc-form" onSubmit={handleSubmit} noValidate>
        <div className="lc-field-wrap lc-field-wrap--animate">
          <FormInput
            id="email"
            label="Correo electrónico"
            placeholder="tu@correo.com"
            value={email}
            icon="pi-user"
            autoComplete="username"
            onChange={setEmail}
          />
        </div>

        <div className="lc-field-wrap lc-field-wrap--animate">
          <FormInput
            id="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            value={password}
            icon="pi-lock"
            autoComplete="current-password"
            onChange={setPassword}
            rightElement={
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <i className={`pi ${showPassword ? 'pi-eye' : 'pi-eye-slash'}`} aria-hidden="true" />
              </button>
            }
          />
        </div>

        {error && (
          <div className="lc-error" role="alert">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="lc-btn"
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          <span>{loading ? 'Ingresando...' : 'Ingresar'}</span>
        </button>
      </form>

      <div className="lc-footer">
        <span>&copy; {new Date().getFullYear()} SGI TICKETS</span>
        <span className="lc-version">v1.0</span>
      </div>
    </div>
  );
}
