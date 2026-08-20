interface TokenProductCardProps {
  label: string
  tokens: number
  bonus: number
  price: number
  best?: boolean
  selected: boolean
  onClick: () => void
}

export function TokenProductCard({ label, tokens, bonus, price, best, selected, onClick }: TokenProductCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 p-4 rounded-card border-2 transition-all
        ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
    >
      {best && (
        <span className="absolute -top-2 left-4 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          BEST · 가장 인기
        </span>
      )}
      <div className="text-2xl">🪙</div>
      <div className="flex-1 text-left">
        <p className="font-bold text-gray-900">{label}</p>
        {bonus > 0 && <p className="text-xs text-green-500">+{bonus} 보너스 포함</p>}
      </div>
      <p className="font-black text-gray-900">{price.toLocaleString()}원</p>
    </button>
  )
}
