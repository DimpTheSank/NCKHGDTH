import { randomInt } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { normalizeRole, requireAdmin, safeUser } from "@/lib/admin-api";

export const runtime = "nodejs";

function newPassword() {
  const words = ["Meo", "Hoa", "Sao", "May", "Sen", "Cam", "Tre", "Nang"];
  return `${words[randomInt(words.length)]}-${randomInt(1000, 10000)}`;
}

export async function PATCH(request, { params }) {
  const access = await requireAdmin(request);
  if (access.error) return access.error;
  const { uid } = await params;

  try {
    const body = await request.json();
    if (uid === access.decoded.uid && (body.active === false || body.action === "disable")) {
      return Response.json({ error: "Bạn không thể tự khóa tài khoản đang sử dụng." }, { status: 400 });
    }

    const ref = adminDb.collection("users").doc(uid);
    const snapshot = await ref.get();
    if (!snapshot.exists) return Response.json({ error: "Không tìm thấy hồ sơ người dùng." }, { status: 404 });

    if (body.action === "reset-password") {
      const password = newPassword();
      await adminAuth.updateUser(uid, { password });
      await adminAuth.revokeRefreshTokens(uid);
      await ref.update({ mustChangePassword: true, passwordResetAt: FieldValue.serverTimestamp() });
      return Response.json({ password });
    }

    const current = snapshot.data();
    const displayName = String(body.displayName ?? current.ten ?? current.displayName ?? "").trim();
    const className = String(body.className ?? current.lop ?? current.className ?? "").trim();
    const role = normalizeRole(body.role ?? current.vaiTro ?? current.role);
    const active = body.active ?? current.active ?? true;
    if (!displayName || !role) return Response.json({ error: "Thông tin người dùng không hợp lệ." }, { status: 400 });

    await Promise.all([
      adminAuth.updateUser(uid, { displayName, disabled: !active }),
      adminAuth.setCustomUserClaims(uid, { role }),
      ref.update({
        ten: displayName, displayName, lop: className, className,
        vaiTro: role, role, active,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: access.decoded.uid,
      }),
    ]);
    const user = await adminAuth.getUser(uid);
    return Response.json({ user: safeUser(user, { ...current, displayName, className, role, active }) });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể cập nhật người dùng." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const access = await requireAdmin(request);
  if (access.error) return access.error;
  const { uid } = await params;

  if (uid === access.decoded.uid) {
    return Response.json({ error: "Bạn không thể tự xóa tài khoản Admin đang sử dụng." }, { status: 400 });
  }

  try {
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      if (error.code !== "auth/user-not-found") throw error;
    }

    await adminDb.recursiveDelete(adminDb.collection("users").doc(uid));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể xóa tài khoản." }, { status: 400 });
  }
}
