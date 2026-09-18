"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/app/providers";
import styles from "./login.module.css";

function messageForError(code) {
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Email hoặc mật khẩu chưa chính xác.";
  }
  if (code === "auth/invalid-email") return "Địa chỉ email không hợp lệ.";
  if (code === "auth/too-many-requests") return "Bạn thử quá nhiều lần. Vui lòng chờ một lúc rồi thử lại.";
  return "Không thể đăng nhập. Vui lòng thử lại.";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading, configured, authError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) router.replace(profile.role === "teacher" ? "/giao-vien" : "/");
  }, [loading, profile, router, user]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!auth) {
      setError("Website chưa được kết nối Firebase. Hãy thêm biến môi trường trên Vercel.");
      return;
    }
    setSubmitting(true);
    try {
      const identifier = username.trim().toLowerCase();
      const email = identifier.includes("@") ? identifier : `${identifier}@admin.com`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (loginError) {
      setError(messageForError(loginError.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.visual}>
        <div className={styles.brand}>BIỆT ĐỘI KIẾN TẠO SÀI GÒN</div>
        <div className={styles.city} aria-hidden="true">🌳　🏛️　🦒　⛵</div>
        <h1>Khôi phục thành phố<br />qua từng thử thách</h1>
        <p>Đăng nhập để tiếp tục hành trình và lưu tiến độ của em.</p>
      </section>

      <section className={styles.panel}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <span className={styles.eyebrow}>CHÀO MỪNG TRỞ LẠI</span>
          <h2>Đăng nhập học sinh</h2>
          <p>Sử dụng tài khoản do giáo viên hoặc quản trị viên cung cấp.</p>

          <label>
            Tên đăng nhập
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ví dụ: hocsinh"
              autoComplete="username"
              spellCheck="false"
              required
            />
            <small>Không cần nhập phần @admin.com</small>
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              required
            />
          </label>

          {!configured && <div className={styles.warning}>Chưa có cấu hình Firebase trên môi trường này.</div>}
          {(error || authError) && <div className={styles.error}>{error || authError}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
