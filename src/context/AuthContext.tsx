import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

type MSLoginUser = {
  id: string;
  email: string;
  name: string;
  accessToken: string;
};

interface User {
  userID: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  departmentID: string;
  section_index: string;
  postitionID: string;
  active: string;
  role: string;
  user_code: string | null;
  supervisorID: string;
  level: string | null;
}

interface Approver {
  userID: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  departmentID: string;
  section_index: string;
  postitionID: string;
  active: string;
  role: string;
  user_code: string | null;
  supervisorID: string | null;
  level: string | null;
}

interface AuthContextType {
  user: User | null;
  approver: Approver | null;
  msLoginUser : MSLoginUser | null; 
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: MSLoginUser) => void;
  logout: () => void;
  fetchUserData: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [msLoginUser, setMSLoginUser] = useState<MSLoginUser | null>(null);
  const [approver, setApprover] = useState<Approver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }

        const storedApprover = localStorage.getItem('approver');
        if (storedApprover) {
          const approverData = JSON.parse(storedApprover);
          setApprover(approverData);
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('approver');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserData = async (email: string) => {
    try {
      const response = await axios.post(import.meta.env.VITE_APP_GET_USER_BY_EMAIL, {
        email: email
      });

      if (response.data && response.data.user && response.data.approver) {
        const userData = response.data.user;
        const approverData = response.data.approver;

        setUser(userData);
        setApprover(approverData);
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('approver', JSON.stringify(approverData));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  };

  const login = (userData: MSLoginUser) => {
    localStorage.setItem('msLoginUser', JSON.stringify(userData));
    setMSLoginUser(userData);
    fetchUserData(userData.email).catch(err => {
      console.error('Error fetching user data after login:', err);
      logout();
    });
  };

  const logout = () => {
    setUser(null);
    setApprover(null);
    setMSLoginUser(null); 
    localStorage.removeItem('user');
    localStorage.removeItem('approver');
    localStorage.removeItem('token');
    localStorage.removeItem('msLoginUser');
  };

  const value: AuthContextType = {
    user,
    approver,
    msLoginUser, 
    isAuthenticated: !!msLoginUser,
    isLoading,
    login,
    logout,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};