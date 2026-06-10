import './globals.css'

export const metadata = {
  title: 'EduGame - Học tập vui vẻ',
  description: 'Nền tảng học tập gamification cho học sinh tiểu học',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
