
"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/lib/types";
import { authApi, ApiError } from "@/lib/api";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, pass: string, allowedRole?: UserRole) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<User | null>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  enrollInCourse: (courseId: string) => void;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      if (response.user) {
        localStorage.setItem("aiq-user", JSON.stringify(response.user));
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error("Failed to refresh user profile", error);
      // If refresh fails, the user might have an invalid token
      authApi.logout();
      setCurrentUser(null);
      
      // Only redirect if not already on a login/register page to prevent loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("aiq-user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("aiq-user");
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (email: string, pass: string, allowedRole?: UserRole) => {
    try {
      const response = await authApi.login(email, pass);
      
      if (!response.user) {
        return null;
      }

      // Check role restrictions
      if (allowedRole && response.user.role !== allowedRole) {
        if (allowedRole === 'learner') {
          throw new Error("Instructors must use the instructor login page.");
        }
        if (allowedRole === 'instructor') {
          throw new Error("Students must use the student login page.");
        }
      }

      localStorage.setItem("aiq-user", JSON.stringify(response.user));
      setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const response = await authApi.register(name, email, pass, "learner");
      
      if (response.user) {
        localStorage.setItem("aiq-user", JSON.stringify(response.user));
        setCurrentUser(response.user);
        return response.user;
      }
      
      return null;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const logout = useCallback(() => {
    authApi.logout();
    setCurrentUser(null);
    router.push("/login");
  }, [router]);
  
  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) {
      throw new Error("You must be logged in to update your profile.");
    }
    
    try {
      const response = await authApi.updateProfile(data);
      if (response.user) {
        localStorage.setItem("aiq-user", JSON.stringify(response.user));
        setCurrentUser(response.user);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const enrollInCourse = (courseId: string) => {
    // This would need a separate enrollments API endpoint
    // For now, this is a placeholder
    console.log("Enrolling in course:", courseId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isInitialized,
        login,
        logout,
        register,
        updateUserProfile,
        enrollInCourse,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
