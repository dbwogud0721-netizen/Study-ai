import { Sparkles } from 'lucide-react'

interface AIInsightCardProps {
  title: string
  message: string
  action?: { label: string; onClick: () => void }
}

export function AIInsightCard({ title, message, action }: AIInsightCardProps) {
  return (
    <div className="bg-gradient-to-br from-violet-500 to-primary-600 rounded-card p-4 text-white">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={16} />
        <p className="text-xs font-bold opacity-90">{title}</p>
      </div>
      <p className="text-sm leading-relaxed">{message}</p>
      {action && (
        <button onClick={action.onClick} className="mt-3 bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-chip">
          {action.label}
        </button>
      )}
    </div>
  )
}
