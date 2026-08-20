import { Question, Difficulty } from '../../types'
import { MATH_TAXONOMY } from '../curriculum/mathTaxonomy'
import { SCIENCE_TAXONOMY } from '../curriculum/scienceTaxonomy'
import { TaxonomyMajorArea } from '../curriculum/taxonomyTypes'

const now = () => new Date().toISOString()
const DIFFICULTY_CYCLE: Difficulty[] = ['easy', 'medium', 'medium', 'hard', 'hard', 'veryHard']
const EXPECTED_RATE: Record<Difficulty, number> = { easy: 88, medium: 72, hard: 52, veryHard: 33 }
const difficultyAt = (i: number) => DIFFICULTY_CYCLE[i % DIFFICULTY_CYCLE.length]

function buildBank(subject: string, grade: number, taxonomy: TaxonomyMajorArea[], idPrefix: string): Question[] {
  const questions: Question[] = []
  let idx = 0
  taxonomy.forEach((major) => {
    major.middleAreas.forEach((mid) => {
      mid.minorAreas.forEach((minor) => {
        const difficulty = difficultyAt(idx)
        questions.push({
          questionId: `${idPrefix}_${String(idx + 1).padStart(3, '0')}`,
          schoolLevel: 'high',
          grade,
          subject,
          unit: mid.name,
          difficulty,
          question: `[${major.name} · ${mid.name}] ${minor} 유형 문제`,
          choices: ['①', '②', '③', '④'].map((m, i) => `${m} 선택지 ${i + 1}`),
          correctAnswer: 0,
          explanation: `${mid.name}의 ${minor}를 확인하는 문제입니다.`,
          concept: `${mid.name} - ${minor}`,
          estimatedDifficulty: { easy: 0.3, medium: 0.5, hard: 0.7, veryHard: 0.9 }[difficulty],
          sourceType: 'ai_generated',
          createdAt: now(),
          tags: [major.name, mid.name, minor],
          curriculumVersion: '2022개정',
          examSystem: 'v2022_revised',
          majorArea: major.name,
          middleArea: mid.name,
          minorArea: minor,
          questionType: minor,
          expectedCorrectRate: EXPECTED_RATE[difficulty],
          score: 2,
        })
        idx++
      })
    })
  })
  return questions
}

export const MATH_QUESTION_BANK: Question[] = buildBank('수학', 2, MATH_TAXONOMY, 'math_gen')
export const SCIENCE_QUESTION_BANK: Question[] = buildBank('지구과학', 2, SCIENCE_TAXONOMY, 'sci_gen')
