import { Question, ExamConfig, ExamBlueprint, BlueprintItem, ConceptAnalysis } from '../types'
import { MOCK_QUESTIONS } from '../data/mockQuestions'
import { MOCK_CONCEPT_STRENGTHS } from '../data/mockExamHistory'
import { getExamModeDef } from '../config/examModeConfig'
import { TOKEN_COSTS } from '../config/tokenConfig'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function buildWeaknessDistribution(total: number): BlueprintItem[] {
  const weak = MOCK_CONCEPT_STRENGTHS.filter((c) => c.status === 'weak')
  if (weak.length === 0) return [{ label: '전체 범위', count: total }]
  const weights = weak.map((c) => 100 - c.accuracy)
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  let allocated = 0
  const items: BlueprintItem[] = weak.map((c, i) => {
    const isLast = i === weak.length - 1
    const count = isLast ? total - allocated : Math.max(1, Math.round((weights[i] / sum) * total))
    allocated += count
    return { label: c.concept, count }
  })
  const rest = total - allocated
  if (rest > 0) items[items.length - 1].count += rest
  return items.filter((i) => i.count > 0)
}

function buildBalancedDistribution(topics: string[], total: number): BlueprintItem[] {
  const labels = topics.length > 0 ? topics.slice(0, 4) : ['핵심 개념 A', '핵심 개념 B', '핵심 개념 C']
  const n = labels.length
  const base = Math.floor(total / n)
  return labels.map((label, i) => ({
    label,
    count: i === n - 1 ? total - base * (n - 1) : base,
  }))
}

// topicPool: 해당 과목의 단원명 목록(있으면) — Blueprint의 영역 분포를 만드는 데 사용된다.
export async function generateExamBlueprint(config: ExamConfig, topicPool: string[] = []): Promise<ExamBlueprint> {
  await delay(500)
  const modeDef = getExamModeDef(config.schoolLevel, config.examMode)
  const tokenCost = TOKEN_COSTS[config.examMode] ?? 3

  let distribution: BlueprintItem[]
  if (config.examMode === 'weakness_ai') {
    distribution = buildWeaknessDistribution(config.questionCount)
  } else if (config.unitName) {
    distribution = [{ label: config.unitName, count: config.questionCount }]
  } else {
    distribution = buildBalancedDistribution(topicPool, config.questionCount)
  }

  return {
    title: `${config.subjectName} ${modeDef?.label ?? ''}`.trim(),
    examModeLabel: modeDef?.label ?? '',
    totalQuestions: config.questionCount,
    distribution,
    estimatedMinutes: config.timeLimitMinutes,
    tokenCost,
  }
}

export async function generateExam(config: ExamConfig, blueprint?: ExamBlueprint): Promise<Question[]> {
  await delay(800)
  const subjectPool = MOCK_QUESTIONS.filter((q) => q.subject === config.subjectName)
  const basePool = subjectPool.length > 0 ? subjectPool : MOCK_QUESTIONS

  if (!blueprint) {
    return shuffle(basePool).slice(0, config.questionCount)
  }

  const picked: Question[] = []
  const usedIds = new Set<string>()

  for (const item of blueprint.distribution) {
    const matched = shuffle(
      basePool.filter((q) => !usedIds.has(q.questionId) && (q.concept.includes(item.label) || q.unit.includes(item.label) || item.label.includes(q.concept)))
    )
    const take = matched.slice(0, item.count)
    take.forEach((q) => usedIds.add(q.questionId))
    picked.push(...take)
  }

  if (picked.length < config.questionCount) {
    const filler = shuffle(basePool.filter((q) => !usedIds.has(q.questionId)))
    for (const q of filler) {
      if (picked.length >= config.questionCount) break
      picked.push(q)
      usedIds.add(q.questionId)
    }
  }

  // 그래도 모자라면(문제은행이 작을 때) 중복 허용하여 채운다.
  // 원본과 questionId가 겹치면 Navigator 등에서 React key 충돌 + 답안 상태 공유 버그가 생기므로
  // 복제본에는 고유 id를 새로 부여한다.
  let dupCount = 0
  while (picked.length < config.questionCount && basePool.length > 0) {
    const src = basePool[picked.length % basePool.length]
    dupCount++
    picked.push({ ...src, questionId: `${src.questionId}_dup${dupCount}` })
  }

  return shuffle(picked).slice(0, config.questionCount)
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export async function generateQuestion(concept: string, subject: string): Promise<Question> {
  await delay(600)
  const base = MOCK_QUESTIONS.find((q) => q.concept.includes(concept) || q.subject === subject)
  if (!base) return MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)]

  return {
    ...base,
    questionId: `q_ai_${Date.now()}`,
    question: `[AI 생성] ${base.question}`,
    createdAt: new Date().toISOString(),
    sourceType: 'ai_generated',
  }
}

export async function gradeExam(
  questions: Question[],
  answers: Record<string, number>
): Promise<{ score: number; correctCount: number; wrongCount: number }> {
  await delay(300)
  let correct = 0
  questions.forEach((q) => {
    if (answers[q.questionId] === q.correctAnswer) correct++
  })
  const total = questions.length
  return {
    score: Math.round((correct / total) * 100),
    correctCount: correct,
    wrongCount: total - correct,
  }
}

export async function generateExplanation(question: Question, selectedAnswer: number): Promise<string> {
  await delay(400)
  const isCorrect = selectedAnswer === question.correctAnswer
  return isCorrect
    ? `정답입니다! ${question.explanation}`
    : `틀렸어요. 선택한 "${question.choices[selectedAnswer]}"는 오답입니다. ${question.explanation}`
}

export async function analyzeWeakness(
  questions: Question[],
  answers: Record<string, number>
): Promise<ConceptAnalysis[]> {
  await delay(500)
  const conceptMap: Record<string, { total: number; correct: number }> = {}

  questions.forEach((q) => {
    if (!conceptMap[q.concept]) conceptMap[q.concept] = { total: 0, correct: 0 }
    conceptMap[q.concept].total++
    if (answers[q.questionId] === q.correctAnswer) {
      conceptMap[q.concept].correct++
    }
  })

  return Object.entries(conceptMap).map(([concept, data]) => ({
    concept,
    total: data.total,
    correct: data.correct,
    accuracy: Math.round((data.correct / data.total) * 100),
  }))
}
