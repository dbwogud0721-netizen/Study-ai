import { ExamHistory } from '../types'

export const MOCK_EXAM_HISTORY: ExamHistory[] = [
  {
    examId: 'exam_001',
    date: '2026-08-20',
    subject: '수학',
    unit: '이차함수',
    score: 85,
    questionCount: 10,
    tokensEarned: 4,
    duration: 680,
  },
  {
    examId: 'exam_002',
    date: '2026-08-19',
    subject: '과학',
    unit: '전기와 자기',
    score: 72,
    questionCount: 20,
    tokensEarned: 2,
    duration: 1240,
  },
  {
    examId: 'exam_003',
    date: '2026-08-17',
    subject: '수학',
    unit: '확률',
    score: 90,
    questionCount: 10,
    tokensEarned: 6,
    duration: 580,
  },
  {
    examId: 'exam_004',
    date: '2026-08-16',
    subject: '국어',
    unit: '문학 감상',
    score: 65,
    questionCount: 20,
    tokensEarned: 1,
    duration: 1560,
  },
  {
    examId: 'exam_005',
    date: '2026-08-15',
    subject: '영어',
    unit: '독해 전략',
    score: 80,
    questionCount: 10,
    tokensEarned: 4,
    duration: 720,
  },
  {
    examId: 'exam_006',
    date: '2026-08-14',
    subject: '수학',
    unit: '이차방정식',
    score: 95,
    questionCount: 30,
    tokensEarned: 6,
    duration: 1800,
  },
  {
    examId: 'exam_007',
    date: '2026-08-13',
    subject: '과학',
    unit: '태양계',
    score: 78,
    questionCount: 10,
    tokensEarned: 2,
    duration: 640,
  },
]

export const MOCK_SUBJECT_STATS = [
  { subject: '수학', accuracy: 82, count: 68 },
  { subject: '과학', accuracy: 75, count: 40 },
  { subject: '영어', accuracy: 80, count: 30 },
  { subject: '국어', accuracy: 65, count: 20 },
  { subject: '사회', accuracy: 70, count: 15 },
]

export const MOCK_CONCEPT_STRENGTHS = [
  { concept: '이차함수', accuracy: 90, status: 'strong' },
  { concept: '이차방정식', accuracy: 88, status: 'strong' },
  { concept: '삼각비', accuracy: 85, status: 'strong' },
  { concept: '문학', accuracy: 82, status: 'strong' },
  { concept: '확률', accuracy: 55, status: 'weak' },
  { concept: '경우의 수', accuracy: 52, status: 'weak' },
  { concept: '독해', accuracy: 60, status: 'weak' },
]

export const MOCK_TOKEN_HISTORY = [
  { date: '2026-08-20', earned: 4, spent: 2, balance: 12 },
  { date: '2026-08-19', earned: 2, spent: 3, balance: 10 },
  { date: '2026-08-17', earned: 6, spent: 2, balance: 11 },
  { date: '2026-08-16', earned: 1, spent: 5, balance: 7 },
  { date: '2026-08-15', earned: 4, spent: 2, balance: 11 },
  { date: '2026-08-14', earned: 6, spent: 5, balance: 9 },
  { date: '2026-08-13', earned: 2, spent: 2, balance: 8 },
]
