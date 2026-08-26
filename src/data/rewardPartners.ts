import { RewardPartner, PartnerRewardProduct } from '../types'

// 실제 제휴 없는 Investor Demo용 Generic 데이터. 향후 제휴가 체결되면
// 이 배열(및 partner.logoUrl)만 교체하면 된다 — 카카오페이 데이터와 완전히 별개.

export const GAME_PARTNERS: RewardPartner[] = [
  { id: 'partner_game_moba', name: 'MOBA GAME', category: 'GAME', status: 'DEMO' },
  { id: 'partner_game_fps', name: 'FPS GAME', category: 'GAME', status: 'DEMO' },
]

export const GAME_PRODUCTS: PartnerRewardProduct[] = [
  {
    id: 'product_game_moba',
    partnerId: 'partner_game_moba',
    title: 'MOBA GAME 게임 재화',
    description: '게임머니 5,000원 상당',
    tokenPrice: 50,
    valueKrw: 5000,
    rewardType: 'GAME_CURRENCY',
    active: true,
  },
  {
    id: 'product_game_fps',
    partnerId: 'partner_game_fps',
    title: 'FPS GAME 게임 재화',
    description: '게임머니 3,000원 상당',
    tokenPrice: 30,
    valueKrw: 3000,
    rewardType: 'GAME_CURRENCY',
    active: true,
  },
]

export const WEBTOON_PARTNERS: RewardPartner[] = [{ id: 'partner_webtoon_reward', name: 'WEBTOON REWARD', category: 'WEBTOON', status: 'DEMO' }]

export const WEBTOON_PRODUCTS: PartnerRewardProduct[] = [
  {
    id: 'product_webtoon_10',
    partnerId: 'partner_webtoon_reward',
    title: '쿠키형 웹툰 재화',
    description: '₩1,000 상당 웹툰 재화',
    tokenPrice: 10,
    valueKrw: 1000,
    rewardType: 'WEBTOON_CURRENCY',
    active: true,
  },
  {
    id: 'product_webtoon_30',
    partnerId: 'partner_webtoon_reward',
    title: '쿠키형 웹툰 재화',
    description: '₩3,000 상당 웹툰 재화',
    tokenPrice: 30,
    valueKrw: 3000,
    rewardType: 'WEBTOON_CURRENCY',
    active: true,
  },
  {
    id: 'product_webtoon_50',
    partnerId: 'partner_webtoon_reward',
    title: '쿠키형 웹툰 재화',
    description: '₩5,000 상당 웹툰 재화',
    tokenPrice: 50,
    valueKrw: 5000,
    rewardType: 'WEBTOON_CURRENCY',
    active: true,
  },
]
