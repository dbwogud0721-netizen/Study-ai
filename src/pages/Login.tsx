import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { login } from '../services/authService'
import { useAppStore } from '../hooks/useAppStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAppStore()

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const user = login(email, password)
    setLoading(false)
    if (!user) {
      setError('이메일 또는 비밀번호가 올바르지 않아요')
      return
    }
    setUser(user)
    if (user.accountType === 'parent') navigate('/parent')
    else navigate('/home')
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col px-6 pt-16">
        <div className="mb-10">
          <div className="text-4xl mb-3">📚</div>
          <h1 className="text-3xl font-black text-gray-900">StudyAI</h1>
          <p className="text-gray-500 mt-1">AI 맞춤 문제풀이 서비스</p>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@test.com"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button fullWidth size="lg" loading={loading} onClick={handleLogin}>
          로그인
        </Button>

        <div className="mt-4 p-4 bg-primary-50 rounded-2xl">
          <p className="text-xs font-semibold text-primary-600 mb-2">테스트 계정</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>학생: student@test.com / 1234</p>
            <p>보호자: parent@test.com / 1234</p>
          </div>
        </div>

        <button
          className="mt-6 text-center text-sm text-gray-400 py-1"
          onClick={() => navigate('/onboarding')}
        >
          ← 온보딩 다시 보기
        </button>
      </div>
    </div>
  )
}
