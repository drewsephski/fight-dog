#!/usr/bin/env bun

import { getMainCardFights } from '../lib/actions/odds-actions'

async function testLandingPageData() {
  console.log('🥊 Testing Landing Page Data Flow...\n')
  
  try {
    console.log('1. Fetching main card fights...')
    const fights = await getMainCardFights(6)
    
    console.log(`2. Found ${fights.length} fights`)
    
    if (fights.length > 0) {
      console.log('3. First fight details:')
      const firstFight = fights[0]
      console.log(`   - ID: ${firstFight.id}`)
      console.log(`   - Fighter 1: ${firstFight.fighter1?.name || 'MISSING'}`)
      console.log(`   - Fighter 2: ${firstFight.fighter2?.name || 'MISSING'}`)
      console.log(`   - Event: ${firstFight.event?.name || 'MISSING'}`)
      console.log(`   - Main Event: ${firstFight.isMainEvent}`)
      console.log(`   - Title Fight: ${firstFight.isTitleFight}`)
      console.log(`   - Weight Class: ${firstFight.weightClass}`)
      console.log(`   - Odds Count: ${firstFight.oddsSnapshots?.length || 0}`)
      
      console.log('\n4. All fights summary:')
      fights.forEach((fight, index) => {
        console.log(`   ${index + 1}. ${fight.fighter1?.name || 'UNKNOWN'} vs ${fight.fighter2?.name || 'UNKNOWN'} (${fight.event?.name || 'UNKNOWN EVENT'})`)
      })
    } else {
      console.log('3. No fights found - checking fallback logic...')
      // This might be the issue - let's check if the fallback is being triggered
    }
    
  } catch (error) {
    console.error('Error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack available')
  }
}

testLandingPageData().catch(console.error)
