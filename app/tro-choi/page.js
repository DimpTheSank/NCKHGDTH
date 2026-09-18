"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import styles from "./game.module.css";

const places = [
  { id: "tao-dan", name: "Công viên Tao Đàn", shortName: "Tao Đàn", icon: "🌳", className: "park", starsPerStage: 1, available: true, task: "Khôi phục khu vườn và đài phun nước." },
  { id: "thao-cam-vien", name: "Thảo Cầm Viên", shortName: "Thảo Cầm Viên", icon: "🦒", className: "zoo", starsPerStage: 2, available: true, task: "Đưa cây xanh và muông thú trở lại." },
  { id: "nha-hat", name: "Nhà hát Thành phố", shortName: "Nhà hát", icon: "🎭", className: "theater", starsPerStage: 3, available: true, task: "Khôi phục sân khấu và kiến trúc nhà hát." },
  { id: "bach-dang", name: "Bến Bạch Đằng", shortName: "Bạch Đằng", icon: "⛵", className: "river", starsPerStage: 4, available: true, task: "Khôi phục bến sông và cảnh quan ven bờ." },
];

const levelProgress = [5, 2, 0, 0, 0];

const zooExercises = [
  {
    question: "Which animal has a very long neck?",
    options: ["A tiger", "A giraffe", "A crocodile", "A penguin"],
    answer: 1,
  },
  {
    question: "Choose the correct sentence.",
    options: ["The monkeys is climbing.", "The monkeys are climbing.", "The monkeys climbing.", "The monkeys are climb."],
    answer: 1,
  },
  {
    question: "What should visitors do to protect the animals?",
    options: ["Feed them freely", "Make loud noises", "Follow the zoo rules", "Climb over the fence"],
    answer: 2,
  },
  {
    question: "Complete the sentence: The elephant is ___ than the monkey.",
    options: ["big", "bigger", "biggest", "more big"],
    answer: 1,
  },
  {
    question: "Which action helps protect nature?",
    options: ["Dropping litter", "Breaking branches", "Saving water", "Chasing animals"],
    answer: 2,
  },
];

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
  const currentLayer = restoredCount < 5
    ? `/game/game2/Cap1_M${restoredCount}.webp`
    : null;

  return (
    <figure className={styles.zooScene}>
      <img
        className={`${styles.zooSceneImage} ${styles.zooBaseImage}`}
        src="/game/game2/Cap1_Nen.webp"
        alt="Cảnh nền Thảo Cầm Viên"
      />
      {currentLayer && (
        <img
          key={currentLayer}
          className={`${styles.zooSceneImage} ${styles.zooLayerImage}`}
          src={currentLayer}
          alt=""
          aria-hidden="true"
        />
      )}
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
  const [screen, setScreen] = useState("intro");
  const [speechStep, setSpeechStep] = useState(0);
  const [activePlaceId, setActivePlaceId] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [zooProgress, setZooProgress] = useState(0);
  const [exerciseStage, setExerciseStage] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [exerciseFeedback, setExerciseFeedback] = useState("");

  const activePlace = useMemo(
    () => places.find((place) => place.id === activePlaceId) || places[0],
    [activePlaceId]
  );

  const speeches = [
    "Một cơn bão ngôn từ đã quét qua thành phố khiến mọi thứ bị xáo trộn.",
    "Hãy cùng Cáo Đỏ khôi phục lại thành phố nhé!",
  ];

  function continueIntro() {
    if (speechStep < speeches.length - 1) setSpeechStep((step) => step + 1);
    else setScreen("map");
  }

  function openPlace(place) {
    if (!place.available) return;
    setActivePlaceId(place.id);
    setScreen("levels");
  }

  function openLevel(level, isLocked) {
    if (isLocked) return;
    setActiveLevel(level);
    setScreen("stages");
  }

  function goHome() {
    setActivePlaceId(null);
    setActiveLevel(null);
    setExerciseStage(null);
    setScreen("map");
  }

  function openExercise(stage, locked) {
    if (locked || activePlace.id !== "thao-cam-vien" || activeLevel !== 1) return;
    setExerciseStage(stage);
    setSelectedAnswer(null);
    setExerciseFeedback("");
  }

  function submitExercise() {
    if (selectedAnswer === null) {
      setExerciseFeedback("Hãy chọn một đáp án trước khi kiểm tra.");
      return;
    }

    const exercise = zooExercises[exerciseStage - 1];
    if (selectedAnswer !== exercise.answer) {
      setExerciseFeedback("Chưa chính xác. Em hãy thử lại nhé!");
      return;
    }

    setExerciseFeedback("Chính xác! Một phần Thảo Cầm Viên đã được phục hồi.");
    if (exerciseStage === zooProgress + 1) {
      setZooProgress((progress) => Math.min(progress + 1, 5));
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
                const isLocked = isZooLevel ? level > (zooProgress === 5 ? 2 : 1) : level > 2;
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
                    <small>{isLocked ? "Chưa mở khóa" : completedStages === 5 ? "Đã hoàn thành" : "Tiếp tục"}</small>
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
                const locked = stage > stageProgress + 1;
                return (
                  <button
                    key={stage}
                    className={`${styles.stageButton} ${completed ? styles.stageDone : ""} ${current ? styles.stageCurrent : ""}`}
                    disabled={locked}
                    onClick={() => openExercise(stage, locked)}
                  >
                    <span>{completed ? "✓" : locked ? "🔒" : "▶"}</span>
                    <div><strong>MÀN {stage}</strong><small>{activePlace.starsPerStage} SAO {completed ? "(M)" : locked ? "(K)" : "· SẴN SÀNG"}</small></div>
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
                <h2>{zooExercises[exerciseStage - 1].question}</h2>
                <div className={styles.answerGrid}>
                  {zooExercises[exerciseStage - 1].options.map((option, index) => (
                    <button
                      key={option}
                      className={selectedAnswer === index ? styles.answerSelected : ""}
                      onClick={() => {
                        setSelectedAnswer(index);
                        setExerciseFeedback("");
                      }}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>
                      {option}
                    </button>
                  ))}
                </div>
                {exerciseFeedback && (
                  <p className={exerciseFeedback.startsWith("Chính xác") ? styles.feedbackCorrect : styles.feedbackWrong}>
                    {exerciseFeedback}
                  </p>
                )}
                <div className={styles.exerciseActions}>
                  <button className={styles.primaryButton} onClick={submitExercise}>Kiểm tra đáp án</button>
                  {exerciseFeedback.startsWith("Chính xác") && (
                    <button className={styles.continueButton} onClick={() => setExerciseStage(null)}>
                      Xem cảnh phục hồi →
                    </button>
                  )}
                </div>
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
          <div className={styles.mapGrid}>
            {places.map((place) => (
              <button key={place.id} className={`${styles.place} ${styles[place.className]}`} onClick={() => openPlace(place)}>
                <span className={styles.placeLabel}>{place.name}</span><span className={styles.pin}>📍</span>
                <span className={styles.placeIcon}>{place.icon}</span><span className={styles.placeHint}>Chọn địa điểm</span>
              </button>
            ))}
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
