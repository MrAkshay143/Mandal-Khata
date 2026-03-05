import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ReactNode } from 'react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token } = useApp();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
