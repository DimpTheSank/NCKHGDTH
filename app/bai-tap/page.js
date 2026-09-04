'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { deleteCookie, getCookie } from '@/lib/cookies'
import AssignmentCard from '@/components/student/AssignmentCard'
import StudentShell from '@/components/student/StudentShell'
import { studentDashboardMock } from '@/data/mock/studentDashboard'
import { studentAssignmentsMock } from '@/data/mock/studentAssignments'

const filters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'todo', label: 'Cần làm' },
  { value: 'active', label: 'Đang làm' },
  { value: 'done', label: 'Hoàn thành' },
]

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f9fd]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
        <p className="mt-4 text-sm font-extrabold text-slate-500">Đang tải bài tập...</p>
      </div>
    </main>
  )
}

export default function AssignmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [firestoreUser, setFirestoreUser] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

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

  const counts = useMemo(() => ({
    all: studentAssignmentsMock.length,
    todo: studentAssignmentsMock.filter(({ status }) => ['new', 'urgent', 'retry'].includes(status)).length,
    active: studentAssignmentsMock.filter(({ status }) => status === 'active').length,
    done: studentAssignmentsMock.filter(({ status }) => status === 'done').length,
  }), [])

  const assignments = useMemo(() => {
    if (activeFilter === 'todo') {
      return studentAssignmentsMock.filter(({ status }) => ['new', 'urgent', 'retry'].includes(status))
    }

    if (activeFilter === 'active') {
      return studentAssignmentsMock.filter(({ status }) => status === 'active')
    }

    if (activeFilter === 'done') {
      return studentAssignmentsMock.filter(({ status }) => status === 'done')
    }

    return studentAssignmentsMock
  }, [activeFilter])

  const handleLogout = () => {
    deleteCookie('taiKhoan')
    router.push('/')
  }

  if (loading) return <LoadingScreen />

  return (
    <StudentShell user={user} activePath="/bai-tap" onLogout={handleLogout}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-orange-500">Nhiệm vụ học tập</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Bài tập của em</h1>
          <p className="mt-2 text-base font-semibold text-slate-500">
            Em còn {counts.todo + counts.active} bài cần hoàn thành.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <span className="text-2xl" aria-hidden="true">🔥</span>
          <div>
            <p className="text-sm font-black text-amber-800">{user.streak} ngày liên tiếp</p>
            <p className="text-xs font-bold text-amber-600">Đừng để chuỗi bị ngắt nhé!</p>
          </div>
        </div>
      </header>

      <section className="mt-7" aria-label="Lọc bài tập">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const active = activeFilter === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={active}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition ${
                  active
                    ? 'bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.22)]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                {filter.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {counts[filter.value]}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800">{filters.find(({ value }) => value === activeFilter)?.label}</h2>
          <p className="text-sm font-bold text-slate-400">{assignments.length} bài</p>
        </div>

        {assignments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <span className="text-4xl" aria-hidden="true">🎉</span>
            <h2 className="mt-4 text-xl font-black text-slate-800">Không có bài nào ở đây</h2>
            <p className="mt-2 text-base font-semibold text-slate-500">Em đã xử lý hết các bài trong nhóm này rồi.</p>
          </div>
        )}
      </section>
    </StudentShell>
  )
}
