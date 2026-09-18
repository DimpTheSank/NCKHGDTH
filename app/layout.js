import './globals.css'
import { Be_Vietnam_Pro } from 'next/font/google'
import { AuthProvider } from './providers'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-be-vietnam',
})

export const metadata = {
  title: 'Biệt đội Kiến tạo Sài Gòn',
  description: 'Hành trình học tập và khám phá thành phố',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className={beVietnamPro.className}><AuthProvider>{children}</AuthProvider></body>
    </html>
  )
}
