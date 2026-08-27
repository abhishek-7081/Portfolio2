import { createContext, useContext, useEffect, useState } from 'react';
import { portfolioApi } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      try {
        const response = await portfolioApi.session();

        if (!active) {
          return;
        }

        setUser(response.user);
        setStatus('authenticated');
      } catch {
        if (!active) {
          return;
        }

        setUser(null);
        setStatus('guest');
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await portfolioApi.login(email, password);
    setUser(response.user);
    setStatus('authenticated');
    return response.user;
  };

  const logout = async () => {
    await portfolioApi.logout();
    setUser(null);
    setStatus('guest');
  };

  const refreshSession = async () => {
    try {
      const response = await portfolioApi.session();
      setUser(response.user);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('guest');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};
