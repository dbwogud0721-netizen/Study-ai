import { ChevronRight, Clock, FileText } from 'lucide-react'
import { Badge } from '../ui/Badge'

interface ExamCardProps {
  badge?: string
  badgeColor?: string
  title: string
  subtitle?: string
  questionCount: number
  minutes: number
  tokenCost: number
  difficultyStars?: number
  size?: 'md' | 'lg'
  onClick?: () => void
}

export function ExamCard({
  badge, badgeColor = 'bg-primary-100 text-primary-600', title, subtitle,
  questionCount, minutes, tokenCost, difficultyStars, size = 'md', onClick,
}: ExamCardProps) {
  const isLg = size === 'lg'
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-card shadow-sm active:scale-[0.98] transition-transform ${isLg ? 'p-5' : 'p-4'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {badge && <Badge color={badgeColor}>{badge}</Badge>}
          <p className={`font-black text-gray-900 mt-1.5 ${isLg ? 'text-lg' : 'text-sm'}`}>{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{subtitle}</p>}
        </div>
        <ChevronRight size={isLg ? 22 : 18} className="text-gray-300 flex-shrink-0 mt-1" />
      </div>

      {difficultyStars !== undefined && (
        <div className="flex items-center gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < difficultyStars ? 'text-amber-400' : 'text-gray-200'}>★</span>
          ))}
        </div>
      )}

      <div className={`flex items-center gap-3 text-gray-400 ${isLg ? 'mt-4 text-sm' : 'mt-3 text-xs'}`}>
        <span className="flex items-center gap-1"><FileText size={isLg ? 14 : 11} />{questionCount}문제</span>
        <span className="flex items-center gap-1"><Clock size={isLg ? 14 : 11} />{minutes}분</span>
        <span className="ml-auto flex items-center gap-1 font-bold text-amber-500">🪙 {tokenCost} TOKEN</span>
      </div>
    </button>
  )
}
