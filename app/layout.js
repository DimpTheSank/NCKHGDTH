import './globals.css'
import { AuthProvider } from './providers'

export const metadata = {
  title: 'Biệt đội Kiến tạo Sài Gòn',
  description: 'Hành trình học tập và khám phá thành phố',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
