interface TokenBadgeProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function TokenBadge({ amount, size = 'md', onClick }: TokenBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-2 gap-1.5',
    lg: 'text-lg px-4 py-2.5 gap-2',
  }
  const className = `flex items-center bg-amber-50 rounded-chip font-black text-amber-600 ${sizes[size]}`
  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        <span>🪙</span>
        <span>{amount}</span>
      </button>
    )
  }
  return (
    <div className={className}>
      <span>🪙</span>
      <span>{amount}</span>
    </div>
  )
}
