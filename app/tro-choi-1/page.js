'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getCookie } from '@/lib/cookies'

export default function Page() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [levels, setLevels] = useState([]) // [{ level, score, unlocked }]

  useEffect(() => {
    const init = async () => {
      const account = getCookie('taiKhoan')
      if (!account) {
        router.push('/')
        return
      }

      try {
        const userRef = doc(db, 'users', account)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          router.push('/')
          return
        }
        const userData = userSnap.data()
        const lop = userData.lop

        const levelsRef = collection(db, 'levels')
        const levelsQuery = query(levelsRef, where('lop', '==', lop))
        const levelsSnap = await getDocs(levelsQuery)

        let manDuocGiao = 1
        if (!levelsSnap.empty) {
          manDuocGiao = Number(levelsSnap.docs[0].data().manDuocGiaoGame1) || 1
        }

        const builtLevels = []
        for (let i = 1; i <= manDuocGiao; i++) {
          const scoreField = `game1Man${i}`
          const score = userData[scoreField] ?? null
          const unlocked = i === 1 || userData[`game1Man${i - 1}`] !== undefined
          builtLevels.push({ level: i, score, unlocked })
        }

        setLevels(builtLevels)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Đã có lỗi xảy ra, vui lòng thử lại')
        setLoading(false)
      }
    }

    init()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <p className="text-sm font-semibold text-red-soft mb-6">{error}</p>
          <button
            onClick={() => router.push('/trang-chu')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Trò chơi 1</h1>
          <button
            onClick={() => router.push('/trang-chu')}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
          >
            Về trang chủ
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {levels.map((item) => (
            <div
              key={item.level}
              className={`card p-5 flex flex-col justify-between ${!item.unlocked ? 'opacity-60' : ''}`}
            >
              <div>
                <p className="text-lg font-extrabold text-slate-900">Màn {item.level}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Điểm cao nhất:{' '}
                  {item.score !== null && item.score !== undefined
                    ? `${item.score}/5`
                    : 'Chưa chơi'}
                </p>
              </div>

              <button
                onClick={() => router.push(`/tro-choi-1/${item.level}`)}
                disabled={!item.unlocked}
                className="mt-4 rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {item.unlocked ? 'Chơi' : 'Khóa'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}