import { useEffect } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle, HelpCircle } from 'lucide-react';
import './ConfirmationModal.css';

export interface ConfirmationAction {
  label: string;
  variant?: 'primary' | 'danger' | 'ghost';
  onClick: () => void;
  loading?: boolean;
}

export interface ConfirmationModalProps {
  title: string;
  description?: string;
  summary?: React.ReactNode;
  // Acepta ambos nombres (viejo y nuevo)
  icon?: 'warning' | 'info' | 'danger' | 'success' | string;
  iconVariant?: 'warning' | 'info' | 'danger' | 'success';
  actions: ConfirmationAction[];
  open: boolean;
  onClose?: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  warning: AlertTriangle,
  info: Info,
  danger: XCircle,
  success: CheckCircle,
};

export function ConfirmationModal({
  title, description, summary,
  icon, iconVariant,
  actions, open, onClose,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  // Prioriza `icon`, si no usa `iconVariant`, default warning
  const resolvedIcon = icon ?? iconVariant ?? 'warning';
  // Soporta el string viejo "pi-exclamation-triangle" → lo mapea a warning
  const normalized = resolvedIcon?.toString().toLowerCase() ?? 'warning';
  const key = normalized.includes('exclamation') || normalized.includes('warn')
    ? 'warning'
    : normalized.includes('danger') || normalized.includes('error')
    ? 'danger'
    : normalized.includes('success') || normalized.includes('check')
    ? 'success'
    : normalized.includes('info')
    ? 'info'
    : (normalized in ICON_MAP ? normalized : 'warning');

  const IconComponent = ICON_MAP[key] ?? HelpCircle;

  return (
    <div
      className="cm-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-title"
    >
      <div className="cm-panel">
        <div className={`cm-icon-wrap cm-icon-wrap--${key}`}>
          <IconComponent size={24} />
        </div>
        <h2 id="cm-title" className="cm-title">{title}</h2>
        {description && <p className="cm-description">{description}</p>}
        {summary && <div className="cm-summary">{summary}</div>}
        <div className="cm-actions">
          {actions.map((action, i) => (
            <button
              key={i}
              className={`cm-btn cm-btn--${action.variant ?? 'primary'}`}
              onClick={action.onClick}
              disabled={action.loading}
            >
              {action.loading ? 'Cargando...' : action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}