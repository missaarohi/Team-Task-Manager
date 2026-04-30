import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('task-manager-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('task-manager-token');
    if (!token) return;

    setLoading(true);
    apiRequest('/auth/me')
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('task-manager-user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('task-manager-token');
        localStorage.removeItem('task-manager-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = (data) => {
    localStorage.setItem('task-manager-token', data.token);
    localStorage.setItem('task-manager-user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (payload) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setSession(data);
  };

  const signup = async (payload) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setSession(data);
  };

  const logout = () => {
    localStorage.removeItem('task-manager-token');
    localStorage.removeItem('task-manager-user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'Admin',
      login,
      signup,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
