import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import React from 'react'

interface AppHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  onBack?: () => void
  showBack?: boolean
  showHome?: boolean
  transparent?: boolean
}

// 문제풀이 화면(Exam.tsx)을 제외한 모든 주요 화면에서 쓰는 공통 헤더.
// 어느 화면에 있든 [←]로 이전 화면, [⌂]로 홈으로 바로 이동할 수 있게 한다.
export function AppHeader({ title, subtitle, right, onBack, showBack = true, showHome = true, transparent = false }: AppHeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <header className={`flex items-center px-4 pt-12 pb-4 ${transparent ? '' : 'bg-gray-50'}`}>
      {showBack && (
        <button onClick={handleBack} className="p-2 -ml-2 mr-2 text-gray-600" aria-label="이전 화면">
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {right && <div className="mr-1">{right}</div>}
      {showHome && (
        <button onClick={() => navigate('/home')} className="p-2 -mr-2 text-gray-600" aria-label="홈으로">
          <Home size={22} />
        </button>
      )}
    </header>
  )
}
