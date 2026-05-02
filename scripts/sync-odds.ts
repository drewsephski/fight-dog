import { oddsApi } from '../lib/api/odds-api'

async function main() {
  console.log('Starting odds sync...')
  
  try {
    const result = await oddsApi.syncOddsToDatabase()
    
    console.log('Sync completed:')
    console.log(`- Success: ${result.success}`)
    console.log(`- Events synced: ${result.eventsSynced}`)
    console.log(`- Fights synced: ${result.fightsSynced}`)
    console.log(`- Odds synced: ${result.oddsSynced}`)
    
    if (result.errors.length > 0) {
      console.log('\nErrors:')
      result.errors.forEach(error => console.log(`- ${error}`))
    }
  } catch (error) {
    console.error('Sync failed:', error)
    process.exit(1)
  }
}

main()
