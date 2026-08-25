import { GeneratedProblem, ProblemGenerationRequest, ProblemPoolEntry } from '../types/problemGenerator'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * 데모용 문제 풀(참고 프로그램 PickAI X와 동일한 데이터). 실제로는 AI 생성 엔진의
 * 출력으로 교체될 자리 — 지금은 이 풀에서 문항 수만큼 서로 다른 문제를 무작위로 뽑는다.
 */
const PROBLEM_POOL: ProblemPoolEntry[] = [
  {
    area: '지수와 로그', combo: '단독', formulaArea: '지수함수',
    problem: '함수 f(x) = 2^(x+1) - 3 에 대하여 f(a) = 13을 만족시키는\n실수 a의 값을 구하시오.',
    formula: '지수법칙(밑이 같으면 지수도 같다: 2^x = 2^y ⇒ x = y)',
    unknownCount: 1, conditionBranch: 0, degreeCount: 1,
    intent: '지수방정식을 지수법칙으로 정리하고 밑을 통일하여 미지수를 구할 수 있는지 평가',
    trendArea: '지수와 로그 영역은 최근 5개년 중 3회 출제됨',
    trendCombo: '로그함수 또는 수열과의 결합 가능성 있음',
    solution: '2^(a+1) - 3 = 13\n2^(a+1) = 16 = 2^4\na + 1 = 4\n∴ a = 3',
    choices: ['1', '2', '3', '4', '5'], answer: 3,
  },
  {
    area: '지수와 로그', combo: '단독', formulaArea: '로그함수',
    problem: 'log2(x) + log2(x - 6) = 4 를 만족시키는 실수 x의 값을 구하시오.',
    formula: '로그법칙(loga M + loga N = loga MN), 진수조건 x>0, x-6>0',
    unknownCount: 1, conditionBranch: 1, degreeCount: 2,
    intent: '로그의 합을 하나의 로그로 정리하고 진수조건을 함께 고려해 방정식을 푸는 능력 평가',
    trendArea: '로그방정식 영역은 최근 5개년 중 4회 출제됨',
    trendCombo: '이차방정식과의 결합 가능성 있음',
    solution: 'log2[x(x-6)] = 4\nx(x-6) = 16\nx^2 - 6x - 16 = 0\n(x-8)(x+2)=0\nx=8 또는 x=-2\n진수조건(x>6)에 의해 ∴ x = 8',
    choices: ['4', '6', '7', '8', '10'], answer: 4,
  },
  {
    area: '수열', combo: '단독', formulaArea: '등차수열',
    problem: '등차수열 {a_n}에서 a_3 = 11, a_7 = 23일 때, 첫째항과 공차를 구하시오.',
    formula: '등차수열의 일반항 a_n = a_1 + (n-1)d',
    unknownCount: 2, conditionBranch: 0, degreeCount: 1,
    intent: '두 항의 값으로 연립방정식을 세워 등차수열의 첫째항과 공차를 구할 수 있는지 평가',
    trendArea: '등차수열 영역은 최근 5개년 중 5회 출제됨',
    trendCombo: '등차수열의 합 공식과의 결합 가능성 있음',
    solution: 'a_1 + 2d = 11\na_1 + 6d = 23\n두 식을 빼면 4d = 12, d = 3\na_1 = 11 - 6 = 5',
    choices: ['a1=3, d=2', 'a1=5, d=3', 'a1=5, d=4', 'a1=4, d=3', 'a1=6, d=3'], answer: 2,
  },
  {
    area: '수열', combo: '결합', formulaArea: '등비수열',
    problem: '등비수열 {a_n}에서 a_1 = 3, a_4 = 24일 때, 첫째항부터 제5항까지의 합을 구하시오.',
    formula: '등비수열 일반항 a_n = a_1 r^(n-1), 등비수열의 합 S_n = a_1(r^n - 1)/(r-1)',
    unknownCount: 1, conditionBranch: 0, degreeCount: 3,
    intent: '주어진 두 항으로 공비를 구하고 등비수열의 합 공식을 적용할 수 있는지 평가',
    trendArea: '등비수열 영역은 최근 5개년 중 2회 출제됨',
    trendCombo: '지수함수와의 결합 가능성 있음',
    solution: 'a_4 = a_1 r^3 = 3r^3 = 24 → r^3=8 → r=2\nS_5 = 3(2^5-1)/(2-1) = 3(31) = 93',
    choices: ['90', '91', '93', '96', '99'], answer: 3,
  },
  {
    area: '방정식과 부등식', combo: '단독', formulaArea: '이차방정식',
    problem: '이차방정식 x^2 - 5x + k = 0 의 두 근의 비가 2:3일 때, 상수 k의 값을 구하시오.',
    formula: '근과 계수의 관계(두 근의 합과 곱)',
    unknownCount: 1, conditionBranch: 0, degreeCount: 2,
    intent: '두 근의 비 조건과 근과 계수의 관계를 함께 활용해 미지수를 구하는 능력 평가',
    trendArea: '근과 계수의 관계 영역은 최근 5개년 중 3회 출제됨',
    trendCombo: '판별식 조건과의 결합 가능성 있음',
    solution: '두 근을 2t, 3t라 하면 합 5t=5 → t=1, 두 근은 2, 3\n곱 k = 2×3 = 6',
    choices: ['4', '5', '6', '7', '8'], answer: 3,
  },
  {
    area: '함수', combo: '결합', formulaArea: '합성함수',
    problem: 'f(x) = 2x + 1, g(x) = x^2 - 3 일 때, (g∘f)(1)의 값을 구하시오.',
    formula: '합성함수 (g∘f)(x) = g(f(x))',
    unknownCount: 0, conditionBranch: 0, degreeCount: 2,
    intent: '두 함수의 합성을 정확한 순서로 계산할 수 있는지 평가',
    trendArea: '합성함수 영역은 최근 5개년 중 2회 출제됨',
    trendCombo: '역함수와의 결합 가능성 있음',
    solution: 'f(1) = 2(1)+1 = 3\ng(f(1)) = g(3) = 3^2 - 3 = 6',
    choices: ['4', '5', '6', '7', '8'], answer: 3,
  },
  {
    area: '지수와 로그', combo: '단독', formulaArea: '지수함수',
    problem: '어떤 물질의 양이 매년 20%씩 증가한다. 처음 양이 1000일 때,\nn년 후의 양을 나타내는 식을 세우고 3년 후의 양을 구하시오.',
    formula: '지수적 증가 모형 A(n) = A_0 (1+r)^n',
    unknownCount: 1, conditionBranch: 0, degreeCount: 1,
    intent: '실생활 증가 현상을 지수함수 식으로 모델링하고 값을 계산할 수 있는지 평가',
    trendArea: '지수함수 활용(응용) 문제는 최근 5개년 중 2회 출제됨',
    trendCombo: '단독 출제 경향이 강함',
    solution: 'A(n) = 1000 × 1.2^n\nA(3) = 1000 × 1.2^3 = 1000 × 1.728 = 1728',
    choices: ['1200', '1440', '1728', '2000', '2160'], answer: 3,
  },
  {
    area: '도형의 방정식', combo: '단독', formulaArea: '직선의 방정식',
    problem: '두 점 A(1, 2), B(5, 10)을 지나는 직선의 방정식을 구하시오.',
    formula: '두 점을 지나는 직선의 기울기 공식 및 직선의 방정식',
    unknownCount: 2, conditionBranch: 0, degreeCount: 1,
    intent: '두 점의 좌표로 기울기를 구하고 직선의 방정식을 세울 수 있는지 평가',
    trendArea: '직선의 방정식 영역은 최근 5개년 중 2회 출제됨',
    trendCombo: '원의 방정식과의 결합 가능성 있음',
    solution: '기울기 m = (10-2)/(5-1) = 2\ny - 2 = 2(x-1)\n∴ y = 2x',
    choices: ['y=x+1', 'y=2x', 'y=2x+1', 'y=x+2', 'y=3x'], answer: 2,
  },
  {
    area: '지수와 로그', combo: '단독', formulaArea: '로그함수',
    problem: 'log3(x-1) < 2 를 만족시키는 자연수 x의 개수를 구하시오.',
    formula: '로그부등식(밑 3>1이므로 부등호 방향 유지), 진수조건 x-1>0',
    unknownCount: 1, conditionBranch: 1, degreeCount: 1,
    intent: '로그부등식을 진수조건과 함께 풀어 정수해의 개수를 구할 수 있는지 평가',
    trendArea: '로그부등식 영역은 최근 5개년 중 3회 출제됨',
    trendCombo: '경우의 수와의 결합 가능성 있음',
    solution: 'x-1 > 0 이고 x-1 < 9 → 1 < x < 10\n자연수 x는 2,3,...,9 → 8개',
    choices: ['6', '7', '8', '9', '10'], answer: 3,
  },
  {
    area: '수열', combo: '단독', formulaArea: '수열의 합',
    problem: '수열의 합 S_n = n^2 + 2n 으로 주어질 때, 일반항 a_n을 구하시오. (단, n≥2)',
    formula: 'a_n = S_n - S_(n-1)',
    unknownCount: 0, conditionBranch: 1, degreeCount: 2,
    intent: '합의 식으로부터 일반항을 유도하는 과정을 이해하는지 평가',
    trendArea: '수열의 합과 일반항 관계는 최근 5개년 중 4회 출제됨',
    trendCombo: '등차수열 판정과의 결합 가능성 있음',
    solution: 'a_n = S_n - S_(n-1) = (n^2+2n) - ((n-1)^2+2(n-1))\n= n^2+2n - (n^2-2n+1+2n-2) = 2n+1',
    choices: ['2n-1', '2n+1', '2n', 'n+1', '3n'], answer: 2,
  },
  {
    area: '방정식과 부등식', combo: '결합', formulaArea: '연립방정식',
    problem: '두 수의 합이 15, 두 수의 곱이 44일 때, 두 수를 구하시오.',
    formula: '합과 곱이 주어진 두 수는 이차방정식 x^2-(합)x+(곱)=0의 두 근',
    unknownCount: 2, conditionBranch: 0, degreeCount: 2,
    intent: '합과 곱 조건을 이차방정식으로 바꾸어 해를 구할 수 있는지 평가',
    trendArea: '합과 곱 조건 문제는 최근 5개년 중 2회 출제됨',
    trendCombo: '근과 계수의 관계와의 결합 가능성 있음',
    solution: 'x^2 - 15x + 44 = 0\n(x-4)(x-11) = 0\n∴ 두 수는 4와 11',
    choices: ['3, 12', '4, 11', '5, 10', '2, 13', '6, 9'], answer: 2,
  },
  {
    area: '지수와 로그', combo: '결합', formulaArea: '지수함수와 로그함수',
    problem: '3^x = 5^y = 15^2 일 때, 1/x + 1/y 의 값을 구하시오.',
    formula: '로그 변환(3^x=15^2 ⇒ x=2log3(15)) 및 로그의 밑변환공식',
    unknownCount: 2, conditionBranch: 0, degreeCount: 2,
    intent: '지수식을 로그로 변환하고 로그의 성질을 이용해 식의 값을 구할 수 있는지 평가',
    trendArea: '지수·로그 결합 문제는 최근 5개년 중 3회 출제됨',
    trendCombo: '로그의 밑변환공식과의 결합 가능성 높음',
    solution: 'x = log3(15^2) = 2log3 15, y = log5(15^2) = 2log5 15\n1/x+1/y = 1/(2log3 15) + 1/(2log5 15)\n= (log15 3 + log15 5)/2 = log15 15 /2 = 1/2',
    choices: ['1/4', '1/3', '1/2', '2/3', '1'], answer: 3,
  },
]

