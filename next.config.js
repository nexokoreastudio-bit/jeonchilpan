/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

function buildContentSecurityPolicy() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://t1.kakaocdn.net',
    'https://developers.kakao.com',
  ]

  if (isDev) {
    scriptSrc.push("'unsafe-eval'")
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in https://generativelanguage.googleapis.com https://*.googleapis.com https://*.netlify.app ws: wss:",
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
  ].join('; ')
}

const contentSecurityPolicy = buildContentSecurityPolicy()

const nextConfig = {
  // 성능 최적화 설정
  compress: true, // gzip 압축 활성화
  poweredByHeader: false, // X-Powered-By 헤더 제거 (보안 및 성능)
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy
          }
        ],
      },
    ]
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.storage',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'flexible.img.hani.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'img.hani.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'imgnews.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'photo.jtbc.co.kr',
      },
      {
        protocol: 'https',
        hostname: '**.chosun.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.joins.com',
      },
      {
        protocol: 'https',
        hostname: 'dimg.donga.com',
      },
    ],
    // 프로덕션에서 이미지 최적화 활성화
    unoptimized: false,
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 환경 변수 검증
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 실험적 기능 (Next.js 14에서는 serverActions가 기본 활성화됨)
  // Server Actions body 크기 제한 설정 (기본값: 1MB)
  // 파일 업로드를 위해 60MB로 증가 (최대 파일 크기 50MB + 여유 공간)
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },
  
  // 기존 HTML 파일과 병행 사용
  async rewrites() {
    return [
      {
        source: '/legacy/:path*',
        destination: '/:path*',
      },
    ]
  },
  
  // 번들 최적화
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들 최적화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 공통 라이브러리 분리 (CSS 제외)
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              type: 'javascript/auto', // JavaScript만 처리
              priority: 20,
            },
            // Supabase 분리
            supabase: {
              name: 'supabase',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              type: 'javascript/auto', // JavaScript만 처리
              priority: 30,
            },
            // React 관련 분리
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              type: 'javascript/auto', // JavaScript만 처리
              priority: 40,
            },
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig

