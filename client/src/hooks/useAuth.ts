import { useAuthContext } from '../api/AuthProvider';

export function useAuth() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}
