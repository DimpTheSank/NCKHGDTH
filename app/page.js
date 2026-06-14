'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Page() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition"
            />
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