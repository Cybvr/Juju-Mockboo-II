
import { NextRequest } from 'next/server'

const SUBSCRIPTION_PLANS = {
  basic: { price: 999, name: 'Basic' },
  premium: { price: 1999, name: 'Premium' },
  pro: { price: 2999, name: 'Pro' }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return Response.json({ error: 'User ID required in headers' }, { status: 401 })
    }

    const { plan } = await req.json()

    if (!SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // TODO: Integrate with Stripe when ready
    return Response.json({ 
      message: 'Payment integration coming soon!',
      plan,
      price: SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS].price
    })
  } catch (error) {
    console.error('Upgrade API error:', error)
    return Response.json({ error: 'Failed to process upgrade' }, { status: 500 })
  }
}
