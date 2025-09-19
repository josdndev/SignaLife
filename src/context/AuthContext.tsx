"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loginDoctor, getDoctorMe, AuthResponse, AuthMeResponse, DoctorAuth } from '@/functions/api';

interface AuthContextType {
  doctor: DoctorAuth | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (cedula: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [doctor, setDoctor] = useState<DoctorAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (cedula: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authResponse: AuthResponse = await loginDoctor(cedula, password);

      // Save token to localStorage
      localStorage.setItem('access_token', authResponse.access_token);

      // Get doctor info
      const meResponse: AuthMeResponse = await getDoctorMe();
      setDoctor(meResponse.doctor);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setDoctor(null);
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      const meResponse: AuthMeResponse = await getDoctorMe();
      setDoctor(meResponse.doctor);
      return true;
    } catch (error) {
      console.error('Check auth error:', error);
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    doctor,
    isLoading,
    isAuthenticated: !!doctor,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
