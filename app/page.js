"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers";
import styles from "./home.module.css";

function StudentHome() {
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Học sinh";

  async function handleLogout() {
    await logout();
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>BIỆT ĐỘI</span><strong>KIẾN TẠO SÀI GÒN</strong></div>
        <button onClick={handleLogout}>Đăng xuất</button>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.greeting}>CHÀO MỪNG TRỞ LẠI</span>
          <h1>Xin chào, {displayName}!</h1>
          <p>Hành trình khôi phục thành phố đang chờ em tiếp tục.</p>
          <Link href="/tro-choi">Trang trò chơi <b>→</b></Link>
        </div>
        <div className={styles.mascot} aria-hidden="true">🦊</div>
      </section>

      <section className={styles.cards}>
        <article><span>⭐</span><div><small>TỔNG SỐ SAO</small><strong>0</strong></div></article>
        <article><span>🎯</span><div><small>MÀN ĐÃ HOÀN THÀNH</small><strong>0</strong></div></article>
        <article><span>🏙️</span><div><small>ĐỊA ĐIỂM ĐÃ MỞ</small><strong>1</strong></div></article>
      </section>
    </main>
  );
}

export default function HomePage() {
  return <ProtectedRoute><StudentHome /></ProtectedRoute>;
}
