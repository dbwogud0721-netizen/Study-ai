import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { useAppStore } from '../hooks/useAppStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { StudentUser } from '../types'

interface NotificationPrefs {
  examRecommend: boolean
  gradeAnalysis: boolean
  tokenActivity: boolean
  parentAlerts: boolean
  streakReminder: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  examRecommend: true,
  gradeAnalysis: true,
  tokenActivity: true,
  parentAlerts: true,
  streakReminder: true,
}

const ITEMS: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
  { key: 'examRecommend', label: 'AI 추천 시험', desc: '오늘의 추천 시험이 준비되면 알려드려요' },
  { key: 'gradeAnalysis', label: '성적 분석 결과', desc: '시험 채점·AI 분석이 끝나면 알려드려요' },
  { key: 'tokenActivity', label: '토큰 획득·소진', desc: '토큰이 들어오거나 나갈 때 알려드려요' },
  { key: 'parentAlerts', label: '보호자 알림', desc: '보호자가 토큰을 충전하거나 요청에 응답하면 알려드려요' },
  { key: 'streakReminder', label: '연속 학습 리마인드', desc: '오늘 학습을 안 했으면 저녁에 알려드려요' },
]

export default function NotificationSettings() {
  const { user } = useAppStore()
  const student = user as StudentUser
  const [prefs, setPrefs] = useLocalStorage<NotificationPrefs>(`studyai_notif_${student.id}`, DEFAULT_PREFS)

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <MobileLayout>
      <AppHeader title="알림 설정" />

      <div className="flex-1 px-5 pb-8">
        <div className="bg-white rounded-card divide-y divide-gray-50">
          {ITEMS.map((item) => (
            <div key={item.key} className="flex items-center gap-3 py-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={prefs[item.key]} onChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${checked ? 'bg-primary-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}
