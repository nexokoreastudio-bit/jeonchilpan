/**
 * 인앱 브라우저(WebView) 감지
 * Google OAuth는 WebView에서 403 disallowed_useragent로 차단됨
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined' || !navigator?.userAgent) return false
  const ua = navigator.userAgent.toLowerCase()

  // Android WebView: "wv" 포함
  if (/android/.test(ua) && ua.includes('wv')) return true

  // iOS: WKWebView (Safari와 UA가 비슷하지만, standalone으로 구분)
  // 인앱 브라우저: navigator.standalone 없음 + Safari가 아닌 WebView
  if (/iphone|ipad|ipod/.test(ua)) {
    // KakaoTalk, Instagram, Facebook 등 인앱 브라우저
    if (ua.includes('kakaotalk') || ua.includes('instagram') || ua.includes('fb') || ua.includes('line')) return true
    // WKWebView: Safari가 아니면서 모바일
    if (!ua.includes('safari') || ua.includes('crios') || ua.includes('fxios')) {
      // Chrome iOS, Firefox iOS는 정상 브라우저
      if (ua.includes('crios') || ua.includes('fxios')) return false
    }
  }

  // 기타 인앱 브라우저 패턴
  const webViewPatterns = [
    'kakaotalk',
    'instagram',
    'line',
    'naver',
    'daum',
    'tiktok',
    'snapchat',
    'fb_iab', // Facebook in-app browser
    'fbav',
    'fban',
    'fbav',
  ]
  return webViewPatterns.some((p) => ua.includes(p))
}

export const WEBVIEW_MESSAGE =
  '인앱 브라우저(카카오톡, 인스타그램 등)에서는 Google 로그인이 차단됩니다.\n\nChrome 또는 Safari 브라우저에서 전칠판 사이트를 열어주세요.'
