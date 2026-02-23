import type { Metadata } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import './globals.css'
import { HeaderClient } from '@/components/layout/header-client'
import { Footer } from '@/components/layout/footer'
import { MainLayout } from '@/components/layout/main-layout'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld'
import { KakaoSDKLoader } from '@/components/kakao/kakao-sdk-loader'
import { SalesAIChatbot } from '@/components/chat/sales-ai-chatbot'

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-sans',
})

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'NEXO Daily - 전자칠판 교육 정보 큐레이션',
    template: '%s | NEXO Daily',
  },
  description: '넥소 전자칠판 사용자들을 위한 교육 정보 큐레이션 및 커뮤니티 플랫폼. 일일 발행 콘텐츠, 입시 자료, 학원 운영 팁을 제공합니다.',
  keywords: [
    '전자칠판',
    '스마트보드',
    '학원 운영',
    '입시 자료',
    '교육 정보',
    '학원장',
    '교육 커뮤니티',
    '넥소',
    'NEXO',
  ],
  authors: [{ name: 'NEXO Korea' }],
  creator: 'NEXO Korea',
  publisher: 'NEXO Korea',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: baseUrl,
    siteName: 'NEXO Daily',
    title: 'NEXO Daily - 전자칠판 교육 정보 큐레이션',
    description: '넥소 전자칠판 사용자들을 위한 교육 정보 큐레이션 및 커뮤니티 플랫폼',
    images: [
      {
        url: '/assets/images/og-image.png',
        width: 1200,
        height: 1200,
        alt: 'NEXO Daily 로고',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXO Daily - 전자칠판 교육 정보 큐레이션',
    description: '넥소 전자칠판 사용자들을 위한 교육 정보 큐레이션 및 커뮤니티 플랫폼',
    images: ['/assets/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console, Naver Search Advisor 등에서 제공받은 코드 추가 가능
    // google: 'your-google-verification-code',
    // naver: 'your-naver-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || ''

  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <HeaderClient />
        <MainLayout>{children}</MainLayout>
        <Footer />
        <SalesAIChatbot />
        {/* 카카오 SDK 로드 (JavaScript 키가 설정된 경우에만) */}
        {kakaoJsKey && <KakaoSDKLoader jsKey={kakaoJsKey} />}
      </body>
    </html>
  )
}

