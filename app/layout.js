import './globals.css'

export const metadata = {
  title: 'Game',
  description: 'Trang trò chơi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
