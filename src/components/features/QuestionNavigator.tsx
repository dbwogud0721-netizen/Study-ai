import { Question } from '../../types'

interface QuestionNavigatorProps {
  questions: Question[]
  answers: Record<string, number>
  currentIndex: number
  flaggedIds: string[]
  onSelect: (index: number) => void
}

export function QuestionNavigator({ questions, answers, currentIndex, flaggedIds, onSelect }: QuestionNavigatorProps) {
  const flagged = new Set(flaggedIds)

  return (
    <div className="p-4">
      <p className="text-xs font-semibold text-gray-500 mb-3">문제 번호</p>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const answered = answers[q.questionId] !== undefined
          const current = i === currentIndex
          const isFlagged = flagged.has(q.questionId)

          let cls = 'bg-gray-100 text-gray-400'
          if (isFlagged) cls = 'bg-amber-400 text-white'
          if (answered) cls = 'bg-primary-100 text-primary-600'
          if (current) cls = 'bg-primary-50 text-primary-700 border-4 border-primary-600'

          return (
            <button
              key={q.questionId}
              onClick={() => onSelect(i)}
              className={`w-full aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center ${cls}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border-2 border-primary-600 bg-primary-50 inline-block" /> 현재</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary-100 inline-block" /> 답변완료</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-100 inline-block" /> 미답변</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> 검토 필요</span>
      </div>
    </div>
  )
}
