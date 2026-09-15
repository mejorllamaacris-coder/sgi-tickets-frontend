import { FormInput } from '../FormInput/FormInput';
import './LoginForm.css';

interface Props {
  usuario: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  error?: string | null;
  onUsuarioChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ usuario, password, showPassword, isLoading, error, onUsuarioChange, onPasswordChange, onTogglePassword, onSubmit, onForgotPassword }: Props) {
  return (
    <div className="login-card">
      <div className="login-logo">
        <span className="login-logo__text">SGI</span>
      </div>

      <h1 className="login-title">Bienvenido de nuevo</h1>
      <p className="login-subtitle">Accede a tu panel de control</p>

      <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="login-form">
        <FormInput id="usuario" label="Usuario" placeholder="Ingresa tu usuario" value={usuario} icon="pi-user" autoComplete="off" onChange={onUsuarioChange} />

        <FormInput id="password" label="Contraseña" type={showPassword ? 'text' : 'password'} placeholder="Ingresa tu contraseña" value={password} icon="pi-lock" autoComplete="current-password" onChange={onPasswordChange}
          rightElement={
            <button
              type="button"
              className="login-pw-toggle"
              onClick={onTogglePassword}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
            >
              <i className={`pi ${showPassword ? 'pi-eye' : 'pi-eye-slash'}`} aria-hidden="true" />
            </button>
          }
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? <i className="pi pi-spin pi-spinner login-btn-icon" /> : <i className="pi pi-arrow-right login-btn-icon" />}
          <span>{isLoading ? 'Ingresando...' : 'Ingresar'}</span>
        </button>

        <div className="login-forgot">
          <button type="button" className="login-forgot-link" onClick={onForgotPassword}>¿Olvidaste tu contraseña?</button>
        </div>
      </form>

      <div className="login-footer">
        <span>&copy; {new Date().getFullYear()} KRIKA COSMETICS</span>
        <span className="login-version">v3.0</span>
      </div>
    </div>
  );
}
