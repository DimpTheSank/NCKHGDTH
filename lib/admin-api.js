import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function requireUser(request, allowedRoles = []) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { error: Response.json({ error: "Bạn chưa đăng nhập." }, { status: 401 }) };

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const snapshot = await adminDb.collection("users").doc(decoded.uid).get();
    const profile = snapshot.data() || {};
    const role = normalizeRole(profile.vaiTro ?? profile.role ?? decoded.role);
    if (!snapshot.exists || !role) {
      return { error: Response.json({ error: "Tài khoản chưa có vai trò hợp lệ." }, { status: 403 }) };
    }
    if (profile.active === false) {
      return { error: Response.json({ error: "Tài khoản đã bị khóa." }, { status: 403 }) };
    }
    if (allowedRoles.length && !allowedRoles.includes(role)) {
      return { error: Response.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 }) };
    }
    return { decoded, profile, role };
  } catch {
    return { error: Response.json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." }, { status: 401 }) };
  }
}

export async function requireAdmin(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return { error: Response.json({ error: "Bạn chưa đăng nhập." }, { status: 401 }) };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("users").doc(decoded.uid).get();
    const data = profile.data() || {};
    const role = String(data.vaiTro ?? data.role ?? "").trim().toLowerCase();
    const hasAdminClaim = decoded.admin === true || decoded.role === "admin";

    if (!profile.exists || (role !== "admin" && !hasAdminClaim)) {
      return { error: Response.json({ error: "Bạn không có quyền quản trị." }, { status: 403 }) };
    }
    if (data.active === false) {
      return { error: Response.json({ error: "Tài khoản quản trị đã bị khóa." }, { status: 403 }) };
    }
    return { decoded, profile: data };
  } catch {
    return { error: Response.json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." }, { status: 401 }) };
  }
}

export function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (["student", "học sinh", "hoc sinh"].includes(role)) return "student";
  if (["teacher", "giáo viên", "giao vien"].includes(role)) return "teacher";
  if (["admin", "quản trị", "quan tri"].includes(role)) return "admin";
  return null;
}

export function safeUser(user, profile = {}) {
  return {
    uid: user.uid,
    email: user.email || profile.email || "",
    displayName: profile.ten || profile.displayName || user.displayName || "",
    accountCode: profile.accountCode || user.email?.split("@")[0]?.toUpperCase() || "",
    role: normalizeRole(profile.vaiTro ?? profile.role) || "student",
    className: profile.lop || profile.className || "",
    active: !user.disabled && profile.active !== false,
    createdAt: user.metadata.creationTime || null,
    lastSignInAt: user.metadata.lastSignInTime || null,
  };
}
