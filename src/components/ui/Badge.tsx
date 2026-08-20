import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  size?: 'sm' | 'md'
}

export function Badge({ children, color = 'bg-primary-100 text-primary-600', size = 'sm' }: BadgeProps) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1' }
  return (
    <span className={`${color} ${sizes[size]} font-semibold rounded-full`}>{children}</span>
  )
}
