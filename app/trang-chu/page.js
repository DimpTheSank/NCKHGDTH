'use client'

import { useRouter } from 'next/navigation'

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

export default function Page() {
  const router = useRouter()
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
            onClick={() => router.push('/')}
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