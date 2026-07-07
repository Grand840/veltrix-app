"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenResp = await authApi.login(email, password);
      const { access_token } = tokenResp.data;
      document.cookie = `veltrix_token=${access_token}; path=/; max-age=1800; SameSite=Lax`;
      localStorage.setItem("veltrix_token", access_token);
      const userResp = await authApi.me();
      setAuth(access_token, userResp.data);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenResp = await authApi.register(data);
      const { access_token } = tokenResp.data;
      document.cookie = `veltrix_token=${access_token}; path=/; max-age=1800; SameSite=Lax`;
      localStorage.setItem("veltrix_token", access_token);
      localStorage.removeItem("veltrix_onboarding_dismissed");
      const userResp = await authApi.me();
      setAuth(access_token, userResp.data);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    document.cookie = "veltrix_token=; path=/; max-age=0";
    clearAuth();
    router.push("/login");
  };

  return { login, register, logout, isLoading, error, setError };
}
