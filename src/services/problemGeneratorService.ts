import { GeneratedProblem, ProblemGenerationRequest } from '../types/problemGenerator'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const SECTION_LABELS = ['출제 범위', '난이도', '문제 유형', '지문', '문항', '보기', '배점'] as const

function buildMockProblem(index: number, difficulty: number): GeneratedProblem {
  const id = `gen_math_${Date.now()}_${index}`
  const sections = SECTION_LABELS.map((label, i) => ({
    code: `1.${i + 1}`,
    label,
    content:
      label === '난이도'
        ? `${difficulty} / 5`
        : label === '지문'
          ? `[${index}번] 이차함수의 그래프와 성질을 활용하는 지문 예시입니다. 실제 AI 생성 함수가 연결되면 이 영역에 실제 지문/도표가 표시됩니다.`
          : label === '문항'
            ? `이차함수 y = x² - ${index}x + ${difficulty}의 그래프에 대한 설명으로 옳은 것은?`
            : label === '보기'
              ? '① ~ ⑤ 선택지가 여기에 표시됩니다.'
              : `${label} 관련 자동 생성 정보(placeholder)`,
  }))

  return {
    id,
    index,
    sections,
    solution: `${index}번 문제 풀이 과정(placeholder): 이차함수를 표준형으로 변형하여 꼭짓점과 축을 구한 뒤 보기와 대조합니다.`,
    answer: `${((index + difficulty) % 5) + 1}번`,
    similarities: [
      { examName: '2024학년도 수능 수학', similarity: Math.max(20, 90 - difficulty * 10 - index) },
      { examName: '2023학년도 6월 모의평가', similarity: Math.max(15, 80 - difficulty * 8 - index) },
    ],
  }
}

/**
 * TODO: 실제 AI 문제 생성 함수로 교체 예정. 지금은 시그니처만 확정해두고
 * 5초 대기 후 mock 데이터를 반환한다. 호출부(ProblemMaker.tsx)는 60초 타임아웃을
 * 이미 전제하고 있으므로, 이 함수의 내부 구현만 실제 API 호출로 바꾸면 된다.
 */
export async function generateMathProblems(req: ProblemGenerationRequest): Promise<GeneratedProblem[]> {
  await delay(5000)
  return Array.from({ length: req.count }, (_, i) => buildMockProblem(i + 1, req.difficulty))
}
