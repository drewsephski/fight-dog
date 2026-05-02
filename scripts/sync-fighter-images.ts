#!/usr/bin/env bun

import { syncAllFightersWithOctagon } from '../lib/actions/fighter-actions'

async function main() {
  console.log('🥊 Syncing fighter data with Octagon API...')
  
  try {
    const result = await syncAllFightersWithOctagon()
    
    console.log(`✅ Successfully updated ${result.updated} fighters`)
    
    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:')
      result.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    console.log('🎉 Fighter sync completed!')
  } catch (error) {
    console.error('❌ Failed to sync fighters:', error)
    process.exit(1)
  }
}

main()
