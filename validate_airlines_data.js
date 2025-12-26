const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './backend/.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function validateAirlinesData() {
  console.log('🛫 VALIDATING AIRLINES DATA\n')
  console.log('='.repeat(50))

  // Test 1: Check departure_time format and date range
  const { data: sampleFlights } = await supabase
    .from('airlines_flights')
    .select('departure_time, arrival_time')
    .limit(10)
  
  console.log('\n📅 Sample departure_time formats:')
  sampleFlights?.forEach((f, i) => {
    console.log(`   ${i+1}. departure_time: "${f.departure_time}"`)
    console.log(`      arrival_time: "${f.arrival_time}"`)
  })

  // Test 2: Find actual date range
  const { data: allTimes } = await supabase
    .from('airlines_flights')
    .select('departure_time')
    .not('departure_time', 'is', null)
    .limit(5000)

  if (allTimes && allTimes.length > 0) {
    const dates = allTimes
      .map(f => f.departure_time?.split(' ')[0])
      .filter(date => date && date.match(/^\d{4}-\d{2}-\d{2}$/))
      .sort()

    const uniqueDates = [...new Set(dates)]
    console.log('\n📊 DATE ANALYSIS:')
    console.log('   Total records with departure_time:', allTimes.length)
    console.log('   Valid date formats found:', dates.length)
    console.log('   Unique dates:', uniqueDates.length)
    console.log('   Date range:', uniqueDates[0], 'to', uniqueDates[uniqueDates.length - 1])
    
    // Show date distribution by year
    const yearCounts = {}
    uniqueDates.forEach(date => {
      const year = date.split('-')[0]
      yearCounts[year] = (yearCounts[year] || 0) + 1
    })
    
    console.log('\n📈 DATES BY YEAR:')
    Object.entries(yearCounts).forEach(([year, count]) => {
      console.log(`   ${year}: ${count} unique dates`)
    })
  }

  // Test 3: Check route KPIs
  const { data: routeKPIs } = await supabase
    .from('airlines_route_kpis')
    .select('*')
    .limit(5)

  console.log('\n🗺️ ROUTE KPIs SAMPLE:')
  routeKPIs?.forEach((r, i) => {
    console.log(`   ${i+1}. route: "${r.route}"`)
    console.log(`      airline: "${r.airline}"`)
    console.log(`      total_flights: ${r.total_flights}`)
    console.log(`      avg_duration: ${r.avg_duration}`)
  })

  console.log('\n' + '='.repeat(50))
  console.log('✅ VALIDATION COMPLETE\n')
}

validateAirlinesData().catch(console.error).finally(() => process.exit(0))
