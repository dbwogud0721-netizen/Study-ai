import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  gradient?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', onClick, gradient = false, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      className={`rounded-3xl ${gradient ? 'bg-gradient-to-br from-primary-500 to-violet-600 text-white' : 'bg-white'} shadow-sm ${paddings[padding]} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
