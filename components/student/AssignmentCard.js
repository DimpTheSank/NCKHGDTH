import Link from 'next/link'

const statusStyles = {
  active: {
    label: 'Đang thực hiện',
    badge: 'bg-sky-50 text-sky-700',
    bar: 'bg-sky-500',
  },
  new: {
    label: 'Chưa bắt đầu',
    badge: 'bg-amber-50 text-amber-700',
    bar: 'bg-amber-400',
  },
  done: {
    label: 'Đã hoàn thành',
    badge: 'bg-emerald-50 text-emerald-700',
    bar: 'bg-emerald-500',
  },
  urgent: {
    label: 'Sắp hết hạn',
    badge: 'bg-rose-50 text-rose-700',
    bar: 'bg-rose-500',
  },
  retry: {
    label: 'Cần làm lại',
    badge: 'bg-violet-50 text-violet-700',
    bar: 'bg-violet-500',
  },
}

export default function AssignmentCard({ assignment }) {
  const status = statusStyles[assignment.status]

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${assignment.iconStyle}`}>
          {assignment.icon}
        </span>
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${status.badge}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">
          {assignment.topic}
        </p>
        <h3 className="mt-2 text-lg font-extrabold leading-6 text-slate-900">
          {assignment.title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-slate-500">{assignment.deadline}</p>
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-2 flex justify-between text-xs font-extrabold">
          <span className="text-slate-500">Tiến độ</span>
          <span className="text-slate-800">{assignment.completed}/{assignment.total} màn</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${status.bar}`}
            style={{ width: `${Math.round((assignment.completed / assignment.total) * 100)}%` }}
          />
        </div>

        <Link
          href={assignment.href}
          className={`mt-5 flex min-h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-extrabold transition ${
            assignment.status === 'done'
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-orange-500 text-white shadow-[0_8px_18px_rgba(249,115,22,0.22)] hover:bg-orange-600'
          }`}
        >
          {assignment.status === 'active' || assignment.status === 'urgent'
            ? 'Tiếp tục học'
            : assignment.status === 'done'
              ? 'Xem kết quả'
              : assignment.status === 'retry'
                ? 'Làm lại'
              : 'Bắt đầu'}
        </Link>
      </div>
    </article>
  )
}
