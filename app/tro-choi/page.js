"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/app/providers";
import { db } from "@/lib/firebase";
import styles from "./game.module.css";

const places = [
  { id: "tao-dan", gameId: "game1", name: "Công viên Tao Đàn", shortName: "Tao Đàn", icon: "🌳", className: "park", starsPerStage: 1, available: true, task: "Khôi phục khu vườn và đài phun nước." },
  { id: "thao-cam-vien", gameId: "game2", name: "Thảo Cầm Viên", shortName: "Thảo Cầm Viên", icon: "🦒", className: "zoo", starsPerStage: 2, available: true, task: "Đưa cây xanh và muông thú trở lại." },
  { id: "nha-hat", gameId: "game3", name: "Nhà hát Thành phố", shortName: "Nhà hát", icon: "🎭", className: "theater", starsPerStage: 3, available: true, task: "Khôi phục sân khấu và kiến trúc nhà hát." },
  { id: "bach-dang", gameId: "game4", name: "Bến Bạch Đằng", shortName: "Bạch Đằng", icon: "⛵", className: "river", starsPerStage: 4, available: true, task: "Khôi phục bến sông và cảnh quan ven bờ." },
];

const defaultGameAccess = { enabled: true, maxCap: 5, maxMan: 5 };

const levelProgress = [5, 2, 0, 0, 0];

