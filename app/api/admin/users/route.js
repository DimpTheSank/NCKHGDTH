import { randomInt } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { normalizeRole, requireAdmin, safeUser } from "@/lib/admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanClassName(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function initialPassword() {
  const words = ["Meo", "Hoa", "Sao", "May", "Sen", "Cam", "Tre", "Nang"];
  return `${words[randomInt(words.length)]}-${randomInt(1000, 10000)}`;
}

async function nextAccountCode(role, className) {
  const prefix = role === "teacher" ? "GV" : `HS-${cleanClassName(className)}`;
  if (role === "student" && !cleanClassName(className)) {
    throw new Error("Học sinh cần có lớp để tạo mã tài khoản.");
  }

  const snapshot = await adminDb.collection("users")
    .where("vaiTro", "==", role === "teacher" ? "teacher" : "student")
    .get();

  let max = 0;
  snapshot.forEach((item) => {
    const code = String(item.data().accountCode || "");
    if (code.startsWith(`${prefix}-`)) {
      const number = Number(code.slice(prefix.length + 1));
      if (Number.isInteger(number)) max = Math.max(max, number);
    }
  });
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

async function createOne(input, adminUid) {
  const displayName = String(input.displayName || input.ten || "").trim();
  const className = String(input.className || input.lop || "").trim();
  const role = normalizeRole(input.role || input.vaiTro);
  if (!displayName) throw new Error("Họ và tên không được để trống.");
  if (!["student", "teacher"].includes(role)) throw new Error("Chỉ được tạo học sinh hoặc giáo viên.");

  let accountCode = String(input.accountCode || "").trim().toUpperCase();
  if (!accountCode) accountCode = await nextAccountCode(role, className);
  if (!/^[A-Z0-9-]{3,40}$/.test(accountCode)) throw new Error("Mã tài khoản chỉ gồm chữ, số và dấu gạch ngang.");

  const email = `${accountCode.toLowerCase()}@admin.com`;
  const password = input.password || initialPassword();
  let createdUser;

  try {
    createdUser = await adminAuth.createUser({ email, password, displayName, disabled: false });
    await adminAuth.setCustomUserClaims(createdUser.uid, { role });
    await adminDb.collection("users").doc(createdUser.uid).set({
      uid: createdUser.uid,
      email,
      ten: displayName,
      displayName,
      accountCode,
      lop: className,
      className,
      vaiTro: role,
      role,
      active: true,
      mustChangePassword: true,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: adminUid,
    });
  } catch (error) {
    if (createdUser?.uid) await adminAuth.deleteUser(createdUser.uid).catch(() => {});
    if (error.code === "auth/email-already-exists") throw new Error(`Mã ${accountCode} đã tồn tại.`);
    throw error;
  }

  return { uid: createdUser.uid, displayName, accountCode, email, password, role, className };
}

export async function GET(request) {
  const access = await requireAdmin(request);
  if (access.error) return access.error;

  const [authResult, profiles] = await Promise.all([
    adminAuth.listUsers(1000),
    adminDb.collection("users").get(),
  ]);
  const profileMap = new Map(profiles.docs.map((item) => [item.id, item.data()]));
  return Response.json({ users: authResult.users.map((user) => safeUser(user, profileMap.get(user.uid))) });
}

export async function POST(request) {
  const access = await requireAdmin(request);
  if (access.error) return access.error;

  try {
    const body = await request.json();
    const inputs = Array.isArray(body.users) ? body.users : [body];
    if (!inputs.length || inputs.length > 100) {
      return Response.json({ error: "Mỗi lần được tạo từ 1 đến 100 tài khoản." }, { status: 400 });
    }

    const created = [];
    const failed = [];
    for (let index = 0; index < inputs.length; index += 1) {
      try {
        created.push(await createOne(inputs[index], access.decoded.uid));
      } catch (error) {
        failed.push({ index, displayName: inputs[index]?.displayName || "", error: error.message });
      }
    }
    return Response.json({ created, failed }, { status: created.length ? 201 : 400 });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể tạo tài khoản." }, { status: 400 });
  }
}
