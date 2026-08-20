import { Question } from '../types'

const now = () => new Date().toISOString()

export const MOCK_QUESTIONS: Question[] = [
  // ── 중학교 수학 (3학년) ──────────────────────────
  {
    questionId: 'q001', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '이차함수', difficulty: 'medium',
    question: 'y = x² - 4x + 3 의 꼭짓점의 좌표는?',
    choices: ['(2, -1)', '(-2, 1)', '(2, 1)', '(-2, -1)'], correctAnswer: 0,
    explanation: 'y = x² - 4x + 3 = (x-2)² - 1 로 변환하면 꼭짓점은 (2, -1)입니다.',
    concept: '이차함수의 꼭짓점', estimatedDifficulty: 0.55, sourceType: 'ai_generated', createdAt: now(), tags: ['이차함수', '꼭짓점'],
  },
  {
    questionId: 'q002', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '이차함수', difficulty: 'easy',
    question: 'y = 2(x-1)² + 3 의 축의 방정식은?',
    choices: ['x = 1', 'x = -1', 'x = 3', 'x = 2'], correctAnswer: 0,
    explanation: 'y = a(x-p)² + q 에서 축의 방정식은 x = p 이므로 x = 1 입니다.',
    concept: '이차함수의 축', estimatedDifficulty: 0.3, sourceType: 'ai_generated', createdAt: now(), tags: ['이차함수', '축'],
  },
  {
    questionId: 'q003', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '이차함수', difficulty: 'hard',
    question: '이차함수 y = ax² + bx + c 의 그래프가 x축과 두 점에서 만나고 꼭짓점이 x축 아래에 있을 때, a의 부호는?',
    choices: ['a > 0', 'a < 0', 'a = 0', '알 수 없다'], correctAnswer: 0,
    explanation: '꼭짓점이 x축 아래에 있고 x축과 두 점에서 만나려면 아래로 볼록해야 하므로 a > 0 입니다.',
    concept: '이차함수의 그래프 특성', estimatedDifficulty: 0.75, sourceType: 'ai_generated', createdAt: now(), tags: ['이차함수', '그래프'],
  },
  {
    questionId: 'q004', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '이차방정식', difficulty: 'medium',
    question: 'x² - 5x + 6 = 0 의 두 근의 합은?',
    choices: ['5', '-5', '6', '-6'], correctAnswer: 0,
    explanation: '(x-2)(x-3) = 0 → x = 2, 3. 두 근의 합 = 5.',
    concept: '근과 계수의 관계', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['이차방정식', '근'],
  },
  {
    questionId: 'q005', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '삼각비', difficulty: 'medium',
    question: '직각삼각형에서 sin30° × cos60° 의 값은?',
    choices: ['1/4', '1/2', '√3/4', '√3/2'], correctAnswer: 0,
    explanation: 'sin30° = 1/2, cos60° = 1/2. 곱은 1/4.',
    concept: '삼각비 값', estimatedDifficulty: 0.5, sourceType: 'ai_generated', createdAt: now(), tags: ['삼각비', '특수각'],
  },
  {
    questionId: 'q006', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '통계 (대푯값과 산포도)', difficulty: 'medium',
    question: '자료 2, 4, 4, 6, 9 의 중앙값은?',
    choices: ['4', '5', '6', '4.5'], correctAnswer: 0,
    explanation: '크기순 정렬 시 2,4,4,6,9 에서 가운데 값은 4 입니다.',
    concept: '대푯값', estimatedDifficulty: 0.35, sourceType: 'ai_generated', createdAt: now(), tags: ['통계', '중앙값'],
  },
  {
    questionId: 'q007', schoolLevel: 'middle', grade: 3, subject: '수학', unit: '원의 성질', difficulty: 'hard',
    question: '반지름 6인 원에서 중심으로부터 거리가 3√3인 현의 길이는?',
    choices: ['6', '3√3', '9', '12'], correctAnswer: 0,
    explanation: '현의 절반 길이 = √(6² - (3√3)²) = √(36-27) = 3, 현 전체 길이 = 6.',
    concept: '현의 길이', estimatedDifficulty: 0.7, sourceType: 'ai_generated', createdAt: now(), tags: ['원', '현'],
  },
  {
    questionId: 'q008', schoolLevel: 'middle', grade: 3, subject: '과학', unit: '화학 반응의 규칙', difficulty: 'medium',
    question: '탄산수소나트륨을 가열하면 발생하는 기체는?',
    choices: ['이산화탄소', '산소', '수소', '질소'], correctAnswer: 0,
    explanation: '탄산수소나트륨(중조)을 가열하면 탄산나트륨, 물, 이산화탄소로 분해됩니다.',
    concept: '열분해 반응', estimatedDifficulty: 0.45, sourceType: 'ai_generated', createdAt: now(), tags: ['화학반응', '열분해'],
  },
  {
    questionId: 'q009', schoolLevel: 'middle', grade: 3, subject: '과학', unit: '기권과 날씨', difficulty: 'easy',
    question: '고기압권에서 나타나는 날씨의 특징으로 옳은 것은?',
    choices: ['하강 기류로 맑은 날씨', '상승 기류로 흐린 날씨', '기압이 낮아 비가 옴', '바람이 시계 반대 방향으로 붊'], correctAnswer: 0,
    explanation: '고기압에서는 공기가 하강하며 단열 압축되어 구름이 소멸, 맑은 날씨가 나타납니다.',
    concept: '기압과 날씨', estimatedDifficulty: 0.3, sourceType: 'ai_generated', createdAt: now(), tags: ['기압', '날씨'],
  },
  {
    questionId: 'q010', schoolLevel: 'middle', grade: 3, subject: '과학', unit: '자극과 반응', difficulty: 'medium',
    question: '뜨거운 것에 손이 닿았을 때 무의식적으로 손을 떼는 반응의 경로는?',
    choices: ['자극 → 감각뉴런 → 척수 → 운동뉴런 → 반응', '자극 → 대뇌 → 척수 → 반응', '자극 → 소뇌 → 운동뉴런 → 반응', '자극 → 척수 → 대뇌 → 반응'], correctAnswer: 0,
    explanation: '위험을 피하는 무조건 반사는 대뇌를 거치지 않고 척수가 중추가 되어 빠르게 일어납니다.',
    concept: '무조건 반사', estimatedDifficulty: 0.5, sourceType: 'ai_generated', createdAt: now(), tags: ['신경계', '반사'],
  },

  // ── 중학교 국어 (3학년) ──────────────────────────
  {
    questionId: 'q011', schoolLevel: 'middle', grade: 3, subject: '국어', unit: '문학과 사회', difficulty: 'medium',
    question: '문학 작품이 창작 당시의 사회·역사적 배경을 반영한다고 보는 감상 방법을 무엇이라 하는가?',
    choices: ['반영론적 관점', '표현론적 관점', '효용론적 관점', '절대론적 관점'], correctAnswer: 0,
    explanation: '작품과 현실 세계의 관계에 주목하는 감상 방법을 반영론적 관점이라 합니다.',
    concept: '문학 감상 관점', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['문학', '감상관점'],
  },
  {
    questionId: 'q012', schoolLevel: 'middle', grade: 3, subject: '국어', unit: '언어와 매체의 이해', difficulty: 'easy',
    question: '다음 중 국어의 특성으로 옳은 것은?',
    choices: ['자의성: 말소리와 의미의 결합에 필연적 관계가 없다', '역사성: 언어는 절대 변하지 않는다', '사회성: 개인이 마음대로 바꿀 수 있다', '창조성: 정해진 문장만 사용할 수 있다'], correctAnswer: 0,
    explanation: '언어의 자의성은 말소리와 의미 사이에 필연적 관계가 없다는 특성입니다.',
    concept: '언어의 본질', estimatedDifficulty: 0.3, sourceType: 'ai_generated', createdAt: now(), tags: ['언어', '자의성'],
  },
  {
    questionId: 'q013', schoolLevel: 'middle', grade: 3, subject: '국어', unit: '화법과 작문의 원리', difficulty: 'medium',
    question: '설득하는 글을 쓸 때 주장의 타당성을 높이기 위해 가장 필요한 것은?',
    choices: ['신뢰할 수 있는 근거 제시', '감정적인 표현 반복', '주장만 여러 번 강조', '상대방 의견 무시'], correctAnswer: 0,
    explanation: '설득력 있는 글은 타당하고 신뢰할 수 있는 근거를 바탕으로 주장을 뒷받침해야 합니다.',
    concept: '논증의 타당성', estimatedDifficulty: 0.35, sourceType: 'ai_generated', createdAt: now(), tags: ['작문', '논증'],
  },

  // ── 중학교 영어 (3학년) ──────────────────────────
  {
    questionId: 'q014', schoolLevel: 'middle', grade: 3, subject: '영어', unit: '문법 심화 (관계부사·분사구문)', difficulty: 'medium',
    question: 'Choose the correct sentence.',
    choices: ['This is the house where I was born.', 'This is the house which I was born.', 'This is the house who I was born.', 'This is the house what I was born.'], correctAnswer: 0,
    explanation: '장소를 나타내는 선행사 뒤에는 관계부사 where를 사용합니다.',
    concept: '관계부사', estimatedDifficulty: 0.5, sourceType: 'ai_generated', createdAt: now(), tags: ['문법', '관계부사'],
  },
  {
    questionId: 'q015', schoolLevel: 'middle', grade: 3, subject: '영어', unit: '독해와 어휘 심화', difficulty: 'easy',
    question: 'Which word best fits the blank? "She was so ___ that she finished the marathon."',
    choices: ['determined', 'determine', 'determination', 'determining'], correctAnswer: 0,
    explanation: 'be동사 뒤 보어 자리이므로 형용사 determined가 적절합니다.',
    concept: '어휘와 품사', estimatedDifficulty: 0.3, sourceType: 'ai_generated', createdAt: now(), tags: ['어휘', '품사'],
  },
  {
    questionId: 'q016', schoolLevel: 'middle', grade: 3, subject: '영어', unit: '작문 심화', difficulty: 'hard',
    question: '다음 우리말을 영어로 가장 바르게 옮긴 것은? "나는 그가 정직하다고 믿는다."',
    choices: ['I believe that he is honest.', 'I believe he honest.', 'I believe that he honest is.', 'I believe him honest that.'], correctAnswer: 0,
    explanation: '접속사 that 뒤에는 완전한 절(주어+동사)이 와야 하므로 he is honest가 맞습니다.',
    concept: '명사절 작문', estimatedDifficulty: 0.55, sourceType: 'ai_generated', createdAt: now(), tags: ['작문', '명사절'],
  },

  // ── 중학교 사회 (3학년) ──────────────────────────
  {
    questionId: 'q017', schoolLevel: 'middle', grade: 3, subject: '사회', unit: '정치생활과 민주주의', difficulty: 'medium',
    question: '국가 권력을 입법부, 행정부, 사법부로 나누어 서로 견제하게 하는 원리는?',
    choices: ['권력 분립', '지방 자치', '대의 민주주의', '법치주의'], correctAnswer: 0,
    explanation: '권력 분립은 권력 남용을 막기 위해 국가 권력을 나누어 상호 견제하도록 하는 원리입니다.',
    concept: '권력 분립', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['정치', '권력분립'],
  },
  {
    questionId: 'q018', schoolLevel: 'middle', grade: 3, subject: '사회', unit: '문화와 사회', difficulty: 'easy',
    question: '서로 다른 문화를 그 사회의 맥락에서 이해하려는 태도는?',
    choices: ['문화 상대주의', '자문화 중심주의', '문화 사대주의', '문화 절대주의'], correctAnswer: 0,
    explanation: '문화 상대주의는 각 문화를 그 사회의 맥락과 배경 속에서 이해하려는 태도입니다.',
    concept: '문화 이해 태도', estimatedDifficulty: 0.3, sourceType: 'ai_generated', createdAt: now(), tags: ['문화', '상대주의'],
  },
  {
    questionId: 'q019', schoolLevel: 'middle', grade: 3, subject: '사회', unit: '사회변동과 사회문제', difficulty: 'medium',
    question: '저출산·고령화가 지속될 때 예상되는 사회 변화로 가장 적절한 것은?',
    choices: ['생산 가능 인구 감소와 노년 부양비 증가', '노동력 공급 과잉', '학령 인구 급증', '주택 수요 급증'], correctAnswer: 0,
    explanation: '저출산·고령화가 심화되면 생산 가능 인구가 줄고 부양해야 할 노년층 비율이 늘어납니다.',
    concept: '인구 변화', estimatedDifficulty: 0.45, sourceType: 'ai_generated', createdAt: now(), tags: ['인구', '고령화'],
  },

  // ── 중학교 역사 (3학년) ──────────────────────────
  {
    questionId: 'q020', schoolLevel: 'middle', grade: 3, subject: '역사', unit: '일제강점기 민족운동', difficulty: 'medium',
    question: '1919년 전국적으로 확산된 비폭력 만세 시위 운동은?',
    choices: ['3·1 운동', '6·10 만세 운동', '광주 학생 항일 운동', '물산 장려 운동'], correctAnswer: 0,
    explanation: '3·1 운동은 1919년 3월 1일 전국으로 확산된 대규모 민족 독립운동입니다.',
    concept: '민족 독립운동', estimatedDifficulty: 0.35, sourceType: 'ai_generated', createdAt: now(), tags: ['역사', '독립운동'],
  },
  {
    questionId: 'q021', schoolLevel: 'middle', grade: 3, subject: '역사', unit: '민주화 운동', difficulty: 'medium',
    question: '1980년 광주에서 신군부의 유혈 진압에 저항하며 일어난 민주화 운동은?',
    choices: ['5·18 민주화 운동', '4·19 혁명', '6월 민주 항쟁', '부마 민주 항쟁'], correctAnswer: 0,
    explanation: '5·18 민주화 운동은 1980년 광주에서 신군부에 저항하며 일어난 사건입니다.',
    concept: '민주화 운동', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['역사', '민주화'],
  },

  // ── 중학교 1·2학년 수학 (curriculum 매칭용) ──────
  {
    questionId: 'q022', schoolLevel: 'middle', grade: 1, subject: '수학', unit: '일차방정식', difficulty: 'easy',
    question: '방정식 2x + 3 = 11 의 해는?',
    choices: ['x = 4', 'x = 3', 'x = 5', 'x = 7'], correctAnswer: 0,
    explanation: '2x = 8 이므로 x = 4 입니다.',
    concept: '일차방정식 풀이', estimatedDifficulty: 0.25, sourceType: 'ai_generated', createdAt: now(), tags: ['방정식'],
  },
  {
    questionId: 'q023', schoolLevel: 'middle', grade: 2, subject: '수학', unit: '일차함수와 그래프', difficulty: 'medium',
    question: '일차함수 y = 2x - 1 의 그래프가 지나는 점은?',
    choices: ['(1, 1)', '(1, -1)', '(0, 1)', '(2, 2)'], correctAnswer: 0,
    explanation: 'x=1을 대입하면 y = 2(1) - 1 = 1 이므로 (1,1)을 지납니다.',
    concept: '일차함수 그래프', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['일차함수'],
  },
  {
    questionId: 'q024', schoolLevel: 'middle', grade: 2, subject: '수학', unit: '확률', difficulty: 'medium',
    question: '주사위를 두 번 던질 때 두 눈의 합이 7이 될 확률은?',
    choices: ['1/6', '5/36', '7/36', '1/12'], correctAnswer: 0,
    explanation: '합이 7인 경우는 6가지이므로 확률 = 6/36 = 1/6 입니다.',
    concept: '수학적 확률', estimatedDifficulty: 0.5, sourceType: 'ai_generated', createdAt: now(), tags: ['확률'],
  },

  // ── 고등학교 공통수학 (1학년) ────────────────────
  {
    questionId: 'q101', schoolLevel: 'high', grade: 1, subject: '공통수학', unit: '다항식', difficulty: 'medium',
    question: '다항식 (x+2)(x-3) 을 전개한 결과는?',
    choices: ['x² - x - 6', 'x² + x - 6', 'x² - x + 6', 'x² + 5x - 6'], correctAnswer: 0,
    explanation: '(x+2)(x-3) = x² -3x +2x -6 = x² - x - 6 입니다.',
    concept: '다항식의 곱셈', estimatedDifficulty: 0.35, sourceType: 'ai_generated', createdAt: now(), tags: ['다항식'],
  },
  {
    questionId: 'q102', schoolLevel: 'high', grade: 1, subject: '공통수학', unit: '방정식과 부등식', difficulty: 'hard',
    question: '이차방정식 x² - 6x + k = 0 이 중근을 가질 때 k의 값은?',
    choices: ['9', '6', '3', '12'], correctAnswer: 0,
    explanation: '판별식 D = 36 - 4k = 0 이어야 하므로 k = 9 입니다.',
    concept: '판별식', estimatedDifficulty: 0.6, sourceType: 'ai_generated', createdAt: now(), tags: ['이차방정식', '판별식'],
  },
  {
    questionId: 'q103', schoolLevel: 'high', grade: 1, subject: '공통수학', unit: '도형의 방정식', difficulty: 'medium',
    question: '두 점 (1,2), (5,6) 사이의 거리는?',
    choices: ['4√2', '8', '6', '4'], correctAnswer: 0,
    explanation: '거리 = √((5-1)²+(6-2)²) = √32 = 4√2 입니다.',
    concept: '두 점 사이의 거리', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['좌표평면'],
  },

  // ── 고등학교 대수 / 미적분Ⅰ / 확률과 통계 (2학년) ──
  {
    questionId: 'q104', schoolLevel: 'high', grade: 2, subject: '대수', unit: '지수함수와 로그함수', difficulty: 'medium',
    question: 'log₂8 의 값은?',
    choices: ['3', '2', '4', '8'], correctAnswer: 0,
    explanation: '2³ = 8 이므로 log₂8 = 3 입니다.',
    concept: '로그의 정의', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['로그'],
  },
  {
    questionId: 'q105', schoolLevel: 'high', grade: 2, subject: '대수', unit: '수열', difficulty: 'hard',
    question: '등차수열의 첫째항이 3, 공차가 4일 때 일반항 aₙ은?',
    choices: ['4n - 1', '4n + 3', '3n + 4', '4n - 3'], correctAnswer: 0,
    explanation: 'aₙ = 3 + (n-1)×4 = 4n - 1 입니다.',
    concept: '등차수열의 일반항', estimatedDifficulty: 0.55, sourceType: 'ai_generated', createdAt: now(), tags: ['수열'],
  },
  {
    questionId: 'q106', schoolLevel: 'high', grade: 2, subject: '미적분Ⅰ', unit: '다항함수의 미분법', difficulty: 'medium',
    question: 'f(x) = x³ - 3x 의 도함수 f\'(x)는?',
    choices: ['3x² - 3', '3x² - 3x', 'x² - 3', '3x - 3'], correctAnswer: 0,
    explanation: 'f\'(x) = 3x² - 3 입니다.',
    concept: '다항함수의 미분', estimatedDifficulty: 0.45, sourceType: 'ai_generated', createdAt: now(), tags: ['미분'],
  },
  {
    questionId: 'q107', schoolLevel: 'high', grade: 2, subject: '미적분Ⅰ', unit: '함수의 극한과 연속', difficulty: 'hard',
    question: 'lim(x→2) (x²-4)/(x-2) 의 값은?',
    choices: ['4', '2', '0', '무한대'], correctAnswer: 0,
    explanation: '(x²-4)/(x-2) = (x+2) 이므로 x→2일 때 극한값은 4 입니다.',
    concept: '함수의 극한', estimatedDifficulty: 0.6, sourceType: 'ai_generated', createdAt: now(), tags: ['극한'],
  },
  {
    questionId: 'q108', schoolLevel: 'high', grade: 2, subject: '확률과 통계', unit: '경우의 수와 순열·조합', difficulty: 'medium',
    question: '서로 다른 5명 중 회장 1명, 부회장 1명을 뽑는 경우의 수는?',
    choices: ['20', '10', '25', '5'], correctAnswer: 0,
    explanation: '순열 5P2 = 5×4 = 20 입니다.',
    concept: '순열', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['순열'],
  },
  {
    questionId: 'q109', schoolLevel: 'high', grade: 2, subject: '확률과 통계', unit: '확률', difficulty: 'hard',
    question: '두 사건 A, B가 서로 독립이고 P(A)=1/3, P(B)=1/4일 때 P(A∩B)는?',
    choices: ['1/12', '1/7', '7/12', '1/2'], correctAnswer: 0,
    explanation: '독립사건이므로 P(A∩B) = P(A)×P(B) = 1/12 입니다.',
    concept: '독립사건의 확률', estimatedDifficulty: 0.55, sourceType: 'ai_generated', createdAt: now(), tags: ['확률', '독립사건'],
  },

  // ── 고등학교 공통국어 / 독서 / 영어Ⅰ ────────────
  {
    questionId: 'q110', schoolLevel: 'high', grade: 1, subject: '공통국어', unit: '독서와 매체', difficulty: 'medium',
    question: '글의 중심 내용을 파악하기 위해 문단별 핵심어를 표시하며 읽는 방법은?',
    choices: ['요약적 읽기', '감상적 읽기', '비판적 읽기', '창의적 읽기'], correctAnswer: 0,
    explanation: '핵심어 중심으로 정보를 압축해 파악하는 읽기 방법을 요약적 읽기라 합니다.',
    concept: '독서 방법', estimatedDifficulty: 0.35, sourceType: 'ai_generated', createdAt: now(), tags: ['독서'],
  },
  {
    questionId: 'q111', schoolLevel: 'high', grade: 2, subject: '독서', unit: '추론적·비판적 읽기', difficulty: 'hard',
    question: '글쓴이가 직접 언급하지 않은 내용을 문맥을 통해 짐작하는 읽기 방식은?',
    choices: ['추론적 읽기', '사실적 읽기', '요약적 읽기', '축자적 읽기'], correctAnswer: 0,
    explanation: '드러나지 않은 정보를 문맥 단서로 짐작하는 읽기를 추론적 읽기라고 합니다.',
    concept: '추론적 읽기', estimatedDifficulty: 0.55, sourceType: 'ai_generated', createdAt: now(), tags: ['독서', '추론'],
  },
  {
    questionId: 'q112', schoolLevel: 'high', grade: 2, subject: '영어Ⅰ', unit: '함축 의미 추론', difficulty: 'hard',
    question: 'Which best describes the underlined phrase\'s implied meaning in context: "She was walking on eggshells around him."',
    choices: ['being very careful not to upset someone', 'walking very slowly', 'cooking breakfast', 'feeling confident'], correctAnswer: 0,
    explanation: '"walk on eggshells"는 상대방을 자극하지 않으려 매우 조심한다는 뜻의 관용 표현입니다.',
    concept: '관용 표현 추론', estimatedDifficulty: 0.6, sourceType: 'ai_generated', createdAt: now(), tags: ['어휘', '관용표현'],
  },

  // ── 고등학교 통합사회 / 통합과학 (1학년) ─────────
  {
    questionId: 'q113', schoolLevel: 'high', grade: 1, subject: '통합사회', unit: '인권 보장과 헌법', difficulty: 'medium',
    question: '국가가 국민의 기본권을 침해했을 때 구제받을 수 있는 헌법상 제도는?',
    choices: ['헌법소원', '국민참여재판', '국정감사', '탄핵소추'], correctAnswer: 0,
    explanation: '헌법소원은 공권력에 의해 기본권을 침해당한 국민이 헌법재판소에 구제를 청구하는 제도입니다.',
    concept: '기본권 구제', estimatedDifficulty: 0.45, sourceType: 'ai_generated', createdAt: now(), tags: ['헌법', '기본권'],
  },
  {
    questionId: 'q114', schoolLevel: 'high', grade: 1, subject: '통합과학', unit: '역학적 시스템', difficulty: 'medium',
    question: '질량 2kg인 물체가 4m/s²로 가속될 때 필요한 힘의 크기는?',
    choices: ['8N', '2N', '4N', '6N'], correctAnswer: 0,
    explanation: 'F = ma = 2 × 4 = 8N 입니다.',
    concept: '뉴턴 운동 제2법칙', estimatedDifficulty: 0.4, sourceType: 'ai_generated', createdAt: now(), tags: ['역학', '힘'],
  },
]

export const getQuestionsByConfig = (
  subject: string,
  unit: string,
  count: number = 10
): Question[] => {
  const filtered = MOCK_QUESTIONS.filter(
    (q) => q.subject === subject && (!unit || q.unit === unit || q.unit.includes(unit.slice(0, 2)))
  )
  const pool = filtered.length >= count ? filtered : MOCK_QUESTIONS.filter((q) => q.subject === subject)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
