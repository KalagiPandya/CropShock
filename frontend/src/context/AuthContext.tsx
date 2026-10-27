import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, DEMO_PROFILES } from '../types/auth';
import { loginApi } from '../api';

interface AuthContextType {
  currentUser: UserProfile | null;
  authToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = 'cropshock_auth_profile';
const TOKEN_STORAGE_KEY = 'cropshock_jwt_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && DEMO_PROFILES[parsed.role as UserRole]) {
          return {
            ...DEMO_PROFILES[parsed.role as UserRole],
            ...parsed,
            roleMetrics: DEMO_PROFILES[parsed.role as UserRole].roleMetrics,
            customCallout: DEMO_PROFILES[parsed.role as UserRole].customCallout,
            primaryTabs: DEMO_PROFILES[parsed.role as UserRole].primaryTabs,
          };
        }
      }
    } catch (e) {
      console.warn('[AUTH] Failed to read cached profile:', e);
    }
    return null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Sync token and profile to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }

      if (authToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[AUTH] Failed to sync session to storage:', e);
    }
  }, [currentUser, authToken]);

  // If no auth token is found on start, auto-issue one for the initial profile
  useEffect(() => {
    if (!authToken && currentUser) {
      loginApi(currentUser.email)
        .then(res => {
          setAuthToken(res.access_token);
        })
        .catch(err => {
          console.warn('[AUTH] Standalone mode: JWT generation deferred', err);
        });
    }
  }, []);

  const login = async (email: string, password: string = 'demo123'): Promise<boolean> => {
    try {
      // 1. Authenticate with FastAPI backend to get JWT Bearer token
      const authRes = await loginApi(email, password);
      if (authRes.access_token) {
        setAuthToken(authRes.access_token);
      }

      // 2. Resolve matching UserProfile with full UI attributes
      const matched = Object.values(DEMO_PROFILES).find(
        p => p.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (matched) {
        setCurrentUser(matched);
      } else {
        // Construct fallback profile
        const customUser: UserProfile = {
          ...DEMO_PROFILES.PROCUREMENT_MANAGER,
          id: authRes.user?.id || `usr_${Date.now()}`,
          name: authRes.user?.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
          role: (authRes.user?.role as UserRole) || 'PROCUREMENT_MANAGER',
          roleLabel: authRes.user?.roleLabel || 'Agri Sourcing Specialist',
          organization: authRes.user?.organization || 'Commercial Agri Sourcing Partner',
          initials: email.substring(0, 2).toUpperCase(),
          homeDistrict: authRes.user?.homeDistrict || 'Ahmedabad',
        };
        setCurrentUser(customUser);
      }

      setIsLoginModalOpen(false);
      return true;
    } catch (err) {
      console.warn('[AUTH] Backend offline or credentials failed, falling back to local demo profile:', err);
      // Seamless offline fallback
      const matched = Object.values(DEMO_PROFILES).find(
        p => p.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (matched) {
        setCurrentUser(matched);
      }
      setIsLoginModalOpen(false);
      return true;
    }
  };

  const loginAsRole = async (role: UserRole) => {
    const profile = DEMO_PROFILES[role];
    if (profile) {
      try {
        const authRes = await loginApi(profile.email, 'demo123');
        if (authRes.access_token) {
          setAuthToken(authRes.access_token);
        }
      } catch (err) {
        console.warn('[AUTH] Local profile switch:', err);
      }
      setCurrentUser(profile);
      setIsLoginModalOpen(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authToken,
        isAuthenticated: !!currentUser,
        login,
        loginAsRole,
        logout,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
