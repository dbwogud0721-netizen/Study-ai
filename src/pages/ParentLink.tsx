import { useState } from 'react'
import { CheckCircle2, Copy, Unlink } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { getUserById, linkParent, unlinkParent } from '../services/authService'
import { StudentUser, ParentUser } from '../types'

function inviteCodeFor(studentId: string): string {
  let hash = 0
  for (const ch of studentId) hash = (hash * 31 + ch.charCodeAt(0)) % 1000000
  return String(hash).padStart(6, '0')
}

export default function ParentLink() {
  const { user, setUser } = useAppStore()
  const student = user as StudentUser
  const [copied, setCopied] = useState(false)

  const parent = student.parentId ? (getUserById(student.parentId) as ParentUser | null) : null
  const code = inviteCodeFor(student.id)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // clipboard 권한 없는 환경 무시
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleLink = () => {
    const updated = linkParent(student)
    setUser(updated)
  }

  const handleUnlink = () => {
    const updated = unlinkParent(student)
    setUser(updated)
  }

  return (
    <MobileLayout>
      <AppHeader title="보호자 연결" />

      <div className="flex-1 px-5 pb-8">
        {parent ? (
          <div className="bg-white rounded-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-2xl">👨‍👩‍👧</div>
              <div>
                <p className="font-black text-gray-900">{parent.name}</p>
                <p className="text-xs text-gray-400">{parent.email}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={12} /> 연결됨
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              보호자가 내 학습 현황을 확인하고, 토큰 충전 요청을 승인할 수 있어요.
            </p>
            <Button fullWidth variant="secondary" onClick={handleUnlink}>
              <Unlink size={16} /> 연결 해제
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-card p-5">
            <p className="text-sm text-gray-600 mb-4">
              아래 초대 코드를 보호자에게 알려주세요. 보호자가 앱에서 코드를 입력하면 바로 연결돼요.
            </p>
            <div className="flex items-center justify-between bg-primary-50 rounded-2xl px-5 py-4 mb-4">
              <span className="text-2xl font-black tracking-[0.3em] text-primary-600">{code}</span>
              <button onClick={handleCopy} className="text-primary-500">
                <Copy size={18} />
              </button>
            </div>
            {copied && <p className="text-xs text-green-500 text-center mb-3">복사했어요</p>}
            <Button fullWidth onClick={handleLink}>
              지금 바로 연결하기 (Mock)
            </Button>
            <p className="text-xs text-gray-400 text-center mt-3">MVP 데모에서는 보호자 테스트 계정과 즉시 연결돼요</p>
          </div>
        )}
      </div>
    </MobileLayout>
  )
}
