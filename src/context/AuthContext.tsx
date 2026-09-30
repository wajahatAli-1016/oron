import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Role } from '../types';
import { getApiErrorMessage, INTERNAL_SERVER_ERROR_MESSAGE } from '../utils/apiMessage';
import { syncOneSignalUser } from '../oneSignalBootstrap';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string): Role => {
  switch (role) {
    case 'OWNER':
      return 'owner';
    case 'FACILITY_ADMIN':
      return 'facility_admin';
    case 'BRANCH_ADMIN':
      return 'admin';
    case 'STAFF':
      return 'staff';
    default:
      return role as Role;
  }
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedAuth = localStorage.getItem('oron_auth');
      if (!savedAuth) {
        return null;
      }
      const parsed = JSON.parse(savedAuth) as { user?: User };
      return parsed.user || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      const savedAuth = localStorage.getItem('oron_auth');
      if (!savedAuth) {
        return null;
      }
      const parsed = JSON.parse(savedAuth) as { token?: string };
      return parsed.token || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }
    syncOneSignalUser(user?.id ?? null);
  }, [isAuthReady, user?.id]);

  const login = async (email: string, password: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const endpoint = `${apiBaseUrl}/auth/login`;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Login failed'));
    }

    if (!response.ok) {
      let parsedError: unknown;
      const errorText = await response.text();
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = errorText;
      }
      throw new Error(
        getApiErrorMessage(
          parsedError,
          response.status >= 500 ? INTERNAL_SERVER_ERROR_MESSAGE : 'Login failed',
        ),
      );
    }

    const data = await response.json() as {
      access_token: string;
      message: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        role: string;
        facilityId?: string;
        branchId?: string;
      };
    };

    const normalizedUser: User = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName,
      middleName: data.user.middleName,
      lastName: data.user.lastName,
      role: normalizeRole(data.user.role),
      facilityId: data.user.facilityId,
      branchId: data.user.branchId,
    };

    setUser(normalizedUser);
    setToken(data.access_token);
    localStorage.setItem('oron_auth', JSON.stringify({ user: normalizedUser, token: data.access_token }));

    return normalizedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('oron_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isAuthReady,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};