function shuffleItems(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function GameHeader({ onHome, compact = false }) {
  return (
    <header className={`${styles.subHeader} ${compact ? styles.compactHeader : ""}`}>
      <button className={styles.homeButton} onClick={onHome}><span>⌂</span> Trang chủ</button>
      <div className={styles.headerBrand}><span>BIỆT ĐỘI</span><strong>KIẾN TẠO SÀI GÒN</strong></div>
      <button className={styles.avatarButton} aria-label="Mở hồ sơ">HN<span>Hình nhân vật</span></button>
    </header>
  );
}

function ZooScene({ restoredCount }) {
  const [displayedProgress, setDisplayedProgress] = useState(restoredCount);
  const [fadingLayer, setFadingLayer] = useState(null);

  useEffect(() => {
    if (restoredCount <= displayedProgress) {
      setDisplayedProgress(restoredCount);
      return undefined;
    }

    setFadingLayer(Math.min(displayedProgress + 1, 5));
    const timer = window.setTimeout(() => {
      setDisplayedProgress(restoredCount);
      setFadingLayer(null);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [restoredCount, displayedProgress]);

  return (
    <figure className={styles.zooScene}>
      <img
        className={`${styles.zooSceneImage} ${styles.zooBaseImage}`}
        src="/game/game2/G2C1Nen.webp"
        alt="Cảnh nền Thảo Cầm Viên"
      />
      {[1, 2, 3, 4, 5].map((layer) => {
        const isFading = fadingLayer === layer;
        const isRemoved = layer <= displayedProgress;
        return (
          <img
            key={layer}
            className={`${styles.zooSceneImage} ${styles.zooLayerImage} ${isFading ? styles.zooLayerExit : isRemoved ? styles.zooLayerHidden : ""}`}
            src={`/game/game2/G2C1M${layer}.webp`}
            style={{ zIndex: layer + 2 }}
            alt=""
            aria-hidden="true"
          />
        );
      })}
      <figcaption className={styles.restoreCaption}>
        <span>Phục hồi Thảo Cầm Viên</span>
        <strong>{restoredCount}/5 màn hoàn thành</strong>
      </figcaption>
    </figure>
  );
}

function TaoDanScene({ restoredCount }) {
  const state = (step) => restoredCount >= step ? styles.objectRestored : styles.objectRuined;

  return (
    <div className={styles.taoDanScene} aria-label="Cảnh quan Công viên Tao Đàn">
      <div className={styles.parkSun} />
      <div className={styles.parkCloudOne} /><div className={styles.parkCloudTwo} />
      <div className={styles.distantTrees}>
        {[0, 1, 2, 3, 4, 5, 6].map((tree) => <i key={tree} />)}
      </div>
      <div className={styles.parkLawn} />
      <div className={styles.parkPath}><i /><i /><i /><i /><i /></div>
      <div className={styles.treeLeft}><i /><b /><span /></div>
      <div className={styles.treeRight}><i /><b /><span /></div>

      <div className={`${styles.parkObject} ${styles.fountain} ${state(1)}`}>
        <div className={styles.waterTop} /><div className={styles.waterJet} /><div className={styles.fountainBowl} /><div className={styles.fountainBase} />
        <small>Đài phun nước</small>
      </div>
      <div className={`${styles.parkObject} ${styles.bench} ${state(2)}`}>
        <i /><i /><b /><b /><span />
        <small>Ghế công viên</small>
      </div>
      <div className={`${styles.parkObject} ${styles.lamp} ${state(3)}`}>
        <i /><b /><span /><em />
        <small>Đèn đường</small>
      </div>
      <div className={`${styles.parkObject} ${styles.flowerBed} ${state(4)}`}>
        <i /><i /><i /><b /><b /><b />
        <small>Bồn hoa</small>
      </div>
      <div className={`${styles.parkObject} ${styles.butterflies} ${state(5)}`}>
        <i>◆</i><i>◆</i><i>◆</i>
        <small>Sức sống</small>
      </div>

      <div className={styles.parkForeground}>
        <i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className={styles.restoreCaption}>
        <span>Phục hồi cảnh quan</span><strong>{restoredCount}/5 hạng mục</strong>
      </div>
    </div>
  );
}

function GameContent() {
  const { user, profile } = useAuth();
  const [screen, setScreen] = useState("intro");
  const [speechStep, setSpeechStep] = useState(0);
  const [activePlaceId, setActivePlaceId] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [zooProgress, setZooProgress] = useState(0);
  const [exerciseStage, setExerciseStage] = useState(null);
  const [stageQuestions, setStageQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [wordBank, setWordBank] = useState([]);
  const [answerSlots, setAnswerSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [exerciseFeedback, setExerciseFeedback] = useState("");
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [stagePassed, setStagePassed] = useState(false);
  const [gameAccess, setGameAccess] = useState({});
  const [accessMessage, setAccessMessage] = useState("");

  const activePlace = useMemo(
    () => places.find((place) => place.id === activePlaceId) || places[0],
    [activePlaceId]
  );
  const activeAccess = gameAccess[activePlace.gameId] || defaultGameAccess;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user.getIdToken()
      .then((token) => fetch("/api/game-access", { headers: { Authorization: `Bearer ${token}` } }))
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Không thể tải quyền trò chơi.");
        if (!cancelled) setGameAccess(data.gameAccess || {});
      })
      .catch((error) => { if (!cancelled) setAccessMessage(error.message); });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!profile?.uid || !db) return undefined;
    let cancelled = false;

    getDoc(doc(db, "users", profile.uid, "gameProgress", "game2"))
      .then((snapshot) => {
        if (cancelled || !snapshot.exists()) return;
        const saved = Number(snapshot.data().completedStages ?? 0);
        setZooProgress(Math.max(0, Math.min(saved, 5)));
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [profile?.uid]);

  const speeches = [
    "Một cơn bão ngôn từ đã quét qua thành phố khiến mọi thứ bị xáo trộn.",
    "Hãy cùng Cáo Đỏ khôi phục lại thành phố nhé!",
  ];

  function continueIntro() {
    if (speechStep < speeches.length - 1) setSpeechStep((step) => step + 1);
    else setScreen("map");
  }

  function openPlace(place) {
    const permission = gameAccess[place.gameId] || defaultGameAccess;
    if (!place.available || !permission.enabled) {
      setAccessMessage("Trò chơi này đang được giáo viên khóa.");
      return;
    }
    setAccessMessage("");
    setActivePlaceId(place.id);
    setScreen("levels");
  }

  function openLevel(level, isLocked) {
    if (isLocked || level > activeAccess.maxCap) {
      setAccessMessage("Cấp này chưa được giáo viên mở.");
      return;
    }
    setActiveLevel(level);
    setScreen("stages");
  }

  function goHome() {
    setActivePlaceId(null);
    setActiveLevel(null);
    setExerciseStage(null);
    setStageQuestions([]);
    setScreen("map");
  }

  function prepareQuestion(question) {
    const segmentIndexes = question.segments.map((_, index) => index);
    setWordBank(shuffleItems(segmentIndexes));
    setAnswerSlots(Array(question.segments.length).fill(null));
    setSelectedSlot(null);
    setExerciseFeedback("");
  }

  async function openExercise(stage, locked) {
    const teacherLocked = activeLevel > activeAccess.maxCap
      || (activeLevel === activeAccess.maxCap && stage > activeAccess.maxMan);
    if (locked || teacherLocked || !activeAccess.enabled) {
      setAccessMessage("Màn này chưa được giáo viên mở.");
      return;
    }
    if (activePlace.id !== "thao-cam-vien" || activeLevel !== 1) return;

    setExerciseStage(stage);
    setStageQuestions([]);
    setQuestionIndex(0);
    setStagePassed(false);
    setExerciseFeedback("");
    setExerciseLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/game-questions?gameId=game2&cap=1&man=${stage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Không thể tải câu hỏi.");
      const questions = (payload.questions || [])
        .map((questionDoc) => {
          const data = questionDoc;
          const segments = Array.isArray(data.segments) ? data.segments.filter(Boolean) : [];
          const acceptedOrders = Array.isArray(data.acceptedOrders)
            ? data.acceptedOrders.map((order) => Array.isArray(order) ? order.join(",") : String(order))
            : [];
          return {
            id: questionDoc.id,
            segments,
            acceptedOrders: acceptedOrders.length
              ? acceptedOrders
              : [segments.map((_, index) => index).join(",")],
            order: Number(data.order ?? 999),
            active: data.active !== false,
          };
        })
        .filter((question) => question.active && question.segments.length > 1)
        .sort((first, second) => first.order - second.order)
        .slice(0, 3);

      if (questions.length !== 3) {
        setExerciseFeedback(`Màn này cần đúng 3 câu hỏi trong Firestore. Hiện tìm thấy ${questions.length} câu.`);
        return;
      }

      setStageQuestions(questions);
      prepareQuestion(questions[0]);
    } catch (error) {
      setExerciseFeedback(error.message || "Không thể tải câu hỏi từ Firestore.");
    } finally {
      setExerciseLoading(false);
    }
  }

  function chooseWord(segmentIndex) {
    if (stagePassed) return;
    const targetSlot = selectedSlot ?? answerSlots.findIndex((value) => value === null);
    if (targetSlot < 0) {
      setExerciseFeedback("Hãy nhấn vào một vị trí đã xếp để bỏ khối đó ra trước.");
      return;
    }

    setAnswerSlots((slots) => slots.map((value, index) => index === targetSlot ? segmentIndex : value));
    setWordBank((bank) => bank.filter((value) => value !== segmentIndex));
    setSelectedSlot(null);
    setExerciseFeedback("");
  }

  function clearSlot(slotIndex) {
    if (stagePassed) return;
    const segmentIndex = answerSlots[slotIndex];
    if (segmentIndex === null) {
      setSelectedSlot(slotIndex);
      return;
    }

    setAnswerSlots((slots) => slots.map((value, index) => index === slotIndex ? null : value));
    setWordBank((bank) => [...bank, segmentIndex]);
    setSelectedSlot(slotIndex);
    setExerciseFeedback("");
  }

  function submitExercise() {
    if (answerSlots.some((value) => value === null)) {
      setExerciseFeedback("Em hãy điền đủ các vị trí trước khi xác nhận.");
      return;
    }

    const question = stageQuestions[questionIndex];
    const submittedOrder = answerSlots.join(",");
    if (!question.acceptedOrders.includes(submittedOrder)) {
      setExerciseFeedback("Thứ tự chưa đúng. Em hãy nhấn vào khối cần đổi và thử lại nhé!");
      return;
    }

    if (questionIndex < stageQuestions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      prepareQuestion(stageQuestions[nextIndex]);
      return;
    }

    setStagePassed(true);
    setExerciseFeedback("Chính xác! Em đã hoàn thành cả 3 câu của màn này.");
  }

  async function finishExercise() {
    const completedStages = Math.max(zooProgress, exerciseStage);
    setZooProgress(completedStages);
    setExerciseStage(null);
    setStageQuestions([]);
    setStagePassed(false);

    if (profile?.uid && db) {
      try {
        await setDoc(
          doc(db, "users", profile.uid, "gameProgress", "game2"),
          {
            currentLevel: 1,
            currentStage: Math.min(completedStages + 1, 5),
            completedStages,
            totalStars: completedStages * 2,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // Tiến độ vẫn được cập nhật trong phiên nếu Firestore tạm thời không ghi được.
      }
    }
  }

  if (screen === "intro") {
    return (
      <main className={styles.page}>
        <div className={styles.ambientOne} /><div className={styles.ambientTwo} />
        <section className={styles.intro} aria-labelledby="game-title">
          <div className={styles.brandPill}>HÀNH TRÌNH KHÁM PHÁ SÀI GÒN</div>
          <h1 id="game-title" className={styles.title}><span>BIỆT ĐỘI</span><span>KIẾN TẠO SÀI GÒN</span></h1>
          <p className={styles.subtitle}>Mỗi thử thách đúng sẽ giúp thành phố rực rỡ trở lại.</p>
          <div className={styles.introScene}>
            <div className={styles.skyline} aria-hidden="true">
              <span className={styles.buildingOne} /><span className={styles.buildingTwo} />
              <span className={styles.buildingThree} /><span className={styles.buildingFour} />
              <span className={styles.buildingFive} />
            </div>
            <div className={styles.guideArea}>
              <div className={styles.fox} aria-label="Cáo Đỏ">🦊</div>
              <button className={styles.speechBubble} onClick={continueIntro}>
                <span>{speeches[speechStep]}</span><small>Chạm để tiếp tục</small>
              </button>
            </div>
          </div>
          <button className={styles.startButton} onClick={continueIntro}>
            {speechStep === speeches.length - 1 ? "Bắt đầu hành trình" : "Tiếp tục"} <span>→</span>
          </button>
          <div className={styles.dots}>
            {speeches.map((_, index) => <span key={index} className={index === speechStep ? styles.activeDot : ""} />)}
          </div>
        </section>
      </main>
    );
  }

  if (screen === "levels") {
    return (
      <main className={styles.page}>
        <section className={styles.gameShell}>
          <GameHeader onHome={goHome} />
          <div className={styles.sectionHeading}>
            <button onClick={() => setScreen("map")} aria-label="Quay lại bản đồ">←</button>
            <div><span>{activePlace.icon}</span><div><small>ĐỊA ĐIỂM</small><h1>{activePlace.name}</h1></div></div>
            <strong>{activePlace.starsPerStage} ⭐ / màn</strong>
          </div>
          <div className={styles.levelsArea}>
            <div className={styles.levelCards}>
              {[1, 2, 3, 4, 5].map((level) => {
                const isZooLevel = activePlace.id === "thao-cam-vien";
                const completedStages = isZooLevel && level === 1 ? zooProgress : levelProgress[level - 1];
                const progressLocked = isZooLevel ? level > (zooProgress === 5 ? 2 : 1) : level > 2;
                const teacherLocked = !activeAccess.enabled || level > activeAccess.maxCap;
                const isLocked = progressLocked || teacherLocked;
                const earned = completedStages * activePlace.starsPerStage;
                const total = 5 * activePlace.starsPerStage;
                return (
                  <button
                    key={level}
                    className={`${styles.levelCard} ${isLocked ? styles.levelLocked : ""} ${level === 2 ? styles.currentLevel : ""}`}
                    onClick={() => openLevel(level, isLocked)}
                    disabled={isLocked}
                  >
                    <span className={styles.levelNumber}>CẤP {level}</span>
                    <div className={styles.levelLandscape}>
                      <span>{activePlace.icon}</span><i /><i /><i />
                    </div>
                    <div className={styles.levelState}>
                      <b>{isLocked ? "🔒" : completedStages === 5 ? "✓" : "▶"}</b>
                      <span>{earned}/{total} ⭐</span>
                    </div>
                    <small>{teacherLocked ? "Giáo viên chưa mở" : isLocked ? "Chưa mở khóa" : completedStages === 5 ? "Đã hoàn thành" : "Tiếp tục"}</small>
                  </button>
                );
              })}
            </div>
            <p className={styles.levelNote}>Hoàn thành đủ 5 màn của một cấp để mở khóa cấp tiếp theo.</p>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "stages") {
    const stageProgress = activePlace.id === "thao-cam-vien" && activeLevel === 1
      ? zooProgress
      : activeLevel === 1 ? 5 : 2;
    return (
      <main className={styles.page}>
        <section className={styles.gameShell}>
          <GameHeader onHome={goHome} compact />
          <div className={styles.stageHeading}>
            <button onClick={() => setScreen("levels")}>← Các cấp</button>
            <div><span>{activePlace.icon}</span><strong>{activePlace.shortName} · Cấp {activeLevel}</strong></div>
            <span>{stageProgress * activePlace.starsPerStage}/{5 * activePlace.starsPerStage} ⭐</span>
          </div>
          <div className={styles.restorationLayout}>
            {activePlace.id === "thao-cam-vien" && activeLevel === 1 ? (
              <ZooScene restoredCount={stageProgress} />
            ) : activePlace.id === "tao-dan" ? (
              <TaoDanScene restoredCount={stageProgress} />
            ) : (
              <div className={styles.restorationScene}>
                <div className={styles.sceneSky}>☁️　☁️</div>
                <div className={styles.sceneTrees}>🌴　🌳　🌴　🌳　🌴</div>
                <div className={styles.scenePath}>
                  <span className={stageProgress >= 1 ? styles.restored : styles.missing}>⛲</span>
                  <span className={stageProgress >= 2 ? styles.restored : styles.missing}>🪑</span>
                  <span className={stageProgress >= 3 ? styles.restored : styles.missing}>💡</span>
                  <span className={stageProgress >= 4 ? styles.restored : styles.missing}>🌺</span>
                  <span className={stageProgress >= 5 ? styles.restored : styles.missing}>🦋</span>
                </div>
                <div className={styles.sceneGround}>🌿　🌼　🌱　🌷　🌿　🌻　🌱</div>
              </div>
            )}
            <div className={styles.stageList}>
              {[1, 2, 3, 4, 5].map((stage) => {
                const completed = stage <= stageProgress;
                const current = stage === stageProgress + 1;
                const progressLocked = stage > stageProgress + 1;
                const teacherLocked = !activeAccess.enabled || activeLevel > activeAccess.maxCap
                  || (activeLevel === activeAccess.maxCap && stage > activeAccess.maxMan);
                const locked = progressLocked || teacherLocked;
                return (
                  <button
                    key={stage}
                    className={`${styles.stageButton} ${completed ? styles.stageDone : ""} ${current ? styles.stageCurrent : ""}`}
                    disabled={locked}
                    onClick={() => openExercise(stage, locked)}
                  >
                    <span>{completed ? "✓" : locked ? "🔒" : "▶"}</span>
                    <div><strong>MÀN {stage}</strong><small>{teacherLocked ? "GIÁO VIÊN CHƯA MỞ" : `${activePlace.starsPerStage} SAO ${completed ? "(M)" : locked ? "(K)" : "· SẴN SÀNG"}`}</small></div>
                    <b>{activePlace.starsPerStage} ⭐</b>
                  </button>
                );
              })}
            </div>
          </div>

          {exerciseStage && (
            <div className={styles.exerciseBackdrop} onClick={() => setExerciseStage(null)}>
              <article className={styles.exerciseCard} onClick={(event) => event.stopPropagation()}>
                <button className={styles.exerciseClose} onClick={() => setExerciseStage(null)} aria-label="Đóng bài tập">×</button>
                <span className={styles.exerciseEyebrow}>THẢO CẦM VIÊN · CẤP 1 · MÀN {exerciseStage}</span>

                {exerciseLoading ? (
                  <p className={styles.exerciseStatus}>Đang tải 3 câu hỏi từ Firestore...</p>
                ) : stageQuestions.length ? (
                  <>
                    <div className={styles.questionCounter}>CÂU {questionIndex + 1} / {stageQuestions.length}</div>
                    <h2>Sắp xếp các khối để tạo thành câu đúng</h2>
                    <p className={styles.puzzleHint}>Nhấn một khối để đưa vào vị trí trống. Nhấn lại vị trí đã xếp để lấy khối ra.</p>

                    <div className={styles.sentenceSlots} aria-label="Câu trả lời đang sắp xếp">
                      {answerSlots.map((segmentIndex, slotIndex) => (
                        <button
                          key={slotIndex}
                          className={`${styles.sentenceSlot} ${segmentIndex !== null ? styles.slotFilled : ""} ${selectedSlot === slotIndex ? styles.slotSelected : ""}`}
                          onClick={() => clearSlot(slotIndex)}
                        >
                          <small>{slotIndex + 1}</small>
                          <span>{segmentIndex === null ? "Chọn khối" : stageQuestions[questionIndex].segments[segmentIndex]}</span>
                        </button>
                      ))}
                    </div>

                    <div className={styles.wordBank} aria-label="Các khối chưa sử dụng">
                      {wordBank.map((segmentIndex) => (
                        <button key={segmentIndex} className={styles.wordBlock} onClick={() => chooseWord(segmentIndex)}>
                          {stageQuestions[questionIndex].segments[segmentIndex]}
                        </button>
                      ))}
                    </div>

                    {exerciseFeedback && (
                      <p className={stagePassed ? styles.feedbackCorrect : styles.feedbackWrong}>
                        {exerciseFeedback}
                      </p>
                    )}
                    <div className={styles.exerciseActions}>
                      {!stagePassed && (
                        <button className={styles.primaryButton} onClick={submitExercise}>Xác nhận thứ tự</button>
                      )}
                      {stagePassed && (
                        <button className={styles.continueButton} onClick={finishExercise}>
                          Xem cảnh phục hồi →
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className={styles.feedbackWrong}>{exerciseFeedback || "Màn này chưa có đủ câu hỏi."}</p>
                )}
              </article>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.gameShell}>
        <header className={styles.topBar}>
          <div className={styles.profile}><div className={styles.avatar}>HN</div><div><span>Nhà kiến tạo</span><strong>HỌ TÊN HỌC SINH</strong></div></div>
          <div className={styles.mapTitle}><span>Bản đồ nhiệm vụ</span><strong>BẢN ĐỒ THÀNH PHỐ</strong></div>
          <nav className={styles.actions} aria-label="Công cụ trò chơi">
            <button aria-label="Hộp thư">✉️<b>1</b></button><button aria-label="Bảng xếp hạng">🏆</button>
            <button aria-label={soundOn ? "Tắt âm thanh" : "Bật âm thanh"} onClick={() => setSoundOn(!soundOn)}>{soundOn ? "🔊" : "🔇"}</button>
          </nav>
        </header>
        <div className={styles.mapArea}>
          {accessMessage && <div className={styles.accessNotice}>{accessMessage}</div>}
          <div className={styles.mapGrid}>
            {places.map((place) => {
              const teacherLocked = !(gameAccess[place.gameId] || defaultGameAccess).enabled;
              return (
              <button key={place.id} disabled={teacherLocked}
                className={`${styles.place} ${styles[place.className]} ${teacherLocked ? styles.locked : ""}`}
                onClick={() => openPlace(place)}>
                <span className={styles.placeLabel}>{place.name}</span><span className={styles.pin}>📍</span>
                <span className={styles.placeIcon}>{teacherLocked ? "🔒" : place.icon}</span>
                <span className={styles.placeHint}>{teacherLocked ? "Giáo viên đang khóa" : "Chọn địa điểm"}</span>
              </button>
            );})}
          </div>
          <aside className={styles.foxGuide}><span className={styles.mapFox}>🦊</span><div><strong>Cáo Đỏ</strong><p>Chọn một địa điểm để xem các cấp phục hồi nhé!</p></div></aside>
        </div>
      </section>
    </main>
  );
}


export default function GamePage() {
  return <ProtectedRoute allowedRoles={["student"]}><GameContent /></ProtectedRoute>;
}
