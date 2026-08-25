export interface AdCreative {
  id: string
  headline: string
  sponsor: string
}

export interface AdProvider {
  getBanner(slot: string): AdCreative | null
}

// 향후 Google AdMob 등 실제 광고 SDK로 교체할 때 이 클래스만 바꾸면 된다.
// 지금은 API 키/SDK를 설치하지 않고 항상 같은 Mock 배너를 반환한다.
export class MockAdProvider implements AdProvider {
  getBanner(_slot: string): AdCreative {
    return { id: 'mock-ad', headline: '투자자 Demo 광고 영역', sponsor: 'Sponsored' }
  }
}

export const adProvider: AdProvider = new MockAdProvider()
