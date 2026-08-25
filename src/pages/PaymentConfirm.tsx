import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, PartyPopper } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { getRequestById, confirmMockPayment } from '../services/paymentService'
import { getUserById, saveUser } from '../services/authService'
import { TOKEN_PACKAGES } from '../config/tokenEconomyConfig'
import { StudentUser } from '../types'

export default function PaymentConfirm() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)

  const request = useMemo(() => (requestId ? getRequestById(requestId) : undefined), [requestId])
  const pkg = request ? TOKEN_PACKAGES.find((p) => p.id === request.productId) : undefined

  if (!request) {
    return (
      <MobileLayout>
        <AppHeader title="결제 확인" />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">요청을 찾을 수 없어요</div>
      </MobileLayout>
    )
  }

  const handlePay = async () => {
    setPaying(true)
    const studentUser = getUserById(request.studentId) as StudentUser | null
    await new Promise((r) => setTimeout(r, 900))
    const result = confirmMockPayment(request.id)
    if (result && studentUser) {
      saveUser({ ...studentUser, tokens: result.balanceAfter })
    }
    setPaying(false)
    setDone(true)
  }

  if (done) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <PartyPopper size={48} className="text-primary-500 mb-4" />
          <h1 className="text-xl font-black text-gray-900 mb-2">결제가 완료됐어요</h1>
          <p className="text-sm text-gray-500 mb-8">{request.studentName}에게 {request.tokens} TOKEN이 지급됐어요</p>
          <Button fullWidth size="lg" onClick={() => navigate('/parent')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <AppHeader title="결제 확인" />
      <div className="flex-1 px-5 pb-8">
        <div className="bg-white rounded-card p-5 space-y-3 mt-2">
          <Row label="상품" value={pkg?.label ?? `${request.tokens} TOKEN`} />
          <Row label="가격" value={`${request.price.toLocaleString()}원`} />
          <Row label="결제 대상" value={request.studentName} />
          <Row label="결제수단" value="카드 **** 1234 (Mock)" />
        </div>

        <button onClick={() => setAgreed(!agreed)} className="w-full flex items-center gap-2 text-sm text-gray-600 mt-5">
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${agreed ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
            {agreed && <Check size={12} className="text-white" />}
          </span>
          결제 내용을 확인했습니다.
        </button>

        <Button fullWidth size="lg" className="mt-6" disabled={!agreed} loading={paying} onClick={handlePay}>
          ₩{request.price.toLocaleString()} 결제하기
        </Button>
      </div>
    </MobileLayout>
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
