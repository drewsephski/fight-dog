#!/usr/bin/env bun

import { prisma } from '../lib/db/prisma'

async function debugFights() {
  console.log('🥊 Debugging Fight Data...\n')
  
  const fights = await prisma.fight.findMany({
    where: { status: 'upcoming' },
    include: {
      event: true,
      fighter1: true,
      fighter2: true,
    },
    orderBy: [
      { event: { date: 'asc' } },
      { position: 'asc' }
    ],
    take: 10
  })

  console.log(`Total upcoming fights: ${fights.length}\n`)
  
  fights.forEach((fight, index) => {
    console.log(`${index + 1}. ${fight.fighter1.name} vs ${fight.fighter2.name}`)
    console.log(`   Event: ${fight.event.name}`)
    console.log(`   Main Event: ${fight.isMainEvent ? 'YES' : 'NO'}`)
    console.log(`   Title Fight: ${fight.isTitleFight ? 'YES' : 'NO'}`)
    console.log(`   Position: ${fight.position}`)
    console.log(`   Weight Class: ${fight.weightClass}\n`)
  })
}

debugFights().catch(console.error)
