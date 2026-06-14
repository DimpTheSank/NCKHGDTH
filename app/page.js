'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getCookie, setCookie } from '@/lib/cookies'

export default function Page() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const taiKhoan = getCookie('taiKhoan')

    if (!taiKhoan) {
      setCheckingSession(false)
      return
    }

    const checkSession = async () => {
      try {
        const userRef = doc(db, 'users', taiKhoan)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
          setCheckingSession(false)
          return
        }

        const userData = userSnap.data()

        if (userData.vaiTro === 'Học sinh') {
          router.push('/trang-chu')
        } else {
          router.push('/trang-chu-gv')
        }
      } catch (err) {
        console.error(err)
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async () => {
    setError('')

    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu')
      return
    }

    setLoading(true)
    try {
      const userRef = doc(db, 'users', username)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        setError('Tài khoản không tồn tại')
        setLoading(false)
        return
      }

      const userData = userSnap.data()

      if (userData.matKhau !== password) {
        setError('Sai mật khẩu')
        setLoading(false)
        return
      }

      setCookie('taiKhoan', username)

      if (userData.vaiTro === 'Học sinh') {
        router.push('/trang-chu')
      } else {
        router.push('/trang-chu-gv')
      }
    } catch (err) {
      console.error(err)
      setError('Đã có lỗi xảy ra, vui lòng thử lại')
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <p className="text-sm font-semibold text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-2xl font-extrabold text-gray-800">EduGame</h1>
          <p className="text-sm text-gray-500 mt-1">Học tập vui vẻ mỗi ngày</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên đăng nhập"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-soft font-medium">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  )
}