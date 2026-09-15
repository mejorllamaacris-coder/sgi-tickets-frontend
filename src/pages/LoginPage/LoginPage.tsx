import { useNavigate } from 'react-router-dom';
import { LoginLayout } from '@/features/auth/ui/LoginLayout/LoginLayout';
import { LoginCard } from '@/features/auth/ui/LoginCard/LoginCard';
import { AnimationPanel } from '@/features/auth/ui/AnimationPanel/AnimationPanel';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { User } from '@/types/auth.types';

export function LoginPage() {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User, token: string) => {
    setUser(user, token);
    navigate('/');
  };

  return (
    <LoginLayout
      left={<LoginCard onLoginSuccess={handleLoginSuccess} />}
      right={<AnimationPanel />}
    />
  );
}
