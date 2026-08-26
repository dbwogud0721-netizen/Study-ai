import { useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { PartnerRewardProduct, TokenWallet } from '../../types'
import { RewardPartnerProvider } from '../../services/rewardPartners/RewardPartnerProvider'
import { redeemPartnerReward } from '../../services/rewardPartnerService'

type RedeemState = 'select' | 'loading' | 'done' | 'fail'

interface PartnerRedeemSheetProps {
  open: boolean
  onClose: () => void
  userId: string
  product: PartnerRewardProduct | null
  walletBalance: number
  provider: RewardPartnerProvider
  onRedeemed: (wallet: TokenWallet) => void
}

// 게임/웹툰 교환 확인 Flow 전용 BottomSheet. 카카오페이 전환 시트(TokenPage.tsx의
// showConvert/convertState)와 상태 이름은 비슷하지만 완전히 독립된 컴포넌트/상태다.
export function PartnerRedeemSheet({ open, onClose, userId, product, walletBalance, provider, onRedeemed }: PartnerRedeemSheetProps) {
  const [state, setState] = useState<RedeemState>('select')
  const [remainingBalance, setRemainingBalance] = useState(0)

  const handleClose = () => {
    setState('select')
    onClose()
  }

  const handleConfirm = async () => {
    if (!product) return
    setState('loading')
    const outcome = await redeemPartnerReward(userId, product, provider)
    if (!outcome.result.success || !outcome.wallet) {
      setState('fail')
      return
    }
    setRemainingBalance(outcome.wallet.balance)
    onRedeemed(outcome.wallet)
    setState('done')
  }

  if (!product) return null

  const afterBalance = walletBalance - product.tokenPrice

  return (
    <BottomSheet open={open} onClose={handleClose} title={state === 'select' ? `${product.title}(으)로 교환할까요?` : undefined}>
      {state === 'select' && (
        <div className="space-y-5">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <Row label="필요 Reward" value={`${product.tokenPrice} TOKEN`} />
            <Row label="현재 Reward" value={`${walletBalance} TOKEN`} />
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-900">교환 후</span>
              <span className="text-lg font-black text-gray-900">{afterBalance} TOKEN</span>
            </div>
          </div>
          <Button fullWidth disabled={afterBalance < 0} onClick={handleConfirm}>
            {product.tokenPrice} TOKEN으로 교환
          </Button>
        </div>
      )}
      {state === 'loading' && (
        <div className="py-10 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">지급을 처리하고 있어요...</p>
        </div>
      )}
      {state === 'done' && (
        <div className="py-6 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="font-bold text-gray-900 mb-1">리워드를 받았어요!</p>
          <p className="text-lg font-black text-gray-900 mt-3">₩{product.valueKrw.toLocaleString()} 상당 {product.title}</p>
          <p className="text-xs text-gray-400 mt-3">사용 Reward {product.tokenPrice}</p>
          <p className="text-xs text-gray-400">남은 Reward {remainingBalance}</p>
          <Button fullWidth className="mt-6" onClick={handleClose}>
            확인
          </Button>
        </div>
      )}
      {state === 'fail' && (
        <div className="py-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="font-bold text-gray-900 mb-1">리워드 지급에 실패했어요.</p>
          <p className="text-sm text-gray-500">Reward Token은 차감되지 않았습니다.</p>
          <Button fullWidth className="mt-6" onClick={() => setState('select')}>
            다시 시도
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}
