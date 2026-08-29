'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { deleteCookie, getCookie } from '@/lib/cookies'
import AssignmentCard from '@/components/student/AssignmentCard'
import StudentShell from '@/components/student/StudentShell'
import { studentDashboardMock } from '@/data/mock/studentDashboard'

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f9fd]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
        <p className="mt-4 text-sm font-extrabold text-slate-500">Đang chuẩn bị góc học tập...</p>
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, helper, tone }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${tone}`}>{icon}</span>
        <div>
          <p className="text-xs font-extrabold text-slate-400">{label}</p>
          <p className="mt-0.5 text-xl font-black text-slate-900">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-400">{helper}</p>
    </div>
  )
}

export default function Page() {
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
        setFirestoreUser(null)
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

  const { weeklyProgress, continueLearning, assignments, leaderboard } = studentDashboardMock
  const xpProgress = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100))
  const weeklyPercent = Math.round((weeklyProgress.completed / weeklyProgress.total) * 100)

  return (
    <StudentShell user={user} activePath="/trang-chu" onLogout={handleLogout}>
      <section className="mb-6 lg:hidden">
        <p className="text-sm font-bold text-slate-400">Chào buổi sáng,</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">{user.name}! 👋</h1>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 p-6 text-white shadow-[0_18px_45px_rgba(249,115,22,0.24)] sm:p-8">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[34px] border-white/10" />
        <div className="absolute bottom-5 right-8 hidden h-24 w-24 rotate-12 rounded-[2rem] bg-white/10 sm:block" />

        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full bg-white/20 px-3 py-1.5 text-xs font-extrabold backdrop-blur">
            Bài cần làm tiếp
          </span>
          <h1 className="mt-5 text-2xl font-black sm:text-3xl">{continueLearning.title}</h1>
          <p className="mt-2 font-bold text-orange-50">{continueLearning.subtitle}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-extrabold">
            <span className="rounded-xl bg-white/15 px-3 py-2">◷ Còn {continueLearning.remaining} màn</span>
            <span className="rounded-xl bg-white/15 px-3 py-2">⌁ Hạn {continueLearning.deadline.toLowerCase()}</span>
          </div>

          <button
            type="button"
            onClick={() => router.push(continueLearning.href)}
            className="mt-6 min-h-12 rounded-2xl bg-white px-6 text-sm font-black text-orange-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            Tiếp tục học →
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Tiến độ học tập">
        <StatCard
          icon="✓"
          label="Bài tuần này"
          value={`${weeklyProgress.completed}/${weeklyProgress.total}`}
          helper={`Đã hoàn thành ${weeklyPercent}%`}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon="⚡"
          label="Điểm kinh nghiệm"
          value={`${user.xp} XP`}
          helper={`${user.nextLevelXp - user.xp} XP nữa để lên cấp`}
          tone="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon="🔥"
          label="Chuỗi ngày học"
          value={`${user.streak} ngày`}
          helper="Cố gắng giữ vững nhé!"
          tone="bg-amber-50 text-amber-600"
        />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-500">
                Nhiệm vụ của em
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Bài tập được giao</h2>
            </div>
            <button
              type="button"
              className="text-sm font-extrabold text-orange-600 hover:text-orange-700"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-violet-500">
                  Hành trình
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">Cấp {user.level}</h2>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-2xl">🚀</span>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs font-extrabold">
              <span className="text-slate-500">{user.xp} XP</span>
              <span className="text-slate-400">{user.nextLevelXp} XP</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-bold leading-5 text-slate-400">
              Em đang tiến rất gần tới cấp tiếp theo!
            </p>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-amber-500">
                  Thi đua vui
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-900">Top lớp tuần này</h2>
              </div>
              <span className="text-2xl">🏆</span>
            </div>

            <ol className="mt-5 space-y-3">
              {leaderboard.map((student) => (
                <li
                  key={student.rank}
                  className={`flex items-center gap-3 rounded-2xl p-2.5 ${
                    student.isCurrent ? 'bg-orange-50 ring-1 ring-orange-100' : ''
                  }`}
                >
                  <span className="w-5 text-center text-sm font-black text-slate-400">{student.rank}</span>
                  <span className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-black ${student.color}`}>
                    {student.initials}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-slate-700">
                    {student.name}
                    {student.isCurrent && <span className="ml-1 text-xs text-orange-500">(Em)</span>}
                  </span>
                  <span className="text-xs font-black text-slate-500">{student.xp} XP</span>
                </li>
              ))}
            </ol>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-slate-50 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100"
            >
              Xem bảng xếp hạng
            </button>
          </section>
        </aside>
      </div>
    </StudentShell>
  )
}
