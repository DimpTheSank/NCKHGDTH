"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();
  const roleAllowed = !allowedRoles || (profile && allowedRoles.includes(profile.role));

  useEffect(() => {
    if (!loading && (!configured || !user || !profile)) {
      router.replace("/dang-nhap");
      return;
    }
    if (!loading && user && profile && !roleAllowed) router.replace("/");
  }, [configured, loading, profile, roleAllowed, router, user]);

  if (loading || !configured || !user || !profile || !roleAllowed) {
    return (
      <main className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Đang kiểm tra tài khoản...</p>
      </main>
    );
  }

  return children;
}
