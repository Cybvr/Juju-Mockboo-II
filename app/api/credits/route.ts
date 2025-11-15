
import { NextRequest } from 'next/server'
import { CreditService } from '@/lib/credits'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, extract user ID from token or use a different auth method
    // This is a simplified version - you may need to implement proper token verification
    const userId = token // Placeholder - implement proper user ID extraction
    
    const creditInfo = await CreditService.getUserCredits(userId)
    return Response.json(creditInfo)
  } catch (error) {
    console.error('Credits API error:', error)
    return Response.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
