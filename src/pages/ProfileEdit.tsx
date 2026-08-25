import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { updateProfile } from '../services/authService'
import { StudentUser } from '../types'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const student = user as StudentUser

  const [name, setName] = useState(student.name)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const updated = updateProfile(student, { name })
    setUser(updated)
    setSaved(true)
    setTimeout(() => navigate('/my'), 700)
  }

  return (
    <MobileLayout>
      <AppHeader title="프로필 수정" />

      <div className="flex-1 px-5 pb-8 space-y-6">
        <div className="flex flex-col items-center pt-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-4xl">🎓</div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">이메일</label>
          <input
            value={student.email}
            disabled
            className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-1.5">이메일은 변경할 수 없어요</p>
        </div>

        <Button fullWidth size="lg" disabled={!name.trim()} onClick={handleSave}>
          {saved ? '저장됐어요 ✓' : '저장하기'}
        </Button>
      </div>
    </MobileLayout>
  )
}
