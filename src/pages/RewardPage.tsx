import { useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Wallet, Gamepad2, BookOpen, Minus, Plus, Check } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAppStore } from '../hooks/useAppStore'
import {
  getWallet,
  getTransactions,
  getMonthlyEarnedKrw,
  getActiveRewardPool,
  redeemTokens,
} from '../services/tokenService'
import { mockRewardProvider } from '../services/payments/MockRewardProvider'
import { tokensToKrw, GAME_REWARD_CATALOG, WEBTOON_REWARD_CATALOG, RewardCatalogItem } from '../config/tokenEconomyConfig'
import { saveUser } from '../services/authService'
import { formatDateFull } from '../utils/formatters'
import { StudentUser, RewardTransactionType } from '../types'

type Sheet = 'none' | 'kakaopay' | 'game' | 'webtoon'

export default function RewardPage() {
  const { user, setUser } = useAppStore()
  const student = user as StudentUser

  const [wallet, setWallet] = useState(() => getWallet(student.id))
  const [sheet, setSheet] = useState<Sheet>('none')
  const [convertAmount, setConvertAmount] = useState(1)
  const [convertState, setConvertState] = useState<'select' | 'loading' | 'done' | 'fail'>('select')
  const [convertedKrw, setConvertedKrw] = useState(0)
  const [catalogState, setCatalogState] = useState<'select' | 'done'>('select')
  const [selectedItem, setSelectedItem] = useState<RewardCatalogItem | null>(null)

  const pool = getActiveRewardPool(student.id)
  const monthlyEarnedKrw = getMonthlyEarnedKrw(student.id)
  const transactions = getTransactions(student.id).slice(0, 15)

  const poolPercent = pool && pool.totalPoolKrw > 0 ? Math.min(100, Math.round((pool.earnedKrw / pool.totalPoolKrw) * 100)) : 0
  const poolExhausted = !!pool && pool.remainingKrw <= 0

  const refreshWallet = () => {
    const updated = getWallet(student.id)
    setWallet(updated)
    const updatedUser: StudentUser = { ...student, tokens: updated.balance }
    setUser(updatedUser)
    saveUser(updatedUser)
    return updated
  }

  const openKakaoPay = () => {
    setConvertAmount(Math.min(1, wallet.balance) || 1)
    setConvertState('select')
    setSheet('kakaopay')
  }

  const handleConfirmConvert = async () => {
    setConvertState('loading')
    const result = await mockRewardProvider.requestPayout(student.id, convertAmount)
    if (!result.success) {
      setConvertState('fail')
      return
    }
    redeemTokens(student.id, convertAmount, 'REDEEM_KAKAOPAY', `KakaoPay 지급 ${convertAmount} TOKEN`)
    refreshWallet()
    setConvertedKrw(tokensToKrw(convertAmount))
    setConvertState('done')
  }

  const openCatalog = (type: 'game' | 'webtoon') => {
    setSelectedItem(null)
    setCatalogState('select')
    setSheet(type)
  }

  const handleRedeemCatalogItem = (item: RewardCatalogItem, type: RewardTransactionType) => {
    if (wallet.balance < item.tokenCost) return
    redeemTokens(student.id, item.tokenCost, type, `${item.label} 교환`)
    refreshWallet()
    setSelectedItem(item)
    setCatalogState('done')
  }

  const closeSheet = () => setSheet('none')

  return (
    <MobileLayout>
      <AppHeader title="리워드" />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-5 mt-2">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-card p-6 text-white">
            <p className="text-sm opacity-80 mb-1">이번 달 내가 얻은 보상</p>
            <p className="text-3xl font-black">₩{monthlyEarnedKrw.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-1">🎁 {wallet.earnedTotal} TOKEN 중 보유 {wallet.balance} TOKEN</p>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">이번 달 Reward Pool</h3>
              <span className="text-sm font-black text-gray-900">₩{(pool?.totalPoolKrw ?? 0).toLocaleString()}</span>
            </div>
            <ProgressBar value={poolPercent} color="bg-amber-400" height="h-2.5" />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>획득 ₩{(pool?.earnedKrw ?? 0).toLocaleString()}</span>
              <span>{poolPercent}%</span>
              <span>남음 ₩{(pool?.remainingKrw ?? 0).toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {!pool
                ? '이번 달 결제 정보가 없어요. 보호자에게 문의해 보세요.'
                : poolExhausted
                ? '이번 달 Reward를 모두 획득했어요! 🎉'
                : `이번 달 아직 ₩${pool.remainingKrw.toLocaleString()}의 Reward를 더 얻을 수 있어요.`}
            </p>
          </div>
        </div>

        <div className="px-5 mt-4">
          <h3 className="font-bold text-gray-900 mb-3 px-1">Reward 사용처</h3>
          <div className="grid grid-cols-3 gap-2">
            <RewardDestButton icon={<Wallet size={20} />} label="KakaoPay" onClick={openKakaoPay} disabled={wallet.balance === 0} />
            <RewardDestButton icon={<Gamepad2 size={20} />} label="게임" onClick={() => openCatalog('game')} disabled={wallet.balance === 0} />
            <RewardDestButton icon={<BookOpen size={20} />} label="웹툰" onClick={() => openCatalog('webtoon')} disabled={wallet.balance === 0} />
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h3 className="font-bold text-gray-900 mb-3">Reward 내역</h3>
            <div className="space-y-2">
              {transactions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">아직 내역이 없어요</p>}
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2">
                  {t.tokenAmount > 0 ? (
                    <ArrowUpCircle size={18} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <ArrowDownCircle size={18} className="text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{t.reason}</p>
                    <p className="text-xs text-gray-400">{formatDateFull(t.createdAt)}</p>
                  </div>
                  <p className={`text-sm font-bold ${t.tokenAmount > 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {t.tokenAmount > 0 ? '+' : ''}{t.tokenAmount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      <BottomSheet open={sheet === 'kakaopay'} onClose={closeSheet} title="몇 Token을 받을까요?">
        {convertState === 'select' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setConvertAmount((a) => Math.max(1, a - 1))}
                disabled={convertAmount <= 1}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30"
              >
                <Minus size={18} />
              </button>
              <span className="text-3xl font-black text-gray-900 w-24 text-center">{convertAmount}</span>
              <button
                onClick={() => setConvertAmount((a) => Math.min(wallet.balance, a + 1))}
                disabled={convertAmount >= wallet.balance}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
            <button onClick={() => setConvertAmount(wallet.balance)} className="w-full text-center text-xs font-bold text-primary-500">
              MAX ({wallet.balance} TOKEN)
            </button>
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">받는 금액</span>
              <span className="text-lg font-black text-gray-900">₩{tokensToKrw(convertAmount).toLocaleString()}</span>
            </div>
            <Button fullWidth onClick={handleConfirmConvert}>
              카카오페이로 받기
            </Button>
          </div>
        )}
        {convertState === 'loading' && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">지급을 처리하고 있어요...</p>
          </div>
        )}
        {convertState === 'done' && (
          <div className="py-6 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-bold text-gray-900 mb-1">카카오페이 지급 완료</p>
            <p className="text-3xl font-black text-gray-900 mt-3">₩{convertedKrw.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-3">남은 Reward Token {wallet.balance} TOKEN</p>
            <Button fullWidth className="mt-6" onClick={closeSheet}>
              확인
            </Button>
          </div>
        )}
        {convertState === 'fail' && (
          <div className="py-6 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-gray-900 mb-1">지급에 실패했어요.</p>
            <p className="text-sm text-gray-500">Token은 차감되지 않았습니다.</p>
            <Button fullWidth className="mt-6" onClick={() => setConvertState('select')}>
              다시 시도
            </Button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === 'game'} onClose={closeSheet} title="게임 재화 교환">
        {catalogState === 'select' ? (
          <CatalogList catalog={GAME_REWARD_CATALOG} balance={wallet.balance} onSelect={(item) => handleRedeemCatalogItem(item, 'REDEEM_GAME')} />
        ) : (
          <CatalogDone item={selectedItem} onClose={closeSheet} />
        )}
      </BottomSheet>

      <BottomSheet open={sheet === 'webtoon'} onClose={closeSheet} title="웹툰 재화 교환">
        {catalogState === 'select' ? (
          <CatalogList catalog={WEBTOON_REWARD_CATALOG} balance={wallet.balance} onSelect={(item) => handleRedeemCatalogItem(item, 'REDEEM_WEBTOON')} />
        ) : (
          <CatalogDone item={selectedItem} onClose={closeSheet} />
        )}
      </BottomSheet>
    </MobileLayout>
  )
}

function RewardDestButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 bg-white rounded-card py-4 disabled:opacity-40"
    >
      <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">{icon}</span>
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </button>
  )
}

function CatalogList({
  catalog,
  balance,
  onSelect,
}: {
  catalog: RewardCatalogItem[]
  balance: number
  onSelect: (item: RewardCatalogItem) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-1">보유 {balance} Reward Token</p>
      {catalog.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          disabled={balance < item.tokenCost}
          className="w-full flex items-center gap-3 p-4 rounded-card border-2 border-gray-100 bg-white text-left disabled:opacity-40"
        >
          <span className="text-2xl">{item.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">₩{tokensToKrw(item.tokenCost).toLocaleString()} 상당</p>
          </div>
          <span className="font-black text-amber-500 text-sm">{item.tokenCost} TOKEN</span>
        </button>
      ))}
    </div>
  )
}

function CatalogDone({ item, onClose }: { item: RewardCatalogItem | null; onClose: () => void }) {
  return (
    <div className="py-6 text-center">
      <p className="text-4xl mb-3">
        <Check className="inline text-green-500" size={40} />
      </p>
      <p className="font-bold text-gray-900 mb-1">교환 완료</p>
      {item && <p className="text-sm text-gray-500">{item.label} {item.tokenCost} TOKEN 사용</p>}
      <Button fullWidth className="mt-6" onClick={onClose}>
        확인
      </Button>
    </div>
  )
}
