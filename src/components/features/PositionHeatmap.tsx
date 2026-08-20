interface PositionCell {
  position: number
  accuracy: number
  sampleSize: number
}

interface PositionHeatmapProps {
  positions: PositionCell[]
  onSelect?: (position: number) => void
}

function colorFor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-400'
  if (accuracy >= 60) return 'bg-yellow-400'
  if (accuracy >= 40) return 'bg-orange-400'
  return 'bg-red-400'
}

export function PositionHeatmap({ positions, onSelect }: PositionHeatmapProps) {
  const sorted = [...positions].sort((a, b) => a.position - b.position)
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {sorted.map((p) => (
        <button
          key={p.position}
          onClick={() => onSelect?.(p.position)}
          disabled={!onSelect}
          title={`${p.position}번 · 정답률 ${p.accuracy}% (표본 ${p.sampleSize})`}
          className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold text-white ${colorFor(p.accuracy)}`}
        >
          {p.position}
        </button>
      ))}
    </div>
  )
}
