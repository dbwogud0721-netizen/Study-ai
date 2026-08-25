import { adProvider } from '../../services/ads/AdProvider'

interface AdBannerProps {
  slot: string
  className?: string
}

/**
 * 광고 Placeholder. 문제풀이/결제/온보딩 화면에는 절대 넣지 않는다(App.tsx 라우트별로
 * 수동 배치 — 이 컴포넌트 자체가 "안전한 화면"을 판단하지 않는다).
 */
export function AdBanner({ slot, className = '' }: AdBannerProps) {
  const ad = adProvider.getBanner(slot)
  if (!ad) return null

  return (
    <div className={`h-16 flex items-center justify-between px-4 bg-gray-100 border border-dashed border-gray-300 rounded-2xl ${className}`}>
      <div>
        <p className="text-[10px] font-bold text-gray-400 tracking-wide">AD · {ad.sponsor}</p>
        <p className="text-xs text-gray-500">{ad.headline}</p>
      </div>
      <span className="text-[10px] font-bold text-gray-300 border border-gray-300 rounded px-1.5 py-0.5">DEV MOCK</span>
    </div>
  )
}
