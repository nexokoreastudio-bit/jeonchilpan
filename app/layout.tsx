import type { Metadata, Viewport } from 'next'
import './globals.css'
import { HeaderClient } from '@/components/layout/header-client'
import { Footer } from '@/components/layout/footer'
import { MainLayout } from '@/components/layout/main-layout'
import { PortalSidebarServer } from '@/components/portal/portal-sidebar-server'
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/json-ld'
import { KakaoSDKLoader } from '@/components/kakao/kakao-sdk-loader'
import { SalesAIChatbot } from '@/components/chat/sales-ai-chatbot'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'
// SEO 검증 코드는 서버 전용 환경변수만 사용
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION
const naverVerification = process.env.NAVER_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: '전칠판 - 전자칠판 사용자 소통·정보 포털',
    template: '%s | 전칠판',
  },
  description: '전국 학원장·선생님·공부방 운영자를 위한 전자칠판 소통·정보 교환 포털. 자료 공유, 실시간 뉴스, AI 상담.',
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
    siteName: '전칠판',
    title: '전칠판 - 전자칠판 사용자 소통·정보 포털',
    description: '전국 학원장·선생님·공부방 운영자를 위한 전자칠판 소통·정보 교환 포털. 자료 공유, 실시간 뉴스, AI 상담.',
    images: [
      {
        url: '/assets/images/jeonchilpan_og_logo.png',
        width: 1200,
        height: 630,
        alt: '전칠판 - 전자칠판 사용자 소통·정보 포털',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전칠판 - 전자칠판 사용자 소통·정보 포털',
    description: '전국 학원장·선생님·공부방 운영자를 위한 전자칠판 소통·정보 교환 포털. 자료 공유, 실시간 뉴스, AI 상담.',
    images: ['/assets/images/jeonchilpan_og_logo.png'],
  },
  alternates: {
    canonical: '/',
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
    google: googleVerification || undefined,
    other: naverVerification
      ? {
          'naver-site-verification': naverVerification,
        }
      : undefined,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // iOS 노치·홈 인디케이터 영역 활용
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const kakaoJsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || ''

  return (
    <html lang="ko">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <HeaderClient />
        <MainLayout sidebar={<PortalSidebarServer />}>{children}</MainLayout>
        <Footer />
        <SalesAIChatbot />
        {/* 카카오 SDK 로드 (JavaScript 키가 설정된 경우에만) */}
        {kakaoJsKey && <KakaoSDKLoader jsKey={kakaoJsKey} />}
      </body>
    </html>
  )
}
