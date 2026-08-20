import { useNavigate } from 'react-router-dom'
import { Coins, AlertCircle } from 'lucide-react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'

interface TokenInsufficientSheetProps {
  open: boolean
  onClose: () => void
  currentTokens: number
  required: number
}

export function TokenInsufficientSheet({ open, onClose, currentTokens, required }: TokenInsufficientSheetProps) {
  const navigate = useNavigate()

  return (
    <BottomSheet open={open} onClose={onClose} title="토큰이 부족해요">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
          <AlertCircle className="text-amber-500" size={20} />
          <div>
            <p className="text-sm text-gray-600">현재 보유</p>
            <p className="text-xl font-bold text-amber-600">🪙 {currentTokens} TOKEN</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-600">필요</p>
            <p className="text-xl font-bold text-red-500">🪙 {required} TOKEN</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            fullWidth
            variant="primary"
            onClick={() => { navigate('/exam/new?mode=weakness_ai'); onClose() }}
          >
            🎁 무료 학습으로 토큰 얻기
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => { navigate('/tokens?request=1'); onClose() }}
          >
            👨‍👩‍👧 보호자에게 요청하기
          </Button>
          <Button
            fullWidth
            variant="ghost"
            onClick={() => { navigate('/tokens?charge=1'); onClose() }}
          >
            <Coins size={16} />
            토큰 충전하기
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
