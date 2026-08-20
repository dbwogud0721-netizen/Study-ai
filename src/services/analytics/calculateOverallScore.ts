import { ExamResult } from '../../types'

export interface OverallScore {
  recentScore: number
  recent5Avg: number
  recent10Avg: number
  bestScore: number
  examCount: number
}

/** history는 최신순(index 0 = 최근) 정렬을 전제한다 */
export function calculateOverallScore(history: ExamResult[]): OverallScore {
  if (history.length === 0) {
    return { recentScore: 0, recent5Avg: 0, recent10Avg: 0, bestScore: 0, examCount: 0 }
  }
  const avg = (n: number) => Math.round(history.slice(0, n).reduce((s, h) => s + h.score, 0) / Math.min(n, history.length))
  return {
    recentScore: history[0].score,
    recent5Avg: avg(5),
    recent10Avg: avg(10),
    bestScore: Math.max(...history.map((h) => h.score)),
    examCount: history.length,
  }
}
