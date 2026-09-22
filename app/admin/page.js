"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers";
import styles from "./admin.module.css";

async function adminRequest(user, path, options = {}) {
  const token = await user.getIdToken();
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Yêu cầu không thành công.");
  return data;
}

function AdminDashboard() {
  const { user, profile, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ displayName: "", className: "", role: "student" });
  const [created, setCreated] = useState([]);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminRequest(user, "/api/admin/users");
      setUsers(data.users || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return users.filter((item) => {
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      const matchesText = !query || [item.displayName, item.accountCode, item.email, item.className]
        .some((value) => String(value || "").toLowerCase().includes(query));
      return matchesRole && matchesText;
    });
  }, [filter, roleFilter, users]);

  async function createAccount(event) {
    event.preventDefault();
    setWorking(true);
    setMessage({ type: "", text: "" });
    try {
      const data = await adminRequest(user, "/api/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setCreated(data.created || []);
      setForm({ displayName: "", className: form.className, role: form.role });
      setMessage({ type: "success", text: "Đã tạo tài khoản thành công. Hãy lưu mật khẩu trước khi rời trang." });
      await loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setWorking(false);
    }
  }

  async function updateUser(item, changes) {
    setWorking(true);
    setMessage({ type: "", text: "" });
    try {
      await adminRequest(user, `/api/admin/users/${item.uid}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setMessage({ type: "success", text: "Đã cập nhật tài khoản." });
      await loadUsers();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setWorking(false);
    }
  }

  async function editUser(item) {
    const displayName = window.prompt("Họ và tên:", item.displayName);
    if (displayName === null) return;
    const className = window.prompt("Lớp:", item.className);
    if (className === null) return;
    await updateUser(item, { displayName, className, role: item.role, active: item.active });
  }

  async function resetPassword(item) {
    if (!window.confirm(`Tạo mật khẩu mới cho ${item.displayName}?`)) return;
    setWorking(true);
    try {
      const data = await adminRequest(user, `/api/admin/users/${item.uid}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "reset-password" }),
      });
      setCreated([{ ...item, password: data.password }]);
      setMessage({ type: "success", text: "Đã reset mật khẩu. Mật khẩu mới chỉ hiển thị trong bảng phía trên." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setWorking(false);
    }
  }

  function downloadCredentials() {
    const rows = [["Họ và tên", "Mã đăng nhập", "Mật khẩu", "Vai trò", "Lớp"],
      ...created.map((item) => [item.displayName, item.accountCode, item.password, item.role, item.className])];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `tai-khoan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>BIỆT ĐỘI KIẾN TẠO SÀI GÒN</span><h1>Quản trị hệ thống</h1></div>
        <div className={styles.adminInfo}><span>{profile?.name}</span><button onClick={logout}>Đăng xuất</button></div>
      </header>

      {message.text && <div className={message.type === "error" ? styles.error : styles.success}>{message.text}</div>}

      <section className={styles.summary}>
        <article><b>{users.length}</b><span>Tổng tài khoản</span></article>
        <article><b>{users.filter((item) => item.role === "student").length}</b><span>Học sinh</span></article>
        <article><b>{users.filter((item) => item.role === "teacher").length}</b><span>Giáo viên</span></article>
        <article><b>{users.filter((item) => !item.active).length}</b><span>Đang khóa</span></article>
      </section>

      <section className={styles.grid}>
        <form className={styles.card} onSubmit={createAccount}>
          <div className={styles.cardTitle}><span>TẠO MỚI</span><h2>Tạo tài khoản</h2></div>
          <label>Họ và tên<input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required /></label>
          <label>Vai trò<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Học sinh</option><option value="teacher">Giáo viên</option>
          </select></label>
          <label>Lớp<input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required={form.role === "student"} placeholder="Ví dụ: 5A1" /></label>
          <button className={styles.primary} disabled={working}>{working ? "Đang xử lý..." : "Tạo tài khoản tự động"}</button>
          <small>Mã đăng nhập và mật khẩu sẽ được tạo tự động.</small>
        </form>

        <article className={styles.card}>
          <div className={styles.cardTitle}><span>CHỈ HIỂN THỊ MỘT LẦN</span><h2>Thông tin đăng nhập mới</h2></div>
          {created.length ? <>
            <div className={styles.credentials}>
              {created.map((item) => <div key={item.uid}>
                <strong>{item.displayName}</strong>
                <code>{item.accountCode}</code>
                <code>{item.password}</code>
                <button onClick={() => navigator.clipboard.writeText(`${item.accountCode}\n${item.password}`)}>Sao chép</button>
              </div>)}
            </div>
            <button className={styles.secondary} onClick={downloadCredentials}>Tải danh sách CSV</button>
          </> : <p className={styles.empty}>Tài khoản vừa tạo hoặc mật khẩu vừa reset sẽ xuất hiện tại đây.</p>}
        </article>
      </section>

      <section className={styles.usersCard}>
        <div className={styles.toolbar}>
          <div><span>QUẢN LÝ</span><h2>Danh sách người dùng</h2></div>
          <div><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Tìm tên, mã, lớp..." />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">Tất cả vai trò</option><option value="student">Học sinh</option>
              <option value="teacher">Giáo viên</option><option value="admin">Admin</option>
            </select></div>
        </div>
        <div className={styles.tableWrap}>
          <table><thead><tr><th>Người dùng</th><th>Mã</th><th>Vai trò</th><th>Lớp</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan="6">Đang tải...</td></tr> : visibleUsers.map((item) => (
              <tr key={item.uid}><td><strong>{item.displayName || "Chưa có tên"}</strong><small>{item.email}</small></td>
                <td><code>{item.accountCode}</code></td><td>{item.role}</td><td>{item.className || "—"}</td>
                <td><span className={item.active ? styles.active : styles.disabled}>{item.active ? "Hoạt động" : "Đã khóa"}</span></td>
                <td><div className={styles.actions}><button onClick={() => editUser(item)}>Sửa</button>
                  <button onClick={() => resetPassword(item)}>Reset MK</button>
                  <button onClick={() => updateUser(item, { ...item, active: !item.active })}>{item.active ? "Khóa" : "Mở khóa"}</button>
                </div></td></tr>))}
            </tbody></table>
        </div>
      </section>
    </main>
  );
}

export default function AdminPage() {
  return <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>;
}
