import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeRole, requireUser } from "@/lib/admin-api";

export const runtime = "nodejs";

const GAME_IDS = ["game1", "game2", "game3", "game4"];
const DEFAULT_ACCESS = { enabled: true, maxCap: 3, maxMan: 5 };

function normalizeAccess(value = {}) {
  return {
    enabled: value.enabled !== false,
    maxCap: Math.max(1, Math.min(3, Number(value.maxCap) || DEFAULT_ACCESS.maxCap)),
    maxMan: Math.max(1, Math.min(5, Number(value.maxMan) || DEFAULT_ACCESS.maxMan)),
  };
}

function teacherClasses(profile) {
  const values = Array.isArray(profile.classIds)
    ? profile.classIds
    : [profile.className ?? profile.lop].filter(Boolean);
  return [...new Set(values.map((value) => String(value).trim().toUpperCase()).filter(Boolean))];
}

async function readAccess(classId) {
  const snapshot = await adminDb.collection("classes").doc(classId).collection("gameAccess").get();
  const saved = Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()]));
  return Object.fromEntries(GAME_IDS.map((gameId) => [gameId, normalizeAccess(saved[gameId])]));
}

export async function GET(request) {
  const access = await requireUser(request, ["teacher"]);
  if (access.error) return access.error;

  try {
    const classIds = teacherClasses(access.profile);
    const classes = await Promise.all(classIds.map(async (classId) => ({
      id: classId,
      name: classId,
      gameAccess: await readAccess(classId),
    })));

    const users = await adminDb.collection("users").get();
    const students = users.docs
      .map((item) => ({ uid: item.id, ...item.data() }))
      .filter((item) => normalizeRole(item.vaiTro ?? item.role) === "student")
      .filter((item) => classIds.includes(String(item.className ?? item.lop ?? "").trim().toUpperCase()))
      .map((item) => ({
        uid: item.uid,
        displayName: item.displayName ?? item.ten ?? "Chưa có tên",
        className: String(item.className ?? item.lop ?? "").trim().toUpperCase(),
        accountCode: item.accountCode ?? "",
      }));

    return Response.json({ classes, students });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể tải quyền trò chơi." }, { status: 400 });
  }
}

export async function PUT(request) {
  const access = await requireUser(request, ["teacher"]);
  if (access.error) return access.error;

  try {
    const body = await request.json();
    const classId = String(body.classId || "").trim().toUpperCase();
    const gameId = String(body.gameId || "").trim();
    const classIds = teacherClasses(access.profile);
    if (!classIds.includes(classId)) {
      return Response.json({ error: "Bạn không phụ trách lớp này." }, { status: 403 });
    }
    if (!GAME_IDS.includes(gameId)) {
      return Response.json({ error: "Trò chơi không hợp lệ." }, { status: 400 });
    }

    const enabled = body.enabled !== false;
    const maxCap = Math.max(1, Math.min(3, Number(body.maxCap) || 1));
    const maxMan = Math.max(1, Math.min(5, Number(body.maxMan) || 1));
    const classRef = adminDb.collection("classes").doc(classId);
    const gameRef = classRef.collection("gameAccess").doc(gameId);

    await Promise.all([
      classRef.set({
        name: classId,
        active: true,
        teacherIds: FieldValue.arrayUnion(access.decoded.uid),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true }),
      gameRef.set({
        enabled,
        maxCap,
        maxMan,
        updatedBy: access.decoded.uid,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true }),
    ]);

    return Response.json({ gameId, access: { enabled, maxCap, maxMan } });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể cập nhật quyền trò chơi." }, { status: 400 });
  }
}
