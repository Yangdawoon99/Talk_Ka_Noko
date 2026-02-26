import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '톡까놓고 | 카카오톡 대화 AI 분석 서비스',
  description: '우리의 대화 속 숨겨진 마음을 AI로 분석하세요. 애착 유형부터 애정 지수까지, 1분 만에 확인하는 관계 리포트.',
  keywords: ['카카오톡 분석', '연애 심리', 'AI 분석', '톡까놓고', '카톡 대화 분석', '애착유형'],
  authors: [{ name: 'Talk-Ka-Noko Team' }],
  openGraph: {
    title: '톡까놓고 | 카카오톡 대화 AI 분석',
    description: '우리의 대환 속 숨겨진 마음, AI가 톡까놓고 분석해 드립니다.',
    url: 'https://talk-ka-noko.vercel.app/',
    siteName: 'Talk-Ka-Noko',
    images: [
      {
        url: 'https://talk-ka-noko.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: '톡까놓고 서비스 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '톡까놓고 | 카카오톡 대화 AI 분석',
    description: 'AI가 분석하는 우리 사이, 지금 확인하세요.',
    images: ['https://talk-ka-noko.vercel.app/og-image.png'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#191919',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
