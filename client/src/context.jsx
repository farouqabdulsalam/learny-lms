import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = data => {
    localStorage.setItem('learny_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const refresh = async () => {
    const response = await auth.me();
    setUser(response.data.user);
    return response.data.user;
  };

  useEffect(() => {
    const token = localStorage.getItem('learny_token');

    if (!token) {
      setLoading(false);
      return;
    }

    refresh()
      .catch(() => localStorage.removeItem('learny_token'))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async data => setSession((await auth.login(data)).data),
      register: async data => setSession((await auth.register(data)).data),
      switchRole: async role =>
        setSession((await auth.switchRole(role)).data),
      becomeInstructor: async () =>
        setSession((await auth.becomeInstructor()).data),
      refresh,
      logout: () => {
        localStorage.removeItem('learny_token');
        setUser(null);
      }
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
