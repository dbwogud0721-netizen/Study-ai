export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function formatScore(score: number): string {
  return `${score}점`
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}분 ${s}초`
}

export function gradeLabel(schoolLevel: 'middle' | 'high', grade: number): string {
  const prefix = schoolLevel === 'middle' ? '중' : '고'
  return `${prefix}${grade}`
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-500'
}

export function difficultyLabel(d: string): string {
  const map: Record<string, string> = { easy: '하', medium: '중', hard: '상', mixed: '혼합' }
  return map[d] ?? d
}
