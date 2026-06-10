'use client'

import { useState } from 'react'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const student = {
  name: 'Nguyễn Văn An',
  class: 'Lớp 4A',
  rank: 12,
  points: 1250,
  nextLevel: 2000,
  level: 'Đồng',
  nextLevelName: 'Bạc',
  avatar: '🦁',
}

const leaderboard = [
  { rank: 1, name: 'Nguyễn Minh Anh', points: 2450 },
  { rank: 2, name: 'Trần Gia Bảo', points: 2380 },
  { rank: 3, name: 'Lê Thu Hà', points: 2210 },
  { rank: 4, name: 'Phạm Quốc Huy', points: 1890 },
  { rank: 5, name: 'Võ Hồng Nhung', points: 1650 },
]

const games = [
  { id: 1, title: 'Trò chơi 1', color: 'bg-purple-50 border-purple-200', numColor: 'bg-purple-400', locked: false },
  { id: 2, title: 'Trò chơi 2', color: 'bg-green-50 border-green-200', numColor: 'bg-green-500', locked: false },
  { id: 3, title: 'Trò chơi 3', color: 'bg-red-50 border-red-200', numColor: 'bg-red-400', locked: false },
]

const paintings = [
  { id: 1, done: true, bg: '#7BAE7F' },
  { id: 2, done: true, bg: '#7BAE7F' },
  { id: 3, done: true, bg: '#7BAE7F' },
  { id: 4, done: true, bg: '#7BAE7F' },
  { id: 5, done: false, bg: '#E07070' },
  { id: 6, done: false, bg: '#E07070' },
  { id: 7, done: false, bg: '#E8E8E8' },
  { id: 8, done: false, bg: '#E8E8E8' },
]

const tasks = [
  { id: 1, title: 'Xây dựng câu – Bài tập tuần 12', due: '15/04/2026' },
  { id: 2, title: 'Đặt câu theo hình – Mùa xuân', due: '18/04/2026' },
  { id: 3, title: 'Luyện tập trạng ngữ', due: '20/04/2026' },
]

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Avatar({ emoji, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-base', md: 'w-12 h-12 text-2xl', lg: 'w-16 h-16 text-3xl' }
  return (
    <div className={`${sizes[size]} rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 border-2 border-amber-200`}>
      {emoji}
    </div>
  )
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{rank}</span>
  if (rank === 2) return <span className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{rank}</span>
  if (rank === 3) return <span className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{rank}</span>
  return <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold flex-shrink-0">{rank}</span>
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ onLogout }) {
  const pct = (student.points / student.nextLevel) * 100

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Student info */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar emoji={student.avatar} />
          <div className="min-w-0">
            <p className="font-bold text-gray-800 truncate">{student.name}</p>
            <p className="text-sm text-gray-500">{student.class} • Xếp hạng: #{student.rank}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-4 mx-4">
          {/* Bronze badge */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-xl">🏆</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{student.level}</span>
          </div>

          {/* Bar */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-semibold mb-1 text-center">
              {student.points.toLocaleString()} / {student.nextLevel.toLocaleString()} điểm
            </p>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #C87941, #A8B2C1)',
                }}
              />
            </div>
          </div>

          {/* Silver badge */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{student.nextLevelName}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
        >
          <span>↪</span> Đăng xuất
        </button>
      </div>
    </header>
  )
}

// ─── GAME ZONE ────────────────────────────────────────────────────────────────
function GameZone() {
  const [active, setActive] = useState(null)

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🎮 Khu vực trò chơi
      </h2>

      {/* Three mini games */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {games.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setActive(active === g.id ? null : g.id)}
            className={`
              relative rounded-xl border-2 p-5 flex flex-col items-center gap-2 transition-all duration-200
              ${g.color}
              ${active === g.id ? 'ring-2 ring-offset-2 ring-purple-400 scale-[1.02]' : 'hover:scale-[1.01]'}
            `}
          >
            <div className={`w-10 h-10 rounded-full ${g.numColor} flex items-center justify-center text-white font-bold text-lg`}>
              {g.id}
            </div>
            <span className="text-sm font-semibold text-gray-700">{g.title}</span>
            {i < games.length - 1 && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300 z-10" />
            )}
          </button>
        ))}
      </div>

      {/* Final challenge */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center gap-4 hover:bg-amber-100 transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-white text-xl flex-shrink-0">
          🏆
        </div>
        <div>
          <p className="font-bold text-gray-800">Trò chơi 4</p>
          <p className="text-sm text-gray-500">Thách thức cuối – Tổng hợp kiến thức từ 3 trò chơi đầu</p>
        </div>
      </div>

      {/* Expanded game panel */}
      {active && (
        <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
          <p className="text-purple-700 font-semibold">🎯 Đang tải {games.find(g => g.id === active)?.title}…</p>
          <button
            className="mt-3 bg-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
            onClick={() => alert(`Bắt đầu ${games.find(g => g.id === active)?.title}!`)}
          >
            Bắt đầu
          </button>
        </div>
      )}
    </section>
  )
}

// ─── PAINTING ─────────────────────────────────────────────────────────────────
function PaintingGrid() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🎨 Bức tranh của em
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {paintings.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: p.bg }}
            >
              {p.done && (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!p.done && p.bg !== '#E8E8E8' && (
                <svg className="w-8 h-8 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">{p.id}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function Leaderboard() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🏅 Bảng xếp hạng
      </h2>
      <div className="space-y-2">
        {leaderboard.map((s) => (
          <div key={s.rank} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-gray-50 transition-colors">
            <RankBadge rank={s.rank} />
            <span className="flex-1 font-medium text-gray-700 text-sm">{s.name}</span>
            <span className="font-bold text-gray-800 text-sm">{s.points.toLocaleString()}</span>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 my-2" />

        {/* Current user */}
        <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-purple-100 border border-purple-200">
          <span className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {student.rank}
          </span>
          <span className="flex-1 font-semibold text-purple-800 text-sm">Thứ hạng của bạn</span>
          <span className="font-bold text-purple-800 text-sm">{student.points.toLocaleString()}</span>
        </div>
      </div>
    </section>
  )
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function TaskList() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📋 Nhiệm vụ từ Giáo viên
      </h2>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer group"
          >
            <p className="font-semibold text-gray-800 text-sm group-hover:text-orange-700 transition-colors">{t.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">Hạn nộp: {t.due}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Page() {
  const [loggedIn, setLoggedIn] = useState(true)

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm w-full mx-4">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đã đăng xuất</h2>
          <p className="text-gray-500 mb-6 text-sm">Hẹn gặp lại bạn lần sau nhé!</p>
          <button
            onClick={() => setLoggedIn(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <Header onLogout={() => setLoggedIn(false)} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column – main content */}
          <div className="lg:col-span-2 space-y-6">
            <GameZone />
            <PaintingGrid />
          </div>

          {/* Right column – sidebar */}
          <div className="space-y-6">
            <Leaderboard />
            <TaskList />
          </div>
        </div>
      </main>
    </div>
  )
}
