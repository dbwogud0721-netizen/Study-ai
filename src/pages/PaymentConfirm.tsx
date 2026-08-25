import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, PartyPopper } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { createSubscriptionPayment } from '../services/tokenService'
import { splitSubscriptionPayment, MONTHLY_SUBSCRIPTION_KRW } from '../config/tokenEconomyConfig'
import { MOCK_STUDENT } from '../data/mockUsers'
import { ParentUser } from '../types'

export default function PaymentConfirm() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const parent = user as ParentUser
  const student = MOCK_STUDENT

  const [agreed, setAgreed] = useState(false)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(false)

  const { serviceFeeKrw, rewardPoolKrw } = splitSubscriptionPayment(MONTHLY_SUBSCRIPTION_KRW)

  const handlePay = async () => {
    setPaying(true)
    await new Promise((r) => setTimeout(r, 900))
    createSubscriptionPayment(parent.id, student.id, MONTHLY_SUBSCRIPTION_KRW)
    setPaying(false)
    setDone(true)
  }

  if (done) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <PartyPopper size={48} className="text-primary-500 mb-4" />
          <h1 className="text-xl font-black text-gray-900 mb-2">결제가 완료됐어요</h1>
          <p className="text-sm text-gray-500 mb-2">
            {student.name}의 AI 학습 서비스 이용료 ₩{serviceFeeKrw.toLocaleString()}과
          </p>
          <p className="text-sm text-gray-500 mb-8">학생 성취 Reward 예산 ₩{rewardPoolKrw.toLocaleString()}이 준비됐어요</p>
          <Button fullWidth size="lg" onClick={() => navigate('/parent')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <AppHeader title="이번 달 학습 프로그램 결제" />
      <div className="flex-1 px-5 pb-8">
        <div className="bg-white rounded-card p-5 space-y-3 mt-2">
          <Row label="결제 대상" value={student.name} />
          <Row label="결제 금액" value={`₩${MONTHLY_SUBSCRIPTION_KRW.toLocaleString()}`} />
          <Row label="결제수단" value="카드 **** 1234 (Mock)" />
        </div>

        <div className="bg-primary-50 rounded-card p-5 mt-3 space-y-3">
          <p className="text-xs font-bold text-primary-600">이 결제는 이렇게 쓰여요</p>
          <Row label="AI 학습 서비스 이용료" value={`₩${serviceFeeKrw.toLocaleString()}`} />
          <Row label="학생 성취 Reward 예산" value={`₩${rewardPoolKrw.toLocaleString()}`} />
          <p className="text-[11px] text-gray-500 pt-2 border-t border-primary-100">
            내가 지불한 금액의 일부가 {student.name}이 열심히 공부했을 때 직접 얻을 수 있는 Reward로 배정돼요.
          </p>
        </div>

        <button onClick={() => setAgreed(!agreed)} className="w-full flex items-center gap-2 text-sm text-gray-600 mt-5">
          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${agreed ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
            {agreed && <Check size={12} className="text-white" />}
          </span>
          결제 내용을 확인했습니다.
        </button>

        <Button fullWidth size="lg" className="mt-6" disabled={!agreed} loading={paying} onClick={handlePay}>
          ₩{MONTHLY_SUBSCRIPTION_KRW.toLocaleString()} 결제하기
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
