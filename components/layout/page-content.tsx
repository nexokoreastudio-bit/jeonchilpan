/**
 * 메인페이지와 동일한 정갈한 레이아웃 래퍼
 * - 배경: #f4f6f8
 * - 컨테이너, 패딩, 간격 통일
 */
export function PageContent({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`min-h-screen bg-[#f4f6f8] ${className}`}>
      <div className="container mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-10">
        {children}
      </div>
    </div>
  )
}
