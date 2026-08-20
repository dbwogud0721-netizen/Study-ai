interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  color = 'bg-primary-500',
  height = 'h-2',
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{value} / {max}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
