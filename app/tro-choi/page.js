"use client";

import { useState } from "react";
import styles from "./game.module.css";

const places = [
  { id: "tao-dan", name: "Công viên Tao Đàn", icon: "🌳", className: "park", status: "available", task: "Khám phá không gian xanh giữa lòng thành phố." },
  { id: "thao-cam-vien", name: "Thảo Cầm Viên", icon: "🦒", className: "zoo", status: "available", task: "Tìm hiểu cách bảo vệ động vật và thiên nhiên." },
  { id: "nha-hat", name: "Nhà hát Thành phố", icon: "🎭", className: "theater", status: "locked", task: "Khám phá nghệ thuật và kiến trúc Sài Gòn." },
  { id: "bach-dang", name: "Bến Bạch Đằng", icon: "⛵", className: "river", status: "locked", task: "Tìm hiểu dòng sông gắn với lịch sử thành phố." },
];

export default function GamePage() {
  const [screen, setScreen] = useState("intro");
  const [speechStep, setSpeechStep] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  const speeches = [
    "Một cơn bão ngôn từ đã quét qua thành phố khiến mọi thứ bị xáo trộn.",
    "Hãy cùng Cáo Đỏ khôi phục lại thành phố nhé!",
  ];

  function continueIntro() {
    if (speechStep < speeches.length - 1) {
      setSpeechStep((step) => step + 1);
      return;
    }
    setScreen("map");
  }

  return (
    <main className={styles.page}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      {screen === "intro" ? (
        <section className={styles.intro} aria-labelledby="game-title">
          <div className={styles.brandPill}>HÀNH TRÌNH KHÁM PHÁ SÀI GÒN</div>
          <h1 id="game-title" className={styles.title}>
            <span>BIỆT ĐỘI</span>
            <span>KIẾN TẠO SÀI GÒN</span>
          </h1>
          <p className={styles.subtitle}>Mỗi thử thách đúng sẽ giúp thành phố rực rỡ trở lại.</p>

          <div className={styles.introScene}>
            <div className={styles.skyline} aria-hidden="true">
              <span className={styles.buildingOne} />
              <span className={styles.buildingTwo} />
              <span className={styles.buildingThree} />
              <span className={styles.buildingFour} />
              <span className={styles.buildingFive} />
            </div>

            <div className={styles.guideArea}>
              <div className={styles.fox} aria-label="Cáo Đỏ, nhân vật hướng dẫn">
                <span className={styles.foxTail}>🦊</span>
              </div>
              <button className={styles.speechBubble} onClick={continueIntro}>
                <span>{speeches[speechStep]}</span>
                <small>Chạm để tiếp tục</small>
              </button>
            </div>
          </div>

          <button className={styles.startButton} onClick={continueIntro}>
            {speechStep === speeches.length - 1 ? "Bắt đầu hành trình" : "Tiếp tục"}
            <span aria-hidden="true">→</span>
          </button>
          <div className={styles.dots} aria-label={`Lời thoại ${speechStep + 1} trên ${speeches.length}`}>
            {speeches.map((_, index) => (
              <span key={index} className={index === speechStep ? styles.activeDot : ""} />
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.gameShell}>
          <header className={styles.topBar}>
            <div className={styles.profile}>
              <div className={styles.avatar}>HN</div>
              <div>
                <span>Nhà kiến tạo</span>
                <strong>HỌ TÊN HỌC SINH</strong>
              </div>
            </div>

            <div className={styles.mapTitle}>
              <span>Bản đồ nhiệm vụ</span>
              <strong>BẢN ĐỒ THÀNH PHỐ</strong>
            </div>

            <nav className={styles.actions} aria-label="Công cụ trò chơi">
              <button aria-label="Hộp thư">✉️<b>1</b></button>
              <button aria-label="Bảng xếp hạng">🏆</button>
              <button aria-label={soundOn ? "Tắt âm thanh" : "Bật âm thanh"} onClick={() => setSoundOn(!soundOn)}>
                {soundOn ? "🔊" : "🔇"}
              </button>
            </nav>
          </header>

          <div className={styles.progressPanel}>
            <span>Tiến độ chung</span>
            <div className={styles.progressTrack}>
              <div className={styles.progressValue} />
            </div>
            <strong>90/180</strong>
          </div>

          <div className={styles.mapArea}>
            <div className={styles.mapGrid}>
              {places.map((place) => (
                <button
                  key={place.id}
                  className={`${styles.place} ${styles[place.className]} ${place.status === "locked" ? styles.locked : ""}`}
                  onClick={() => place.status !== "locked" && setSelectedPlace(place)}
                  disabled={place.status === "locked"}
                >
                  <span className={styles.placeLabel}>{place.name}</span>
                  <span className={styles.pin}>{place.status === "locked" ? "🔒" : "📍"}</span>
                  <span className={styles.placeIcon}>{place.icon}</span>
                  <span className={styles.placeHint}>
                    {place.status === "locked" ? "Hoàn thành nhiệm vụ trước để mở khóa" : "Chọn địa điểm"}
                  </span>
                </button>
              ))}
            </div>

            <aside className={styles.foxGuide}>
              <span className={styles.mapFox}>🦊</span>
              <div>
                <strong>Cáo Đỏ</strong>
                <p>Đây là bản đồ thành phố. Hãy chọn một địa điểm để bắt đầu nhé!</p>
              </div>
            </aside>
          </div>

          {selectedPlace && (
            <div className={styles.modalBackdrop} onClick={() => setSelectedPlace(null)}>
              <article className={styles.missionModal} onClick={(event) => event.stopPropagation()}>
                <button className={styles.closeButton} onClick={() => setSelectedPlace(null)} aria-label="Đóng">×</button>
                <div className={styles.modalIcon}>{selectedPlace.icon}</div>
                <span>NHIỆM VỤ MỚI</span>
                <h2>{selectedPlace.name}</h2>
                <p>{selectedPlace.task}</p>
                <button className={styles.primaryButton}>Vào nhiệm vụ <span>→</span></button>
              </article>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
