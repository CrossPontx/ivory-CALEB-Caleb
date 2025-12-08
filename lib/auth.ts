// Helper functions for authentication
// In production, use proper JWT tokens or session management

export function getUserFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('ivoryUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getUserFromLocalStorage() !== null;
}

export function requireAuth(callback: () => void, router: any) {
  const user = getUserFromLocalStorage();
  if (!user) {
    router.push('/');
    return false;
  }
  return true;
}
