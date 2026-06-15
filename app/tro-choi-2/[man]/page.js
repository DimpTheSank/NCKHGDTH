'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { db } from '@/lib/firebase'
import { getCookie } from '@/lib/cookies'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function toExportXlsxUrl(driveLink) {
  const match = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/)
  const fileId = match ? match[1] : null
  if (!fileId) return driveLink
  return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`
}

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const level = Number(params.man)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [taiKhoan, setTaiKhoan] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const [selectedIndex, setSelectedIndex] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [checked, setChecked] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [finalScore, setFinalScore] = useState(0)

  useEffect(() => {
    const init = async () => {
      const account = getCookie('taiKhoan')
      if (!account) {
        router.push('/')
        return
      }
      setTaiKhoan(account)

      if (!level || level < 1) {
        router.push('/tro-choi-2')
        return
      }

      try {
        const userRef = doc(db, 'users', account)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          router.push('/')
          return
        }

        // Kiểm tra điều kiện mở khóa: màn 1 luôn mở, màn N mở khi game2Man(N-1) đã có điểm
        if (level > 1) {
          const userData = userSnap.data()
          if (userData[`game2Man${level - 1}`] === undefined) {
            router.push('/tro-choi-2')
            return
          }
        }

        const gameRef = doc(db, 'games', 'game2')
        const gameSnap = await getDoc(gameRef)
        if (!gameSnap.exists() || !gameSnap.data().dataLink) {
          setError('Không tìm thấy dữ liệu trò chơi')
          setLoading(false)
          return
        }

        const xlsxUrl = toExportXlsxUrl(gameSnap.data().dataLink)

        const res = await fetch(xlsxUrl)
        const arrayBuffer = await res.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet)

        const levelRows = rows.filter((row) => Number(row.level) === level)

        if (levelRows.length === 0) {
          setError('Không tìm thấy câu hỏi cho màn này')
          setLoading(false)
          return
        }

        const builtQuestions = shuffle(levelRows).map((row) => {
          const options = shuffle([
            { text: String(row.vn).trim(), correct: true },
            { text: String(row.d1).trim(), correct: false },
            { text: String(row.d2).trim(), correct: false },
            { text: String(row.d3).trim(), correct: false },
          ])
          return {
            cn: String(row.cn).trim(),
            options,
          }
        })

        setQuestions(builtQuestions)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError('Đã có lỗi xảy ra, vui lòng thử lại')
        setLoading(false)
      }
    }

    init()
  }, [router, level])

  const currentQuestion = questions[currentIndex]

  const handleSelect = (index) => {
    if (checked) return

    setSelectedIndex((prev) => (prev === index ? null : index))
  }

  const handleConfirm = () => {
    if (selectedIndex === null || checked) return

    setChecked(true)
    const isCorrect = currentQuestion.options[selectedIndex].correct
    setFeedback(isCorrect ? 'correct' : 'wrong')

    const audio = new Audio(isCorrect ? '/audio/dung.mp3' : '/audio/sai.mp3')
    audio.play().catch(() => {})

    const newCorrectCount = correctCount + (isCorrect ? 1 : 0)
    setCorrectCount(newCorrectCount)

    setTimeout(() => {
      setSelectedIndex(null)
      setFeedback(null)
      setChecked(false)

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        finishLevel(newCorrectCount)
      }
    }, 1200)
  }

  const finishLevel = async (score) => {
    setFinalScore(score)
    try {
      const userRef = doc(db, 'users', taiKhoan)
      const userSnap = await getDoc(userRef)
      const userData = userSnap.data()

      const scoreField = `game2Man${level}`
      const previousBest = userData[scoreField]

      const updates = {}
      if (previousBest === undefined || score > Number(previousBest)) {
        updates[scoreField] = score
      }

      if (Object.keys(updates).length > 0) {
        await setDoc(userRef, updates, { merge: true })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setShowComplete(true)
    }
  }

  const handleConfirmComplete = () => {
    router.push('/tro-choi-2')
  }

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
            onClick={() => router.push('/tro-choi-2')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Về danh sách màn
          </button>
        </div>
      </main>
    )
  }

  if (!currentQuestion) return null

  // Tách câu theo dấu gạch dưới để chèn đáp án vào chỗ trống
  const parts = currentQuestion.cn.split(/_+/)
  const beforeBlank = parts[0] ?? ''
  const afterBlank = parts.slice(1).join('_____')

  return (
    <main className="min-h-screen bg-[#f6f7fb] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-slate-900">Trò chơi 2 - Màn {level}</h1>
          <span className="text-sm font-bold text-orange-600">
            Câu {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <div className="card p-6 mb-6">
          <p className="text-base font-extrabold text-slate-900 leading-relaxed text-center">
            {beforeBlank}
            <span
              className={`inline-flex min-w-[80px] mx-1 px-2 py-0.5 rounded-md border-2 align-middle justify-center ${
                selectedIndex === null
                  ? 'border-dashed border-slate-300 bg-slate-50 text-slate-300'
                  : checked
                  ? feedback === 'correct'
                    ? 'border-solid border-green-soft bg-green-light text-slate-900 shake'
                    : 'border-solid border-red-soft bg-red-light text-slate-900 shake'
                  : 'border-solid border-orange-300 bg-orange-50 text-slate-900 cursor-pointer'
              }`}
              onClick={() => {
                if (selectedIndex !== null) handleSelect(selectedIndex)
              }}
            >
              {selectedIndex === null
                ? '...........'
                : currentQuestion.options[selectedIndex].text}
            </span>
            {afterBlank}
          </p>
        </div>

        <div className="h-6 mb-4">
          {feedback && (
            <p
              className={`text-center font-extrabold ${
                feedback === 'correct' ? 'text-green-soft' : 'text-red-soft'
              }`}
            >
              {feedback === 'correct' ? 'Chính xác!' : 'Chưa đúng rồi!'}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          {currentQuestion.options.map((option, index) => {
            if (index === selectedIndex) {
              return <div key={index} className="rounded-xl border-2 border-transparent p-4" />
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={checked}
                className="rounded-xl border-2 border-gray-200 bg-white hover:border-orange-300 p-4 text-sm font-semibold text-slate-700 text-left transition disabled:cursor-not-allowed"
              >
                {option.text}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleConfirm}
          disabled={selectedIndex === null || checked}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >
          Xác nhận
        </button>
      </div>

      {showComplete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="card p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Đã hoàn thành Màn {level}!</h2>
            <p className="text-sm text-slate-500 mb-6">
              Bạn trả lời đúng {finalScore}/{questions.length} câu.
            </p>
            <button
              onClick={handleConfirmComplete}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </main>
  )
}