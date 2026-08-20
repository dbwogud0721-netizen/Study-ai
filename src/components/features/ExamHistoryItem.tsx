import { formatDate, scoreColor } from '../../utils/formatters'

const SUBJECT_ICON: Record<string, string> = {
  수학: '📐', 과학: '🔬', 영어: '🌎', 국어: '📖', 사회: '🌍', 역사: '🏛️',
}

interface ExamHistoryItemProps {
  subject: string
  unit: string
  date: string
  questionCount: number
  score: number
  tokensEarned?: number
  onClick?: () => void
}

export function ExamHistoryItem({ subject, unit, date, questionCount, score, tokensEarned, onClick }: ExamHistoryItemProps) {
  return (
    <button onClick={onClick} disabled={!onClick} className="w-full flex items-center gap-3 bg-white rounded-card px-4 py-3 text-left">
      <div className="w-10 h-10 bg-primary-50 rounded-chip flex items-center justify-center text-lg flex-shrink-0">
        {SUBJECT_ICON[subject] ?? '📘'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{subject} · {unit}</p>
        <p className="text-xs text-gray-400">{formatDate(date)} · {questionCount}문제</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-lg font-black ${scoreColor(score)}`}>{score}점</p>
        {tokensEarned !== undefined && <p className="text-xs text-amber-500">+{tokensEarned}🪙</p>}
      </div>
    </button>
  )
}
