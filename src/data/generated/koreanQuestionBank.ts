import { Question, Difficulty } from '../../types'
import { KOREAN_TAXONOMY } from '../curriculum/koreanTaxonomy'

const now = () => new Date().toISOString()

const DIFFICULTY_CYCLE: Difficulty[] = ['easy', 'medium', 'medium', 'hard', 'hard', 'veryHard']
const EXPECTED_RATE: Record<Difficulty, number> = { easy: 88, medium: 72, hard: 52, veryHard: 33 }

function difficultyAt(index: number): Difficulty {
  return DIFFICULTY_CYCLE[index % DIFFICULTY_CYCLE.length]
}

interface LeafPair {
  middleAreaId: string
  middleAreaName: string
  minorArea: string
}

function literatureLeaves(): LeafPair[] {
  const lit = KOREAN_TAXONOMY.find((m) => m.id === 'literature')!
  const leaves: LeafPair[] = []
  lit.middleAreas.forEach((mid) => {
    mid.minorAreas.forEach((minor) => leaves.push({ middleAreaId: mid.id, middleAreaName: mid.name, minorArea: minor }))
  })
  return leaves
}

/** 독서: 제재 8개 × 대표 문제유형 4개(전체 11개 유형 순환 배정)로 문항 수를 통제한다 */
function readingLeaves(): LeafPair[] {
  const reading = KOREAN_TAXONOMY.find((m) => m.id === 'reading')!
  const leaves: LeafPair[] = []
  reading.middleAreas.forEach((mid, midIdx) => {
    for (let k = 0; k < 4; k++) {
      const minor = mid.minorAreas[(midIdx * 4 + k) % mid.minorAreas.length]
      leaves.push({ middleAreaId: mid.id, middleAreaName: mid.name, minorArea: minor })
    }
  })
  return leaves
}

function flatLeaves(majorAreaId: string): LeafPair[] {
  const major = KOREAN_TAXONOMY.find((m) => m.id === majorAreaId)!
  const leaves: LeafPair[] = []
  major.middleAreas.forEach((mid) => {
    mid.minorAreas.forEach((minor) => leaves.push({ middleAreaId: mid.id, middleAreaName: mid.name, minorArea: minor }))
  })
  return leaves
}

function buildQuestion(params: {
  idx: number
  idPrefix: string
  majorAreaName: string
  leaf: LeafPair
  position: number
  isReading: boolean
}): Question {
  const { idx, idPrefix, majorAreaName, leaf, position, isReading } = params
  const difficulty = difficultyAt(idx)
  const label = isReading ? '독서' : majorAreaName
  const questionType = isReading ? leaf.minorArea : leaf.minorArea
  return {
    questionId: `${idPrefix}_${String(idx + 1).padStart(3, '0')}`,
    schoolLevel: 'high',
    grade: 2,
    subject: '국어',
    unit: leaf.middleAreaName,
    difficulty,
    question: isReading
      ? `[독서 · ${leaf.middleAreaName}] 제시문의 ${leaf.minorArea} 요소를 파악하는 문제`
      : `[문학 · ${leaf.middleAreaName}] 작품에서 ${leaf.minorArea} 요소를 파악하는 문제`,
    passage: isReading ? `(${leaf.middleAreaName} 제재 지문 — 예시)` : `(${leaf.middleAreaName} 작품 — 예시)`,
    choices: ['① 지문/작품 근거와 일치한다', '② 지문/작품에 언급되지 않았다', '③ 지문/작품 내용과 반대된다', '④ 지문/작품과 무관한 내용이다'],
    correctAnswer: 0,
    explanation: `${leaf.middleAreaName}의 ${leaf.minorArea} 포인트를 확인하는 문제입니다.`,
    concept: `${leaf.middleAreaName} - ${leaf.minorArea}`,
    estimatedDifficulty: { easy: 0.3, medium: 0.5, hard: 0.7, veryHard: 0.9 }[difficulty],
    sourceType: 'ai_generated',
    createdAt: now(),
    tags: [label, leaf.middleAreaName, leaf.minorArea],
    curriculumVersion: '2022개정',
    examSystem: 'v2022_revised',
    majorArea: isReading ? '독서' : '문학',
    middleArea: leaf.middleAreaName,
    minorArea: leaf.minorArea,
    passageType: isReading ? leaf.middleAreaName : undefined,
    questionType,
    expectedCorrectRate: EXPECTED_RATE[difficulty],
    questionPosition: position,
    score: 2,
  }
}

