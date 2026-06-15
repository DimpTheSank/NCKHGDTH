'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getCookie, deleteCookie } from '@/lib/cookies'

const GAME_CONFIG = [
  { title: 'Trò chơi 1', manKey: 'manTroChoi1', href: '/tro-choi-1', color: 'border-orange-200 bg-orange-50' },
  { title: 'Trò chơi 2', manKey: 'manTroChoi2', href: '/tro-choi-2', color: 'border-emerald-200 bg-emerald-50' },
  { title: 'Trò chơi 3', manKey: 'manTroChoi3', href: '/tro-choi-3', color: 'border-sky-200 bg-sky-50' },
]

const sampleLeaderboard = [
  { name: 'Trần Thị Bình', points: 1820 },
  { name: 'Lê Hoàng Nam', points: 1640 },
  { name: 'Phạm Minh Khuê', points: 1490 },
  { name: 'Nguyễn Văn An', points: 1250 },
  { name: 'Đỗ Gia Hân', points: 1100 },
]

const XP_PER_LEVEL = 1000

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [mucTieu, setMucTieu] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const taiKhoan = getCookie('taiKhoan')

    if (!taiKhoan) {
      router.push('/')
      return
    }

    const fetchUser = async () => {
      try {
        const userRef = doc(db, 'users', taiKhoan)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          deleteCookie('taiKhoan')
          router.push('/')
          return
        }

        const userData = userSnap.data()
        setUser(userData)

        // Fetch mục tiêu từ collection levels theo lop của user
        if (userData.lop) {
          const levelRef = doc(db, 'levels', userData.lop)
          const levelSnap = await getDoc(levelRef)
          if (levelSnap.exists()) {
            setMucTieu(levelSnap.data().manDuocGiaoGame1 ?? null)
          }
        }
      } catch (err) {
        console.error(err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    deleteCookie('taiKhoan')
    router.push('/')
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
      </main>
    )
  }

  const cap = Number(user.cap) || 1
  const kinhNghiem = Number(user.kinhNghiem) || 0
  const progress = Math.min(100, Math.round((kinhNghiem / XP_PER_LEVEL) * 100))

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">EduGame</p>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {user.vaiTro}: {user.ho} {user.ten}
            </h1>
            <p className="text-sm font-semibold text-slate-500">Lớp {user.lop}</p>
          </div>

          <div className="flex-1 min-w-[200px] max-w-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-extrabold text-slate-700">Cấp {cap}</span>
              <span className="text-xs font-semibold text-slate-500">{kinhNghiem}/{XP_PER_LEVEL} KN</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill bg-orange-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <button
            onClick={handleLogout}
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
              <p className="mt-1 text-sm text-slate-500">Chọn một trò chơi để tiếp tục học.</p>
            </div>
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              Đang hoạt động
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {GAME_CONFIG.map((game) => (
              <div
                key={game.title}
                className={`flex min-h-40 flex-col justify-between rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${game.color}`}
              >
                <div>
                  <p className="text-base font-extrabold text-slate-900">{game.title}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Màn hiện tại: {user[game.manKey] ?? '—'}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">
                    Mục tiêu: {mucTieu ?? '—'}
                  </p>
                </div>
                <button
                  onClick={() => router.push(game.href)}
                  className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Chơi ngay
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Bảng xếp hạng</h2>
          <p className="mt-1 text-sm text-slate-500">Top học sinh tích cực (ví dụ)</p>
          <ul className="mt-4 space-y-3">
            {sampleLeaderboard.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-orange-600">{item.points.toLocaleString('vi-VN')}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  )
}