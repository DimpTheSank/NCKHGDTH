"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers";
import { db } from "@/lib/firebase";
import styles from "./teacher.module.css";

const emptyQuestion = () => ({ rawSentence: "", alternativeOrders: "" });
const gameNames = {
  game1: "Công viên Tao Đàn",
  game2: "Thảo Cầm Viên",
  game3: "Nhà hát Thành phố",
  game4: "Bến Bạch Đằng",
};

async function teacherRequest(user, options = {}) {
  const token = await user.getIdToken();
  const response = await fetch("/api/teacher/game-access", {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Yêu cầu không thành công.");
  return data;
}

const samples = {
  "game2-cap1-man1": [
    "Đồng cỏ/ bên kia sông/ là một thế giới/ xanh tuyệt đẹp",
    "Cỏ/ phủ kín/ cánh đồng/ như một thảm cây/ xanh mát",
    "Con mèo mướp/ cuộn tròn/ phơi nắng/ ngoài hiên",
  ],
  "game2-cap1-man2": [
    "Hàng cây tùng/ ngả nghiêng/ như đang nhảy múa/ trong gió",
    "Những chú chim sâu/ cần cù/ tìm bắt từng con sâu/ trong kẽ lá",
    "Trong tà áo dài thướt tha/ họa mi/ trông dịu dàng,/ uyển chuyển",
  ],
};

function splitSegments(rawSentence) {
  return rawSentence.split("/").map((item) => item.trim()).filter(Boolean);
}

function parseAlternativeOrders(value, segmentCount) {
  if (!value.trim()) return [];
  return value.split(";").map((orderText) => {
    const order = orderText
      .trim()
      .split(/[-,\s]+/)
      .filter(Boolean)
      .map((number) => Number(number) - 1);

    const validNumbers = order.length === segmentCount
      && order.every((number) => Number.isInteger(number) && number >= 0 && number < segmentCount)
      && new Set(order).size === segmentCount;

    if (!validNumbers) throw new Error(`Thứ tự thay thế phải chứa đủ các số từ 1 đến ${segmentCount}.`);
    return order.join(",");
  });
}

function TeacherDashboard() {
  const { user, profile, logout } = useAuth();
  const [gameId, setGameId] = useState("game2");
  const [levelId, setLevelId] = useState("cap1");
  const [stageId, setStageId] = useState("man1");
  const [questions, setQuestions] = useState([emptyQuestion(), emptyQuestion(), emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessFeedback, setAccessFeedback] = useState("");

  const locationKey = `${gameId}-${levelId}-${stageId}`;
  const questionPath = useMemo(
    () => ["games", gameId, "levels", levelId, "stages", stageId, "questions"],
    [gameId, levelId, stageId]
  );

  useEffect(() => {
    if (!user) return;
    async function loadGameAccess() {
      setAccessLoading(true);
      try {
        const data = await teacherRequest(user);
        setClasses(data.classes || []);
        setStudents(data.students || []);
        setSelectedClassId((current) => current || data.classes?.[0]?.id || "");
      } catch (error) {
        setAccessFeedback(error.message);
      } finally {
        setAccessLoading(false);
      }
    }
    loadGameAccess();
  }, [user]);

  const selectedClass = classes.find((item) => item.id === selectedClassId);

  function updateLocalAccess(gameId, changes) {
    setClasses((current) => current.map((classItem) => classItem.id === selectedClassId
      ? { ...classItem, gameAccess: {
        ...classItem.gameAccess,
        [gameId]: { ...classItem.gameAccess[gameId], ...changes },
      } }
      : classItem));
  }

  async function saveGameAccess(gameId) {
    const value = selectedClass?.gameAccess?.[gameId];
    if (!value) return;
    setAccessLoading(true);
    setAccessFeedback("");
    try {
      await teacherRequest(user, {
        method: "PUT",
        body: JSON.stringify({ classId: selectedClassId, gameId, ...value }),
      });
      setAccessFeedback(`Đã cập nhật ${gameNames[gameId]} cho lớp ${selectedClassId}.`);
    } catch (error) {
      setAccessFeedback(error.message);
    } finally {
      setAccessLoading(false);
    }
  }

  useEffect(() => {
    if (!db) return;

    async function loadQuestions() {
      setLoading(true);
      setFeedback("");
      try {
        const snapshot = await getDocs(collection(db, ...questionPath));
        if (snapshot.empty) {
          setQuestions([emptyQuestion(), emptyQuestion(), emptyQuestion()]);
          return;
        }

        const loaded = snapshot.docs
          .map((item) => item.data())
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .slice(0, 3)
          .map((item) => ({
            rawSentence: item.rawSentence || (item.segments || []).join("/ "),
            alternativeOrders: (item.acceptedOrders || [])
              .slice(1)
              .map((order) => order.split(",").map((number) => Number(number) + 1).join("-"))
              .join("; "),
          }));

        while (loaded.length < 3) loaded.push(emptyQuestion());
        setQuestions(loaded);
      } catch {
        setFeedback("Không thể đọc câu hỏi. Hãy kiểm tra Firestore Security Rules.");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [questionPath]);

  function updateQuestion(index, field, value) {
    setQuestions((current) => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  }

  function loadSample() {
    const stageSamples = samples[locationKey];
    if (!stageSamples) {
      setFeedback("Chưa có bộ câu mẫu cho game, cấp và màn này.");
      return;
    }
    setQuestions(stageSamples.map((rawSentence) => ({ rawSentence, alternativeOrders: "" })));
    setFeedback("Đã nạp ba câu mẫu. Hãy kiểm tra rồi nhấn Lưu vào Firestore.");
  }

  async function saveQuestions(event) {
    event.preventDefault();
    setFeedback("");

    try {
      const prepared = questions.map((question, index) => {
        const segments = splitSegments(question.rawSentence);
        if (segments.length < 2) throw new Error(`Câu ${index + 1} cần ít nhất hai khối, ngăn cách bằng dấu /.`);

        const defaultOrder = segments.map((_, segmentIndex) => segmentIndex).join(",");
        const alternativeOrders = parseAlternativeOrders(question.alternativeOrders, segments.length);

        return {
          rawSentence: question.rawSentence.trim(),
          segments,
          acceptedOrders: [defaultOrder, ...alternativeOrders.filter((order) => order !== defaultOrder)],
          order: index + 1,
          active: true,
          updatedAt: serverTimestamp(),
          updatedBy: profile.uid,
        };
      });

      setLoading(true);
      const batch = writeBatch(db);
      prepared.forEach((question, index) => {
        batch.set(doc(db, ...questionPath, `q${index + 1}`), question, { merge: true });
      });
      await batch.commit();
      setFeedback("Đã lưu ba câu hỏi vào Firestore thành công.");
    } catch (error) {
      setFeedback(error.message || "Không thể lưu câu hỏi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><span>KHU VỰC GIÁO VIÊN</span><strong>QUẢN LÝ CÂU HỎI TRÒ CHƠI</strong></div>
        <div className={styles.account}><span>{profile.name}</span><button onClick={logout}>Đăng xuất</button></div>
      </header>

      <section className={styles.intro}>
        <div>
          <span>NGÂN HÀNG CÂU HỎI</span>
          <h1>Tạo bài tập<br />sắp xếp câu</h1>
          <p>Mỗi màn gồm đúng ba câu. Dùng dấu <b>/</b> để chia câu thành các khối cho học sinh sắp xếp.</p>
        </div>
        <div className={styles.teacherIcon} aria-hidden="true">👩‍🏫</div>
      </section>

      <section className={styles.accessPanel}>
        <div className={styles.accessHeading}>
          <div><span>KIỂM SOÁT TRÒ CHƠI</span><h2>Giới hạn màn được phép chơi</h2></div>
          <label>Lớp phụ trách
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>

        {!accessLoading && !classes.length ? (
          <p className={styles.accessEmpty}>Tài khoản giáo viên chưa có <b>classIds</b>. Hãy liên hệ Admin để gán lớp phụ trách.</p>
        ) : (
          <div className={styles.accessGrid}>
            {Object.entries(gameNames).map(([accessGameId, name]) => {
              const value = selectedClass?.gameAccess?.[accessGameId] || { enabled: true, maxCap: 5, maxMan: 5 };
              return (
                <article className={styles.accessCard} key={accessGameId}>
                  <div><strong>{name}</strong><small>{accessGameId.toUpperCase()}</small></div>
                  <label className={styles.switchRow}>
                    <input type="checkbox" checked={value.enabled}
                      onChange={(event) => updateLocalAccess(accessGameId, { enabled: event.target.checked })} />
                    <span>{value.enabled ? "Đang mở" : "Đang khóa"}</span>
                  </label>
                  <div className={styles.limitFields}>
                    <label>Cấp tối đa<select value={value.maxCap}
                      onChange={(event) => updateLocalAccess(accessGameId, { maxCap: Number(event.target.value) })}>
                      {[1,2,3,4,5].map((number) => <option key={number} value={number}>Cấp {number}</option>)}
                    </select></label>
                    <label>Màn tối đa<select value={value.maxMan}
                      onChange={(event) => updateLocalAccess(accessGameId, { maxMan: Number(event.target.value) })}>
                      {[1,2,3,4,5].map((number) => <option key={number} value={number}>Màn {number}</option>)}
                    </select></label>
                  </div>
                  <button onClick={() => saveGameAccess(accessGameId)} disabled={accessLoading || !selectedClassId}>Áp dụng</button>
                </article>
              );
            })}
          </div>
        )}
        <p className={styles.classSummary}>Lớp {selectedClassId || "—"}: {students.filter((item) => item.className === selectedClassId).length} học sinh</p>
        {accessFeedback && <div className={accessFeedback.startsWith("Đã") ? styles.success : styles.feedback}>{accessFeedback}</div>}
      </section>

      <form className={styles.workspace} onSubmit={saveQuestions}>
        <div className={styles.toolbar}>
          <label>Game
            <select value={gameId} onChange={(event) => setGameId(event.target.value)}>
              {[1,2,3,4].map((number) => <option key={number} value={`game${number}`}>Game {number}</option>)}
            </select>
          </label>
          <label>Cấp
            <select value={levelId} onChange={(event) => setLevelId(event.target.value)}>
              {[1,2,3,4,5].map((number) => <option key={number} value={`cap${number}`}>Cấp {number}</option>)}
            </select>
          </label>
          <label>Màn
            <select value={stageId} onChange={(event) => setStageId(event.target.value)}>
              {[1,2,3,4,5].map((number) => <option key={number} value={`man${number}`}>Màn {number}</option>)}
            </select>
          </label>
          <button type="button" className={styles.sampleButton} onClick={loadSample}>Nạp câu mẫu</button>
        </div>

        <div className={styles.questionList}>
          {questions.map((question, index) => {
            const segments = splitSegments(question.rawSentence);
            return (
              <article className={styles.questionCard} key={index}>
                <div className={styles.questionNumber}>{index + 1}</div>
                <div className={styles.questionBody}>
                  <label>Câu có dấu phân cách
                    <textarea
                      value={question.rawSentence}
                      onChange={(event) => updateQuestion(index, "rawSentence", event.target.value)}
                      placeholder="Buổi sáng,/ con mèo mun/ nằm phơi nắng/ trước sân."
                      required
                    />
                  </label>
                  <div className={styles.preview}>
                    <small>XEM TRƯỚC CÁC KHỐI</small>
                    <div>
                      {segments.length ? segments.map((segment, segmentIndex) => (
                        <span key={`${segment}-${segmentIndex}`}><b>{segmentIndex + 1}</b>{segment}</span>
                      )) : <em>Nhập câu để xem trước.</em>}
                    </div>
                  </div>
                  <label>Thứ tự đúng khác <small>(không bắt buộc)</small>
                    <input
                      value={question.alternativeOrders}
                      onChange={(event) => updateQuestion(index, "alternativeOrders", event.target.value)}
                      placeholder="Ví dụ: 2-3-4-1; 4-1-2-3"
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>

        {feedback && <div className={feedback.includes("thành công") ? styles.success : styles.feedback}>{feedback}</div>}
        <button className={styles.saveButton} type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Lưu 3 câu vào Firestore"}
        </button>
      </form>
    </main>
  );
}

export default function TeacherPage() {
  return <ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>;
}
