import { useState } from 'react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { PartnerRewardCard } from '../components/features/PartnerRewardCard'
import { PartnerRedeemSheet } from '../components/features/PartnerRedeemSheet'
import { useAppStore } from '../hooks/useAppStore'
import { getWallet } from '../services/tokenService'
import { mockWebtoonRewardProvider } from '../services/rewardPartners/MockWebtoonRewardProvider'
import { WEBTOON_PARTNERS } from '../data/rewardPartners'
import { saveUser } from '../services/authService'
import { StudentUser, PartnerRewardProduct, TokenWallet } from '../types'

export default function WebtoonRewardPage() {
  const { user, setUser } = useAppStore()
  const student = user as StudentUser

  const [wallet, setWallet] = useState(() => getWallet(student.id))
  const [selectedProduct, setSelectedProduct] = useState<PartnerRewardProduct | null>(null)

  const products = mockWebtoonRewardProvider.getProducts()

  const handleRedeemed = (updated: TokenWallet) => {
    setWallet(updated)
    const updatedUser: StudentUser = { ...student, tokens: updated.balance }
    setUser(updatedUser)
    saveUser(updatedUser)
  }

  return (
    <MobileLayout>
      <AppHeader title="웹툰 리워드" />

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-5 mt-2">
          <div className="bg-gradient-to-br from-amber-400 to-pink-400 rounded-card p-5 text-white">
            <p className="text-sm opacity-80 mb-1">내 Reward</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{wallet.balance}</span>
              <span className="text-lg mb-0.5">TOKEN</span>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4 space-y-3">
          {products.map((product) => {
            const partner = WEBTOON_PARTNERS.find((p) => p.id === product.partnerId)
            if (!partner) return null
            return <PartnerRewardCard key={product.id} partner={partner} product={product} onRedeem={() => setSelectedProduct(product)} />
          })}
        </div>
      </div>

      <PartnerRedeemSheet
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        userId={student.id}
        product={selectedProduct}
        walletBalance={wallet.balance}
        provider={mockWebtoonRewardProvider}
        onRedeemed={handleRedeemed}
      />
    </MobileLayout>
  )
}
