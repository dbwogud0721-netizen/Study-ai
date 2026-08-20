import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Lightbulb, RefreshCw, X, CheckCircle, XCircle } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useAppStore } from '../hooks/useAppStore'
import { generateQuestion } from '../services/aiService'
import { Question } from '../types'

export default function WrongAnswerAnalysis() {
  const { examId, questionId } = useParams()
  const navigate = useNavigate()
  const { currentExamResult } = useAppStore()

  const [similarQ, setSimilarQ] = useState<Question | null>(null)
  const [loadingQ, setLoadingQ] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)
  const [similarAnswer, setSimilarAnswer] = useState<number | null>(null)
  const [showSimilarResult, setShowSimilarResult] = useState(false)

  const result = currentExamResult
  if (!result) { navigate('/home'); return null }

  const q = result.questions.find((q) => q.questionId === questionId)
  if (!q) { navigate(-1); return null }

  const myAnswer = result.answers[q.questionId]
  const isCorrect = myAnswer === q.correctAnswer
  const whyWrong = getWhyWrong(q, myAnswer)

  const handleSimilar = async () => {
    setLoadingQ(true)
    const generated = await generateQuestion(q.concept, q.subject)
    setSimilarQ(generated)
    setLoadingQ(false)
    setShowSimilar(true)
    setSimilarAnswer(null)
    setShowSimilarResult(false)
  }

  return (
    <MobileLayout>
      <PageHeader title="오답 분석" subtitle={`${q.subject} · ${q.unit}`} />

      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-32">
        {/* 내 답 vs 정답 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-xs text-gray-500 mb-2">내가 선택한 답</p>
            {myAnswer !== undefined ? (
              <>
                <div className="flex justify-center mb-1">
                  {isCorrect ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-400" size={24} />}
                </div>
                <p className="font-bold text-sm text-gray-800">{q.choices[myAnswer]}</p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">미응답</p>
            )}
          </Card>
          <Card className="text-center bg-green-50">
            <p className="text-xs text-gray-500 mb-2">정답</p>
            <div className="flex justify-center mb-1">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="font-bold text-sm text-green-700">{q.choices[q.correctAnswer]}</p>
          </Card>
        </div>

        {/* 문제 */}
        <Card>
          <p className="text-xs font-semibold text-primary-500 mb-2">{q.concept}</p>
          <p className="font-semibold text-gray-900 text-sm leading-relaxed mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.choices.map((c, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm
                  ${i === q.correctAnswer ? 'bg-green-50 text-green-700 font-semibold'
                  : i === myAnswer ? 'bg-red-50 text-red-500 line-through'
                  : 'text-gray-400'}`}
              >
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {i + 1}
                </span>
                {c}
                {i === q.correctAnswer && <CheckCircle size={14} className="ml-auto text-green-500" />}
              </div>
            ))}
          </div>
        </Card>

        {/* 해설 */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-amber-500" size={18} />
            <h3 className="font-bold text-gray-900">정답 해설</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
        </Card>

        {/* 핵심 개념 */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-2">핵심 개념</h3>
          <span className="bg-primary-100 text-primary-600 text-sm font-bold px-3 py-1.5 rounded-xl inline-block">
            {q.concept}
          </span>
        </Card>

        {/* 왜 틀렸을까 */}
        {!isCorrect && (
          <Card className="bg-amber-50">
            <h3 className="font-bold text-gray-800 mb-2">💡 왜 틀렸을 가능성이 높아요</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{whyWrong}</p>
          </Card>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-5 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
            돌아가기
          </Button>
          <Button variant="primary" className="flex-1" loading={loadingQ} onClick={handleSimilar}>
            <RefreshCw size={14} /> 유사 문제 풀기
          </Button>
        </div>
      </div>

      {/* 유사 문제 Sheet */}
      {similarQ && (
        <BottomSheet open={showSimilar} onClose={() => setShowSimilar(false)} title="AI 유사 문제">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="bg-primary-50 rounded-2xl p-3">
              <p className="text-xs font-semibold text-primary-500 mb-1">AI 생성 문제</p>
              <p className="font-semibold text-gray-900 text-sm leading-relaxed">{similarQ.question}</p>
            </div>
            <div className="space-y-2">
              {similarQ.choices.map((c, i) => (
                <button
                  key={i}
                  disabled={showSimilarResult}
                  onClick={() => { setSimilarAnswer(i); setShowSimilarResult(true) }}
                  className={`w-full flex items-center gap-2 p-3 rounded-2xl border-2 text-left text-sm transition-all
                    ${showSimilarResult
                      ? i === similarQ.correctAnswer
                        ? 'border-green-400 bg-green-50'
                        : i === similarAnswer
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-100'
                      : similarAnswer === i
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 bg-white'
                    }`}
                >
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {i + 1}
                  </span>
                  {c}
                </button>
              ))}
            </div>
            {showSimilarResult && (
              <div className={`p-3 rounded-2xl ${similarAnswer === similarQ.correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`font-bold text-sm mb-1 ${similarAnswer === similarQ.correctAnswer ? 'text-green-700' : 'text-red-600'}`}>
                  {similarAnswer === similarQ.correctAnswer ? '✅ 정답!' : '❌ 오답'}
                </p>
                <p className="text-xs text-gray-600">{similarQ.explanation}</p>
              </div>
            )}
          </div>
        </BottomSheet>
      )}
    </MobileLayout>
  )
}

function getWhyWrong(q: Question, myAnswer: number | undefined): string {
  if (myAnswer === undefined) return '이 문제에 답변하지 않았어요. 시간 관리가 중요합니다.'
  const reasons = [
    `"${q.choices[myAnswer]}"을 선택했는데, 이 선택지는 ${q.concept}의 개념을 혼동했을 때 자주 선택하는 오답이에요.`,
    `핵심 개념인 "${q.concept}"를 완전히 이해하지 못했을 가능성이 있어요. 해설을 읽고 개념을 다시 정리해보세요.`,
    `비슷해 보이는 선택지 사이에서 혼동이 있었을 수 있어요. 각 선택지의 차이점을 명확히 구분하는 연습이 필요해요.`,
  ]
  return reasons[myAnswer % reasons.length]
}
