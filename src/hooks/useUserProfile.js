import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to get the current user profile
 * Returns the user profile from the AuthContext
 */
export function useUserProfile() {
  const { userProfile, loading, user } = useAuth();

  return {
    userProfile,
    loading,
    user,
    isLoading: loading
  };
}

export default useUserProfile;
