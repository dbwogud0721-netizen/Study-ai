interface SubjectChipProps {
  icon?: string
  label: string
  selected?: boolean
  sub?: string
  onClick?: () => void
}

export function SubjectChip({ icon, label, selected = false, sub, onClick }: SubjectChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-chip border-2 transition-all
        ${selected ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-sm font-semibold">{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </button>
  )
}
