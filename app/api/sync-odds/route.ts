import { syncOddsData } from '@/lib/actions/odds-actions'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const result = await syncOddsData()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync odds' },
      { status: 500 }
    )
  }
}
