import '../globals.css'

export default function LegacyRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-language="zh" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}
