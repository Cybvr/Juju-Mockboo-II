
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore'

// Subscription tiers with credits
const SUBSCRIPTION_TIERS = {
  free: { credits: 25 },
  basic: { credits: 100 },
  premium: { credits: 250 }
} as const

type SubscriptionType = keyof typeof SUBSCRIPTION_TIERS

export class CreditService {
  static async checkMonthlyReset(userId: string): Promise<void> {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const user = userDoc.data()

    if (!user) return

    const now = new Date()
    const lastReset = user.monthlyReset?.toDate() || new Date()
    const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                      (now.getMonth() - lastReset.getMonth())

    if (monthsDiff >= 1) {
      const subscriptionType = user.subscriptionType || 'free'
      const tier = SUBSCRIPTION_TIERS[subscriptionType as SubscriptionType]
      const resetCredits = tier?.credits || 25

      await updateDoc(doc(db, 'users', userId), {
        credits: resetCredits,
        monthlyReset: now
      })

      await addDoc(collection(db, 'creditTransactions'), {
        userId,
        amount: resetCredits,
        type: 'monthly_reset',
        description: `Monthly reset - ${subscriptionType} plan (${resetCredits} credits)`,
        createdAt: now
      })
    }
  }

  static async getUserCredits(userId: string): Promise<{
    credits: number;
    subscriptionType: string;
    tier: typeof SUBSCRIPTION_TIERS[SubscriptionType];
  }> {
    await this.checkMonthlyReset(userId)

    const userDoc = await getDoc(doc(db, 'users', userId))
    const user = userDoc.data()

    const subscriptionType = (user?.subscriptionType as SubscriptionType) || 'free'
    const tier = SUBSCRIPTION_TIERS[subscriptionType]

    // Auto-initialize credits for new users
    if (!user || user.credits === undefined || user.credits === null) {
      const initialCredits = tier.credits
      await updateDoc(doc(db, 'users', userId), {
        credits: initialCredits,
        subscriptionType: subscriptionType,
        monthlyReset: new Date(),
        updatedAt: new Date()
      })

      // Log the initialization
      await addDoc(collection(db, 'creditTransactions'), {
        userId,
        amount: initialCredits,
        type: 'monthly_reset',
        description: `Initial credits - ${subscriptionType} plan (${initialCredits} credits)`,
        createdAt: new Date()
      })

      return {
        credits: initialCredits,
        subscriptionType,
        tier
      }
    }

    return {
      credits: user.credits,
      subscriptionType,
      tier
    }
  }

  

  static async deductCredits(
    userId: string, 
    amount: number, 
    description: string
  ): Promise<{ success: boolean; reason?: string }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      const user = userDoc.data()

      if (!user || user.credits < amount) {
        return { success: false, reason: 'Insufficient credits' }
      }

      await updateDoc(doc(db, 'users', userId), {
        credits: user.credits - amount,
        updatedAt: new Date()
      })

      await addDoc(collection(db, 'creditTransactions'), {
        userId,
        amount: -amount,
        type: 'usage',
        description,
        createdAt: new Date()
      })

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        reason: error instanceof Error ? error.message : 'Transaction failed'
      }
    }
  }

  static async addCredits(
    userId: string, 
    amount: number, 
    type: 'purchase' | 'bonus' | 'monthly_reset',
    description: string
  ): Promise<void> {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const user = userDoc.data()
    const currentCredits = user?.credits || 0

    await updateDoc(doc(db, 'users', userId), {
      credits: currentCredits + amount,
      updatedAt: new Date()
    })

    await addDoc(collection(db, 'creditTransactions'), {
      userId,
      amount,
      type,
      description,
      createdAt: new Date()
    })
  }

  static async upgradeSubscription(userId: string, newTier: SubscriptionType): Promise<void> {
    const tier = SUBSCRIPTION_TIERS[newTier]

    await updateDoc(doc(db, 'users', userId), {
      subscriptionType: newTier,
      credits: tier.credits,
      monthlyReset: new Date(),
      updatedAt: new Date()
    })

    await addDoc(collection(db, 'creditTransactions'), {
      userId,
      amount: tier.credits,
      type: 'purchase',
      description: `Upgraded to ${newTier} plan - ${tier.credits} credits`,
      createdAt: new Date()
    })
  }
}
