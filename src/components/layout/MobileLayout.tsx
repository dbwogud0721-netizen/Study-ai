import React from 'react'

interface MobileLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className={`w-full max-w-[390px] min-h-screen bg-gray-50 relative flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  )
}
