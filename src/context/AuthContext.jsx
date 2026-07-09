import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, googleLoginUrl, loginAdmin, logoutUser } from '../lib/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const current = await fetchCurrentUser();
        if (active) setUser(current);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const loginWithGoogle = useCallback((returnTo = '/') => {
    window.location.href = googleLoginUrl(returnTo);
  }, []);

  const loginWithAdminPassword = useCallback(async (username, password) => {
    const adminUser = await loginAdmin(username, password);
    setUser(adminUser);
    return adminUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === 'admin',
    isPasswordAdmin: user?.auth_kind === 'admin_password',
    loginWithGoogle,
    loginWithAdminPassword,
    logout,
    refreshUser,
  }), [user, loading, loginWithGoogle, loginWithAdminPassword, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
