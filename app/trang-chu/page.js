'use client'

import { useState } from 'react'

const demoStudent = {
  name: 'Nguyễn Văn An',
  className: 'Lớp 4A',
  rank: 12,
  points: 1250,
  nextLevel: 2000,
}

const activities = [
  { title: 'Xây dựng câu', detail: 'Bài tập tuần 12', color: 'border-orange-200 bg-orange-50' },
  { title: 'Đặt câu theo hình', detail: 'Chủ đề mùa xuân', color: 'border-emerald-200 bg-emerald-50' },
  { title: 'Luyện trạng ngữ', detail: 'Ôn tập cùng giáo viên', color: 'border-sky-200 bg-sky-50' },
]

const stats = [
  { label: 'Điểm tích lũy', value: '1.250' },
  { label: 'Xếp hạng lớp', value: '#12' },
  { label: 'Bài đã hoàn thành', value: '18' },
]

function LoginScreen({ onLogin }) {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!studentId.trim() || !password.trim()) {
      setError('Vui lòng nhập mã học sinh và mật khẩu.')
      return
    }

    setError('')
    onLogin()
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#123047] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-10 top-20 h-48 w-48 rounded-full bg-[#ffb84d]" />
            <div className="absolute bottom-16 right-16 h-56 w-56 rounded-full bg-[#38bdf8]" />
            <div className="absolute right-36 top-44 h-28 w-28 rounded-full bg-[#34d399]" />
          </div>

          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-200">EduGame</p>
            <h1 className="mt-5 max-w-xl text-5xl font-extrabold leading-tight">
              Học tiếng Việt qua nhiệm vụ và trò chơi mỗi ngày.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-200">
              Đăng nhập để tiếp tục bài tập, xem điểm thưởng và theo dõi tiến bộ của em trong lớp.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold">{item.value}</p>
                <p className="mt-1 text-sm text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">EduGame</p>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Đăng nhập học tập</h1>
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-semibold text-orange-600">Chào mừng trở lại</p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Đăng nhập</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sử dụng tài khoản học sinh do giáo viên cung cấp.
                </p>
              </div>

              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Mã học sinh</span>
                  <input
                    value={studentId}
                    onChange={(event) => setStudentId(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    placeholder="VD: HS4A012"
                    autoComplete="username"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    placeholder="Nhập mật khẩu"
                    type="password"
                    autoComplete="current-password"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-600">
                  <input
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <button type="button" className="font-bold text-orange-600 hover:text-orange-700">
                  Quên mật khẩu?
                </button>
              </div>

              {error && (
                <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-orange-600 px-5 text-base font-extrabold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
              >
                Vào lớp học
              </button>

              <p className="mt-5 text-center text-sm text-slate-500">
                Chưa có tài khoản?{' '}
                <button type="button" className="font-bold text-slate-800 hover:text-orange-600">
                  Liên hệ giáo viên
                </button>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

function Dashboard({ onLogout }) {
  const progress = Math.round((demoStudent.points / demoStudent.nextLevel) * 100)

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">EduGame</p>
            <h1 className="text-2xl font-extrabold text-slate-900">Xin chào, {demoStudent.name}</h1>
            <p className="text-sm font-semibold text-slate-500">{demoStudent.className} · Xếp hạng #{demoStudent.rank}</p>
          </div>
          <button
            onClick={onLogout}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Nhiệm vụ hôm nay</h2>
              <p className="mt-1 text-sm text-slate-500">Chọn một hoạt động để tiếp tục học.</p>
            </div>
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              Đang hoạt động
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {activities.map((activity) => (
              <button
                key={activity.title}
                className={`min-h-32 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${activity.color}`}
              >
                <p className="text-base font-extrabold text-slate-900">{activity.title}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{activity.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Tiến bộ</h2>
          <p className="mt-1 text-sm text-slate-500">
            {demoStudent.points.toLocaleString('vi-VN')} / {demoStudent.nextLevel.toLocaleString('vi-VN')} điểm
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm font-bold text-slate-700">Hoàn thành {progress}% mục tiêu cấp tiếp theo.</p>
        </aside>
      </div>
    </main>
  )
}

export default function Page() {
  const [loggedIn, setLoggedIn] = useState(false)

  if (loggedIn) {
    return <Dashboard onLogout={() => setLoggedIn(false)} />
  }

  return <LoginScreen onLogin={() => setLoggedIn(true)} />
}
