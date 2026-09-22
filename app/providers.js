"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

const AuthContext = createContext(null);

function normalizeRole(value = "") {
  const role = String(value).trim().toLocaleLowerCase("vi");
  if (["học sinh", "hoc sinh", "student"].includes(role)) return "student";
  if (["giáo viên", "giao vien", "teacher"].includes(role)) return "teacher";
  if (["quản trị", "quan tri", "admin"].includes(role)) return "admin";
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setAuthError("");
      try {
        const snapshot = await getDoc(doc(db, "users", currentUser.uid));
        if (!snapshot.exists()) {
          setAuthError("Tài khoản chưa có hồ sơ trong hệ thống.");
          await signOut(auth);
          return;
        }

        const data = snapshot.data();
        const role = normalizeRole(data.vaiTro ?? data.role);
        if (data.active === false) {
          setAuthError("Tài khoản đã bị khóa.");
          await signOut(auth);
          return;
        }
        if (!role) {
          setAuthError("Tài khoản chưa được gán vai trò hợp lệ.");
          await signOut(auth);
          return;
        }

        setUser(currentUser);
        setProfile({
          uid: currentUser.uid,
          email: data.email || currentUser.email,
          name: data.ten || data.displayName || currentUser.email?.split("@")[0] || "Người dùng",
          role,
          className: data.lop || data.className || "Chưa cập nhật",
          avatarUrl: data.anhDaiDien || data.avatarUrl || "",
          active: data.active !== false,
        });
      } catch {
        setAuthError("Không thể đọc hồ sơ người dùng từ Firestore.");
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(() => ({
    user, profile, loading, authError, configured: isFirebaseConfigured,
    logout: () => auth ? signOut(auth) : Promise.resolve(),
  }), [user, profile, loading, authError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
