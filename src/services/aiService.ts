import { Question, ExamConfig, ExamBlueprint, BlueprintItem, ConceptAnalysis, QuestionAttempt } from '../types'
import { MOCK_QUESTIONS } from '../data/mockQuestions'
import { MOCK_CONCEPT_STRENGTHS } from '../data/mockExamHistory'
import { getExamModeDef } from '../config/examModeConfig'
import { TOKEN_COSTS } from '../config/tokenConfig'
import { getFullMockBlueprint, getSubjectTaxonomy } from '../config/curriculumConfig'
import { generateRecommendedExam as generateRecommendedExamFromHistory } from './analytics'

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

/** taxonomy가 등록된 과목의 대영역 하나를 문항수만큼 균등 분배(전체 영역 선택 시, 섹션 25) */
function buildAreaEvenDistribution(subjectName: string, majorAreaId: string, total: number): BlueprintItem[] {
  const taxonomy = getSubjectTaxonomy(subjectName)
  const major = taxonomy?.find((m) => m.id === majorAreaId || m.name === majorAreaId)
  if (!major || major.middleAreas.length === 0) return [{ label: majorAreaId, count: total }]
  const n = major.middleAreas.length
  const base = Math.floor(total / n)
  return major.middleAreas.map((mid, i) => ({
    label: mid.name,
    count: i === n - 1 ? total - base * (n - 1) : base,
  }))
}

interface WeaknessSource {
  attempts: QuestionAttempt[]
  questions: Question[]
}

/**
 * topicPool: 해당 과목의 단원명 목록(있으면) — Blueprint의 영역 분포를 만드는 데 사용된다.
 * weaknessSource: weakness_ai 모드에서 실제 이력 기반 추천을 만들 때 쓰는 attempts/questions(호출부에서 examService.getExamHistory로 조회해 주입).
 */
export async function generateExamBlueprint(
  config: ExamConfig,
  topicPool: string[] = [],
  weaknessSource?: WeaknessSource
): Promise<ExamBlueprint> {
  await delay(500)
  const modeDef = getExamModeDef(config.schoolLevel, config.examMode)
  const tokenCost = TOKEN_COSTS[config.examMode] ?? 3

  // AI 취약영역 모의고사: 실 이력이 충분하면 Analytics Engine의 추천 결과를 그대로 사용(섹션 16)
  if (config.examMode === 'weakness_ai' && weaknessSource && weaknessSource.attempts.length >= 10) {
    return generateRecommendedExamFromHistory(weaknessSource.attempts, weaknessSource.questions, config.subjectName, config.questionCount)
  }

  // 전체 모의고사: 실제 수능과 동일한 문항수·시간이 고정값이다(임의 선택 불가).
  // 과목별 세부 영역 구성이 등록돼 있으면 그걸 쓰고, 없으면 문항수/시간만 고정한 채 균등 배분한다.
  if (config.examType === 'FULL_MOCK') {
    const full = getFullMockBlueprint(config.subjectName)
    const totalQuestions = full?.totalQuestions ?? config.questionCount
    const estimatedMinutes = full?.timeLimitMinutes ?? config.timeLimitMinutes
    return {
      title: `${config.subjectName} 전체 모의고사`,
      examModeLabel: modeDef?.label ?? '전체 모의고사',
      totalQuestions,
      distribution: full?.distribution ?? buildBalancedDistribution(topicPool, totalQuestions),
      estimatedMinutes,
      tokenCost,
      rationale: '실제 수능과 동일한 문항수·시간으로 구성했어요',
    }
  }

  // 영역별 모의고사: taxonomy 기반(대영역 전체 또는 중영역 하나)
  if (config.examType === 'AREA_MOCK' && config.targetMajorArea) {
    const taxonomy = getSubjectTaxonomy(config.subjectName)
    const major = taxonomy?.find((m) => m.id === config.targetMajorArea || m.name === config.targetMajorArea)
    if (major) {
      const distribution: BlueprintItem[] = config.targetMiddleArea
        ? [{ label: config.targetMiddleArea, count: config.questionCount }]
        : buildAreaEvenDistribution(config.subjectName, config.targetMajorArea, config.questionCount)

      return {
        title: `${config.subjectName} ${config.targetMiddleArea ?? major.name} 모의고사`,
        examModeLabel: modeDef?.label ?? '영역별 모의고사',
        totalQuestions: config.questionCount,
        distribution,
        estimatedMinutes: config.timeLimitMinutes,
        tokenCost,
      }
    }
  }

  // 폴백: taxonomy 없는 과목/기존 내신형 흐름
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
    return finalizeQuestions(shuffle(basePool).slice(0, config.questionCount))
  }

  const picked: Question[] = []
  const usedIds = new Set<string>()

  for (const item of blueprint.distribution) {
    const matched = shuffle(
      basePool.filter(
        (q) =>
          !usedIds.has(q.questionId) &&
          (q.majorArea === item.label ||
            q.middleArea === item.label ||
            q.minorArea === item.label ||
            q.concept.includes(item.label) ||
            q.unit.includes(item.label) ||
            item.label.includes(q.concept))
      )
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

  return finalizeQuestions(shuffle(picked).slice(0, config.questionCount))
}

// TEMP(테스트용, 나중에 지울 것): 토큰 보상 흐름을 빠르게 확인할 수 있도록
// 생성되는 모든 문제의 정답을 1번(인덱스 0)으로 강제한다.
const DEBUG_FORCE_FIRST_CHOICE_CORRECT = true

// 실제 수능/모의고사와 동일하게 5지선다로 통일한다. 원본 문제가 4개뿐이면
// 같은 과목의 다른 문제에서 오답 하나를 빌려와 5번째 선택지로 채운다.
function ensureFiveChoices(questions: Question[]): Question[] {
  return questions.map((q) => {
    if (q.choices.length >= 5) return q
    const existing = new Set(q.choices)
    const candidates = shuffle(MOCK_QUESTIONS.filter((other) => other.subject === q.subject && other.questionId !== q.questionId))

    let extra: string | undefined
    for (const other of candidates) {
      const wrongChoices = other.choices.filter((_, i) => i !== other.correctAnswer)
      const found = wrongChoices.find((c) => !existing.has(c))
      if (found) { extra = found; break }
    }
    if (!extra) extra = `${q.choices[q.choices.length - 1]} (유사 오답)`

    return { ...q, choices: [...q.choices, extra] }
  })
}

function finalizeQuestions(questions: Question[]): Question[] {
  return ensureFiveChoices(questions).map((q, i) => ({
    ...q,
    questionPosition: i + 1,
    correctAnswer: DEBUG_FORCE_FIRST_CHOICE_CORRECT ? 0 : q.correctAnswer,
  }))
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
