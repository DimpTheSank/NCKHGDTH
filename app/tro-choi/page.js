'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { deleteCookie, getCookie } from '@/lib/cookies'
import StudentShell from '@/components/student/StudentShell'
import { studentDashboardMock } from '@/data/mock/studentDashboard'
import { studentGamesMock } from '@/data/mock/studentGames'

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f9fd]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
        <p className="mt-4 text-sm font-extrabold text-slate-500">Đang mở khu trò chơi...</p>
      </div>
    </main>
  )
}

function GameCard({ game }) {
  const progress = Math.round((game.completedLevels / game.totalLevels) * 100)

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
      <div className={`relative overflow-hidden bg-gradient-to-br ${game.theme} p-6 text-white`}>
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[22px] border-white/10" />
        <div className="relative flex items-start justify-between gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-2xl font-black shadow-inner backdrop-blur">
            {game.icon}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-extrabold backdrop-blur">
            {game.skill}
          </span>
        </div>
        <h2 className="relative mt-6 text-2xl font-black">{game.name}</h2>
        <p className="relative mt-2 min-h-12 text-base font-semibold leading-6 text-white/90">
          {game.description}
        </p>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold text-slate-500">Tiến độ</p>
            <p className="mt-1 text-lg font-black text-slate-900">
              {game.completedLevels}/{game.totalLevels} màn
            </p>
          </div>
          <div className={`rounded-2xl px-3 py-2 text-sm font-black ${game.softTheme}`}>
            ★ {game.stars}
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`Đã hoàn thành ${progress}%`}>
          <div className={`h-full rounded-full bg-gradient-to-r ${game.theme}`} style={{ width: `${progress}%` }} />
        </div>

        <Link
          href={game.href}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"
        >
          {game.status === 'new' ? 'Khám phá trò chơi' : 'Tiếp tục chơi'}
        </Link>
      </div>
    </article>
  )
}

export default function GamesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [firestoreUser, setFirestoreUser] = useState(null)

  useEffect(() => {
    const account = getCookie('taiKhoan')

    if (!account) {
      router.push('/')
      return
    }

    const loadUser = async () => {
      try {
        const userSnapshot = await getDoc(doc(db, 'users', account))

        if (!userSnapshot.exists()) {
          deleteCookie('taiKhoan')
          router.push('/')
          return
        }

        setFirestoreUser(userSnapshot.data())
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  const user = useMemo(() => {
    const fullName = firestoreUser
      ? [firestoreUser.ho, firestoreUser.ten].filter(Boolean).join(' ')
      : studentDashboardMock.user.name
    const initials = fullName
      .split(' ')
      .slice(-2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()

    return {
      ...studentDashboardMock.user,
      name: fullName || studentDashboardMock.user.name,
      initials: initials || studentDashboardMock.user.initials,
      className: firestoreUser?.lop || studentDashboardMock.user.className,
      level: Number(firestoreUser?.cap) || studentDashboardMock.user.level,
      xp: Number(firestoreUser?.kinhNghiem) || studentDashboardMock.user.xp,
    }
  }, [firestoreUser])

  const handleLogout = () => {
    deleteCookie('taiKhoan')
    router.push('/')
  }

  if (loading) return <LoadingScreen />

  const totalStars = studentGamesMock.reduce((sum, game) => sum + game.stars, 0)
  const completedLevels = studentGamesMock.reduce((sum, game) => sum + game.completedLevels, 0)

  return (
    <StudentShell user={user} activePath="/tro-choi" onLogout={handleLogout}>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-orange-500">Học mà chơi</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Khu trò chơi</h1>
          <p className="mt-2 max-w-xl text-base font-semibold leading-6 text-slate-500">
            Chọn một trò chơi và chinh phục các màn đã được mở cho em.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="min-w-28 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-center">
            <p className="text-xl font-black text-amber-700">★ {totalStars}</p>
            <p className="text-xs font-extrabold text-amber-600">Tổng số sao</p>
          </div>
          <div className="min-w-28 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xl font-black text-emerald-700">{completedLevels}</p>
            <p className="text-xs font-extrabold text-emerald-600">Màn đã qua</p>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Danh sách trò chơi">
        {studentGamesMock.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>

      <aside className="mt-7 flex flex-col gap-4 rounded-3xl border border-orange-100 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm" aria-hidden="true">💡</span>
          <div>
            <h2 className="text-base font-black text-slate-800">Mẹo nhỏ</h2>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
              Chơi lại một màn sẽ giúp em luyện tập tốt hơn và giành thêm sao.
            </p>
          </div>
        </div>
        <Link href="/bai-tap" className="shrink-0 text-sm font-black text-orange-700 hover:text-orange-800">
          Xem bài được giao →
        </Link>
      </aside>
    </StudentShell>
  )
}
