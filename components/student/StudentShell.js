import Link from 'next/link'

const navigation = [
  { label: 'Trang chủ', href: '/trang-chu', icon: '⌂' },
  { label: 'Bài tập', href: '/bai-tap', icon: '✓' },
  { label: 'Trò chơi', href: '/tro-choi', icon: '◆' },
  { label: 'Xếp hạng', href: '/xep-hang', icon: '★' },
]

function Brand() {
  return (
    <Link href="/trang-chu" className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-xl text-white shadow-[0_8px_20px_rgba(249,115,22,0.25)]">
        V
      </span>
      <span>
        <strong className="block text-lg font-extrabold leading-none text-slate-900">Vui Học</strong>
        <span className="mt-1 block text-xs font-bold text-slate-400">Tiếng Việt mỗi ngày</span>
      </span>
    </Link>
  )
}

export default function StudentShell({ children, activePath = '/trang-chu', user, onLogout }) {
  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-100 bg-white px-5 py-6 lg:flex">
        <Brand />

        <nav className="mt-10 space-y-2" aria-label="Điều hướng học sinh">
          {navigation.map((item) => {
            const active = activePath === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
                  active
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-xl text-base ${
                  active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-3xl bg-[#fff7ed] p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-500">
            Mẹo nhỏ
          </p>
          <p className="mt-2 text-sm font-bold leading-5 text-slate-700">
            Hoàn thành bài đúng hạn để giữ chuỗi ngày học nhé!
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden">
              <Brand />
            </div>

            <div className="hidden lg:block">
              <p className="text-sm font-bold text-slate-400">Chào buổi sáng,</p>
              <p className="text-lg font-extrabold text-slate-900">{user.name}!</p>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 sm:flex">
                <span aria-hidden="true">🔥</span>
                <span className="text-sm font-extrabold text-amber-700">{user.streak} ngày</span>
              </div>
              <button
                type="button"
                aria-label="Xem thông báo"
                className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-lg transition hover:border-orange-200 hover:bg-orange-50"
              >
                🔔
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-3 rounded-2xl p-1.5 pr-2 transition hover:bg-slate-50"
                title="Đăng xuất"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
                  {user.initials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-extrabold text-slate-800">{user.name}</span>
                  <span className="block text-xs font-bold text-slate-400">Lớp {user.className}</span>
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[1.4rem] border border-slate-200 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur lg:hidden"
        aria-label="Điều hướng học sinh trên điện thoại"
      >
        {navigation.map((item) => {
          const active = activePath === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-extrabold ${
                active ? 'bg-orange-50 text-orange-700' : 'text-slate-400'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
