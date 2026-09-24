import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(request) {
  const access = await requireUser(request, ["student"]);
  if (access.error) return access.error;

  try {
    const url = new URL(request.url);
    const gameId = String(url.searchParams.get("gameId") || "");
    const cap = Math.max(1, Math.min(3, Number(url.searchParams.get("cap")) || 1));
    const man = Math.max(1, Math.min(5, Number(url.searchParams.get("man")) || 1));
    if (!/^game[1-4]$/.test(gameId)) {
      return Response.json({ error: "Trò chơi không hợp lệ." }, { status: 400 });
    }

    const classId = String(access.profile.className ?? access.profile.lop ?? "").trim().toUpperCase();
    const permissionSnapshot = classId
      ? await adminDb.collection("classes").doc(classId).collection("gameAccess").doc(gameId).get()
      : null;
    const permission = permissionSnapshot?.exists
      ? permissionSnapshot.data()
      : { enabled: true, maxCap: 3, maxMan: 5 };
    const teacherLocked = permission.enabled === false
      || cap > Number(permission.maxCap || 1)
      || (cap === Number(permission.maxCap || 1) && man > Number(permission.maxMan || 1));
    if (teacherLocked) {
      return Response.json({ error: "Màn này chưa được giáo viên mở." }, { status: 403 });
    }

    const snapshot = await adminDb.collection("games").doc(gameId)
      .collection("levels").doc(`cap${cap}`)
      .collection("stages").doc(`man${man}`)
      .collection("questions").get();
    const questions = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return Response.json({ questions });
  } catch (error) {
    return Response.json({ error: error.message || "Không thể tải câu hỏi." }, { status: 400 });
  }
}
