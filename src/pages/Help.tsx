import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { PageHeader } from '../components/layout/PageHeader'

const FAQS: { q: string; a: string }[] = [
  { q: '토큰은 어떻게 얻나요?', a: '시험을 응시해 점수를 받으면 점수 구간에 따라 토큰을 받아요. 연속 학습 보너스, 보호자 충전, 목표 점수 초과 달성 보너스로도 얻을 수 있어요.' },
  { q: '모의고사와 실전 테스트는 뭐가 달라요?', a: '모의고사(고등학생)는 실제 수능·학평과 동일한 문항수·시간으로 고정돼요. 실전 테스트(중학생)는 학교 시험 범위를 기준으로 한 AI 문제풀이예요.' },
  { q: '학년을 바꾸면 이전 시험 기록은 사라지나요?', a: '아니요. 시험 기록과 토큰 내역은 계정에 그대로 남아요. 학년을 바꾸면 새로 응시하는 시험의 범위만 바뀌어요.' },
  { q: '보호자 연결은 꼭 해야 하나요?', a: '아니요. 다만 연결하면 보호자가 토큰 충전을 대신 결제해줄 수 있고, 학습 현황도 함께 볼 수 있어요.' },
  { q: '틀린 문제는 어디서 다시 볼 수 있나요?', a: '시험 결과 화면의 "틀린 문제 분석"에서 문제별 해설과 유사 문제를 확인할 수 있어요.' },
]

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <MobileLayout>
      <PageHeader title="도움말" />

      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        <div className="bg-white rounded-card divide-y divide-gray-50">
          {FAQS.map((item, i) => {
            const open = openIndex === i
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="w-full flex items-center gap-3 py-4 text-left"
                >
                  <span className="flex-1 text-sm font-semibold text-gray-800">{item.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && <p className="text-sm text-gray-500 leading-relaxed pb-4 -mt-2">{item.a}</p>}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-card p-4 mt-4 text-center">
          <p className="text-sm text-gray-500">더 궁금한 점이 있으면</p>
          <p className="text-sm font-bold text-primary-500 mt-1">support@studyai.local</p>
        </div>
      </div>
    </MobileLayout>
  )
}
