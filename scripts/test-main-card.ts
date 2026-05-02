#!/usr/bin/env bun

import { getMainCardFights } from '../lib/actions/odds-actions'

async function testMainCardFights() {
  console.log('🥊 Testing getMainCardFights function...\n')
  
  try {
    const fights = await getMainCardFights(6)
    console.log(`Found ${fights.length} main card fights:\n`)
    
    fights.forEach((fight, index) => {
      console.log(`${index + 1}. ${fight.fighter1.name} vs ${fight.fighter2.name}`)
      console.log(`   Event: ${fight.event.name}`)
      console.log(`   Main Event: ${fight.isMainEvent ? 'YES' : 'NO'}`)
      console.log(`   Title Fight: ${fight.isTitleFight ? 'YES' : 'NO'}`)
      console.log(`   Position: ${fight.position}`)
      console.log(`   Weight Class: ${fight.weightClass}\n`)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

testMainCardFights().catch(console.error)
