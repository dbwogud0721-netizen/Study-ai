import { RewardPartner, PartnerRewardProduct } from '../../types'
import { Button } from '../ui/Button'

const CATEGORY_PLACEHOLDER: Record<RewardPartner['category'], string> = {
  GAME: '🎮',
  WEBTOON: '🍪',
}

interface PartnerRewardCardProps {
  partner: RewardPartner
  product: PartnerRewardProduct
  onRedeem: () => void
}

// 게임/웹툰 상품 카드. partner.logoUrl이 채워지면 실제 로고로, 없으면
// Generic 이모지 Placeholder로 표시한다(카카오페이 카드 컴포넌트와 무관한 신규 컴포넌트).
export function PartnerRewardCard({ partner, product, onRedeem }: PartnerRewardCardProps) {
  return (
    <div className="bg-white rounded-card border-2 border-gray-100 p-4">
      <div className="flex items-center gap-3">
        {partner.logoUrl ? (
          <img src={partner.logoUrl} alt={partner.name} className="w-10 h-10 rounded-chip object-cover flex-shrink-0" />
        ) : (
          <span className="w-10 h-10 rounded-chip bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
            {CATEGORY_PLACEHOLDER[partner.category]}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{partner.name}</p>
          <p className="text-xs text-gray-400 truncate">{product.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div>
          <p className="text-[11px] text-gray-400">필요 Reward</p>
          <p className="text-sm font-black text-amber-500">{product.tokenPrice} TOKEN</p>
        </div>
        <Button size="sm" onClick={onRedeem}>
          교환하기
        </Button>
      </div>
    </div>
  )
}
