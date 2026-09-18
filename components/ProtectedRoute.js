"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function ProtectedRoute({ children }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!configured || !user)) router.replace("/dang-nhap");
  }, [configured, loading, router, user]);

  if (loading || !configured || !user) {
    return (
      <main className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Đang kiểm tra tài khoản...</p>
      </main>
    );
  }

  return children;
}
