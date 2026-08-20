import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          <button onClick={onClose} className="ml-auto p-1 text-gray-400">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
