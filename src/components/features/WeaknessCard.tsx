import { ConfidenceLevel } from '../../types'

interface WeaknessCardProps {
  label: string
  detail: string
  accuracy?: number
  confidence: ConfidenceLevel
  actionLabel?: string
  onAction?: () => void
}

export function WeaknessCard({ label, detail, accuracy, confidence, actionLabel, onAction }: WeaknessCardProps) {
  return (
    <div className="bg-white rounded-card p-4 border border-gray-50">
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-sm text-gray-900">{label}</p>
        {accuracy !== undefined && <span className="text-sm font-black text-red-500">{accuracy}%</span>}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
      {confidence === 'low' && <p className="text-[11px] text-gray-400 mt-1">* 아직 데이터가 부족해요</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-3 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-chip">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
