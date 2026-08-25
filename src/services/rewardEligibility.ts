import { ExamConfig, ExamResult, RewardEligibilityResult } from '../types'
import { REWARD_ELIGIBILITY_CONFIG, DIFFICULTY_RANK, getCashRewardForScore } from '../config/cashRewardConfig'

interface EligibilityInput {
  config: ExamConfig
  history: ExamResult[]
  /** 오늘 이미 현금 보상을 받은 횟수 — cashRewardService에서 계산해 넘겨준다(순환 참조 방지). */
  todayCashRewardCount: number
}

/**
 * 시험 시작 전(ExamBuilder)과 시험 채점 직후(ExamResult) 양쪽에서 쓰는 Cash Reward
 * 자격 검사. 점수 자체는 아직 모르는 시점에도 호출되므로 maxCashReward는 "만점 기준
 * 최대 보상액"을 뜻한다 — 실제 지급액은 채점 후 getCashRewardForScore(score)로 별도 계산.
 */
export function checkRewardEligibility({ config, history, todayCashRewardCount }: EligibilityInput): RewardEligibilityResult {
  const rank = DIFFICULTY_RANK[config.difficulty] ?? 1
  const minRank = DIFFICULTY_RANK[REWARD_ELIGIBILITY_CONFIG.minimumDifficulty]

  const today = new Date()
  const windowMs = REWARD_ELIGIBILITY_CONFIG.duplicateExamWindowHours * 60 * 60 * 1000
  const isDuplicate = history.some((r) => {
    const sameShape =
      r.config.subjectName === config.subjectName &&
      r.config.examMode === config.examMode &&
      (r.config.unitName ?? r.config.targetMiddleArea ?? '') === (config.unitName ?? config.targetMiddleArea ?? '')
    if (!sameShape) return false
    return today.getTime() - new Date(r.completedAt).getTime() < windowMs
  })

  const checks = [
    { label: `최소 ${REWARD_ELIGIBILITY_CONFIG.minimumQuestionCount}문제 이상`, passed: config.questionCount >= REWARD_ELIGIBILITY_CONFIG.minimumQuestionCount },
    { label: '난이도 기준 충족', passed: rank >= minRank },
    { label: '오늘 지급 한도 정상', passed: todayCashRewardCount < REWARD_ELIGIBILITY_CONFIG.dailyRewardLimit },
    { label: '중복 응시 아님', passed: !isDuplicate },
  ]

  const eligible = checks.every((c) => c.passed)
  return {
    eligible,
    maxCashReward: eligible ? getCashRewardForScore(100) : 0,
    checks,
  }
}
