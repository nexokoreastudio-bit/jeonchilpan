export const LEGAL_VERSION = {
  terms: '2026-03-16-v1',
  privacy: '2026-03-16-v1',
} as const

export const LEGAL_EFFECTIVE_DATE = '2026-03-16'

export const BUSINESS_INFO = {
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || '(주)넥소',
  representative: process.env.NEXT_PUBLIC_COMPANY_REPRESENTATIVE || '박정민',
  businessNumber: process.env.NEXT_PUBLIC_COMPANY_BIZ_NO || '289-87-00638',
  ecommerceNumber: process.env.NEXT_PUBLIC_COMPANY_ECOMMERCE_NO || '통신판매업 신고번호 확인 중',
  privacyOfficer: process.env.NEXT_PUBLIC_COMPANY_PRIVACY_OFFICER || '개인정보보호책임자 확인 중',
  address:
    process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
    '인천광역시 서구 보듬로 158, 공존-527호(오류동, 블루텍)',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'nexo.korea.studio@gmail.com',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '032-569-5771',
} as const

export function nowIsoString() {
  return new Date().toISOString()
}
