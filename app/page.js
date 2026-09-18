"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers";
import { db } from "@/lib/firebase";
import styles from "./home.module.css";

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date) : "Không có hạn";
}

function StudentHome() {
  const { profile, logout } = useAuth();
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    if (!db || !profile?.uid) return;

    async function loadDashboard() {
      setLoadingData(true);
      setDataError("");
      try {
        const [noticeSnapshot, assignmentSnapshot] = await Promise.all([
          getDocs(collection(db, "users", profile.uid, "thongBao")),
          getDocs(collection(db, "users", profile.uid, "nhiemVu")),
        ]);

        const noticeData = noticeSnapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

        const assignmentData = assignmentSnapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (toDate(a.hanNop)?.getTime() || Infinity) - (toDate(b.hanNop)?.getTime() || Infinity));

        setNotices(noticeData);
        setAssignments(assignmentData);
      } catch {
        setDataError("Chưa thể tải thông báo và nhiệm vụ. Hãy kiểm tra quyền đọc Firestore.");
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboard();
  }, [profile?.uid]);

  const initial = profile?.name?.trim()?.charAt(0)?.toUpperCase() || "H";
  const roleLabel = profile?.role === "student" ? "Học sinh" : "Giáo viên";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><span>BIỆT ĐỘI</span><strong>KIẾN TẠO SÀI GÒN</strong></div>
        <div className={styles.headerActions}>
          <span>Xin chào, {profile?.name}</span>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.greeting}>TRANG CHỦ HỌC SINH</span>
          <h1>Sẵn sàng cho<br />hành trình hôm nay?</h1>
          <p>Hoàn thành nhiệm vụ, thu thập ngôi sao và giúp thành phố rực rỡ trở lại.</p>
          <Link href="/tro-choi">Trang trò chơi <b>→</b></Link>
        </div>
        <div className={styles.mascot} aria-hidden="true">🦊</div>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.profileCard}>
          <div className={styles.cardHeading}>
            <div><span>HỒ SƠ</span><h2>Thông tin học sinh</h2></div>
          </div>
          <div className={styles.profileMain}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={`Ảnh đại diện của ${profile.name}`} />
            ) : (
              <div className={styles.avatarFallback}>{initial}</div>
            )}
            <div>
              <h3>{profile?.name}</h3>
              <p>{profile?.email}</p>
            </div>
          </div>
          <dl className={styles.profileDetails}>
            <div><dt>Lớp</dt><dd>{profile?.className}</dd></div>
            <div><dt>Vai trò</dt><dd>{roleLabel}</dd></div>
            <div><dt>Trạng thái</dt><dd className={styles.activeStatus}>Đang hoạt động</dd></div>
          </dl>
        </article>

        <article className={styles.noticeCard}>
          <div className={styles.cardHeading}>
            <div><span>CẬP NHẬT MỚI</span><h2>Thông báo từ giáo viên</h2></div>
            <b>{notices.filter((item) => !item.daDoc).length} mới</b>
          </div>
          <div className={styles.itemList}>
            {loadingData ? (
              <p className={styles.emptyState}>Đang tải thông báo...</p>
            ) : notices.length ? notices.slice(0, 4).map((notice) => (
              <div className={styles.noticeItem} key={notice.id}>
                <span className={notice.daDoc ? styles.readDot : styles.unreadDot} />
                <div>
                  <strong>{notice.tieuDe || "Thông báo"}</strong>
                  <p>{notice.noiDung || notice.noidung || "Không có nội dung."}</p>
                  <small>{formatDate(notice.createdAt)}</small>
                </div>
              </div>
            )) : (
              <p className={styles.emptyState}>Hiện chưa có thông báo mới.</p>
            )}
          </div>
        </article>

        <article className={styles.assignmentCard}>
          <div className={styles.cardHeading}>
            <div><span>CẦN HOÀN THÀNH</span><h2>Nhiệm vụ được giao</h2></div>
            <b>{assignments.filter((item) => item.trangThai !== "hoan-thanh").length} nhiệm vụ</b>
          </div>
          <div className={styles.assignmentList}>
            {loadingData ? (
              <p className={styles.emptyState}>Đang tải nhiệm vụ...</p>
            ) : assignments.length ? assignments.slice(0, 6).map((assignment) => {
              const completed = assignment.trangThai === "hoan-thanh";
              return (
                <div className={styles.assignmentItem} key={assignment.id}>
                  <div className={completed ? styles.taskDone : styles.taskOpen}>{completed ? "✓" : "!"}</div>
                  <div>
                    <strong>{assignment.tieuDe || "Nhiệm vụ học tập"}</strong>
                    <p>{assignment.moTa || "Hoàn thành bài tập được giao."}</p>
                    <small>Hạn hoàn thành: {formatDate(assignment.hanNop)}</small>
                  </div>
                  {assignment.duongDan ? (
                    <Link href={assignment.duongDan}>{completed ? "Xem lại" : "Làm bài"}</Link>
                  ) : (
                    <span className={styles.noLink}>{completed ? "Đã xong" : "Chưa có link"}</span>
                  )}
                </div>
              );
            }) : (
              <p className={styles.emptyState}>Giáo viên chưa giao nhiệm vụ nào.</p>
            )}
          </div>
        </article>
      </section>

      {dataError && <p className={styles.dataError}>{dataError}</p>}
    </main>
  );
}

export default function HomePage() {
  return <ProtectedRoute><StudentHome /></ProtectedRoute>;
}
