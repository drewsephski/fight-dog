import { NextResponse } from 'next/server'
import { oddsApi } from '@/lib/api/odds-api'

export async function POST() {
  try {
    const result = await oddsApi.syncOddsToDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Allow GET for easy testing
  try {
    const result = await oddsApi.syncOddsToDatabase()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
