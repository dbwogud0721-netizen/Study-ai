import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  onBack?: () => void
  showBack?: boolean
  transparent?: boolean
}

export function PageHeader({ title, subtitle, right, onBack, showBack = true, transparent = false }: PageHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <header className={`flex items-center px-4 pt-12 pb-4 ${transparent ? '' : 'bg-gray-50'}`}>
      {showBack && (
        <button onClick={handleBack} className="p-2 -ml-2 mr-2 text-gray-600">
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </header>
  )
}