function buildFlatQuestion(params: { idx: number; idPrefix: string; majorAreaName: string; leaf: LeafPair; position: number }): Question {
  const { idx, idPrefix, majorAreaName, leaf, position } = params
  const difficulty = difficultyAt(idx)
  return {
    questionId: `${idPrefix}_${String(idx + 1).padStart(3, '0')}`,
    schoolLevel: 'high',
    grade: 3,
    subject: '국어',
    unit: leaf.middleAreaName,
    difficulty,
    question: `[${majorAreaName} · ${leaf.middleAreaName}] ${leaf.minorArea} 관련 문제`,
    choices: ['① 옳다', '② 옳지 않다', '③ 알 수 없다', '④ 무관하다'],
    correctAnswer: 0,
    explanation: `${leaf.middleAreaName}의 ${leaf.minorArea}를 확인하는 문제입니다.`,
    concept: `${leaf.middleAreaName} - ${leaf.minorArea}`,
    estimatedDifficulty: { easy: 0.3, medium: 0.5, hard: 0.7, veryHard: 0.9 }[difficulty],
    sourceType: 'ai_generated',
    createdAt: now(),
    tags: [majorAreaName, leaf.middleAreaName, leaf.minorArea],
    curriculumVersion: '2022개정',
    examSystem: 'v2022_revised',
    majorArea: majorAreaName,
    middleArea: leaf.middleAreaName,
    minorArea: leaf.minorArea,
    questionType: leaf.minorArea,
    expectedCorrectRate: EXPECTED_RATE[difficulty],
    questionPosition: position,
    score: 2,
  }
}

const LITERATURE_LEAVES = [...literatureLeaves(), ...literatureLeaves()] // 2배수: 리프당 최소 2문항 확보
const READING_LEAVES = readingLeaves()
const LANGUAGE_MEDIA_LEAVES = flatLeaves('language_media')
const SPEECH_WRITING_LEAVES = flatLeaves('speech_writing')

export const KOREAN_LITERATURE_QUESTIONS: Question[] = LITERATURE_LEAVES.map((leaf, idx) =>
  buildQuestion({ idx, idPrefix: 'kor_lit', majorAreaName: '문학', leaf, position: 18 + (idx % 17), isReading: false })
)

export const KOREAN_READING_QUESTIONS: Question[] = READING_LEAVES.map((leaf, idx) =>
  buildQuestion({ idx, idPrefix: 'kor_read', majorAreaName: '독서', leaf, position: 1 + (idx % 17), isReading: true })
)

const LANG_SPEECH_LEAVES = [...LANGUAGE_MEDIA_LEAVES, ...SPEECH_WRITING_LEAVES]
export const KOREAN_LANG_SPEECH_QUESTIONS: Question[] = LANG_SPEECH_LEAVES.map((leaf, idx) => {
  const majorAreaName = LANGUAGE_MEDIA_LEAVES.includes(leaf) ? '언어와 매체' : '화법과 작문'
  return buildFlatQuestion({ idx, idPrefix: 'kor_lang', majorAreaName, leaf, position: 35 + (idx % 11) })
})

export const KOREAN_QUESTION_BANK: Question[] = [
  ...KOREAN_LITERATURE_QUESTIONS,
  ...KOREAN_READING_QUESTIONS,
  ...KOREAN_LANG_SPEECH_QUESTIONS,
]
