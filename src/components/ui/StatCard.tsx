import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color?: string
}

export function StatCard({ icon, label, value, sub, color = 'bg-primary-50' }: StatCardProps) {
  return (
    <div className={`${color} rounded-card p-4`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}