/** 이전 생성과 같은 조합이 다시 나오지 않도록 마지막 조합을 기억해둔다(모듈 레벨 세션 상태) */
let lastSignature: string | null = null

function pickIndices(n: number): number[] {
  const poolIndices = PROBLEM_POOL.map((_, i) => i)
  for (let attempt = 0; attempt < 10; attempt++) {
    let chosen: number[]
    if (poolIndices.length >= n) {
      chosen = [...poolIndices].sort(() => Math.random() - 0.5).slice(0, n)
    } else {
      // 풀이 n개보다 적으면 중복을 허용해서 채운다
      chosen = Array.from({ length: n }, () => poolIndices[Math.floor(Math.random() * poolIndices.length)])
    }
    const signature = chosen.join(',')
    if (signature !== lastSignature) {
      lastSignature = signature
      return chosen
    }
  }
  return Array.from({ length: n }, (_, i) => i % poolIndices.length)
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

function buildGeneratedProblem(index: number, poolIdx: number, difficulty: number): GeneratedProblem {
  const base = PROBLEM_POOL[poolIdx]
  return {
    ...base,
    id: `gen_math_${Date.now()}_${index}`,
    index,
    difficulty,
    opIndex: randInt(3, 8),
    similarity: randInt(65, 92),
    predictProb: randInt(60, 90),
  }
}

/**
 * TODO: 실제 AI 문제 생성 함수로 교체 예정. 지금은 5초 대기 후 문제 풀에서
 * 서로 다른 문항을 무작위로 뽑아 반환한다(참고 프로그램 PickAI X와 동일 로직).
 */
export async function generateMathProblems(req: ProblemGenerationRequest): Promise<GeneratedProblem[]> {
  await delay(5000)
  const indices = pickIndices(req.count)
  return indices.map((poolIdx, i) => buildGeneratedProblem(i + 1, poolIdx, req.difficulty))
}

/** "검산하여 풀이할까요?" 예 클릭 시점에 새로 계산되는 기출 유사도(섹션 3, 1.6과는 별개 값) */
export function computeSolutionSimilarity(): number {
  return randInt(60, 95)
}
