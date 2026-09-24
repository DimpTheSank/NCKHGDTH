import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/admin-api";

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

export async function GET(request) {
  const access = await requireUser(request, ["student"]);
  if (access.error) return access.error;

  try {
    const classId = String(access.profile.className ?? access.profile.lop ?? "").trim().toUpperCase();
    if (!classId) return Response.json({ classId: "", gameAccess: {} });

    const snapshot = await adminDb.collection("classes").doc(classId).collection("gameAccess").get();
    const saved = Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data()]));
    const gameAccess = Object.fromEntries(GAME_IDS.map((gameId) => [gameId, normalizeAccess(saved[gameId])]));
    return Response.json({ classId, gameAccess });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể tải giới hạn trò chơi." }, { status: 400 });
  }
}
