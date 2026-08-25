import { useNavigate } from 'react-router-dom'
import { BarChart2, RotateCcw, Gift, Home } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { AdBanner } from '../components/ads/AdBanner'
import { useAppStore } from '../hooks/useAppStore'
import { getWallet, getActiveRewardPool } from '../services/tokenService'
import { StudentUser } from '../types'

export default function ExamResult() {
  const navigate = useNavigate()
  const { currentExamResult, user } = useAppStore()
  const student = user as StudentUser

  if (!currentExamResult) {
    navigate('/home')
    return null
  }

  const r = currentExamResult
  const scoreEmoji = r.score >= 90 ? '🏆' : r.score >= 80 ? '🌟' : r.score >= 70 ? '👍' : '💪'
  const goalMessage =
    r.targetScore !== undefined
      ? r.targetScoreMet
        ? `🎯 목표 점수 ${r.targetScore}점 달성!`
        : `목표 점수 ${r.targetScore}점엔 못 미쳤어요`
      : null

  const wallet = getWallet(student.id)
  const pool = getActiveRewardPool(student.id)
  const poolExhausted = !!pool && pool.remainingKrw <= 0

  return (
    <MobileLayout className="bg-gray-50">
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="bg-gradient-to-br from-primary-500 to-violet-600 px-5 pt-16 pb-10 text-white text-center">
          <div className="text-6xl mb-3">🎉</div>
          <div className="text-7xl font-black">{r.score}점</div>
          {goalMessage && <p className="mt-2 text-white/90 font-bold">{goalMessage}</p>}
          <p className="mt-3 text-white/80 font-medium">
            정답 {r.correctCount} / {r.questions.length}
          </p>
        </div>

        <div className="mx-5 -mt-6 space-y-3">
          <div className="bg-white rounded-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎁</span>
              <div>
                <p className="text-xs text-gray-400">Reward Token 획득</p>
                <p className="text-2xl font-black text-amber-500">+{r.tokensEarned} TOKEN</p>
              </div>
            </div>
            {r.rewardCapped ? (
              <p className="text-xs text-amber-600 mt-3 pt-3 border-t border-gray-50">
                이번 달 Reward Pool 잔여 한도까지만 지급됐어요.
              </p>
            ) : null}
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">현재 보유 Reward Token {wallet.balance}</p>
          </div>

          <div className="bg-white rounded-card p-4 flex items-center gap-3">
            <Gift size={22} className="text-amber-500 flex-shrink-0" />
            <p className="flex-1 text-sm text-gray-700">
              {poolExhausted ? (
                <>이번 달 Reward를 모두 획득했어요!</>
              ) : pool ? (
                <>
                  이번 달 <strong>₩{pool.remainingKrw.toLocaleString()}</strong>의 Reward를 더 얻을 수 있어요
                </>
              ) : (
                <>보유 Reward Token으로 KakaoPay·게임·웹툰과 교환할 수 있어요</>
              )}
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/rewards')}>
              리워드 보기
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">{scoreEmoji} 잘했어요!</p>

        <div className="mx-5 mt-6">
          <AdBanner slot="exam-result" />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-5 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <Button variant="secondary" className="!px-3.5" onClick={() => navigate('/home')} aria-label="홈으로">
            <Home size={16} />
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/grades')}>
            <BarChart2 size={16} /> 상세 분석
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => navigate('/exam/new')}>
            <RotateCcw size={16} /> 한 번 더
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
