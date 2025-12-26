const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './backend/.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function testDates() {
  console.log('Testing Retail...')
  const { data: retail } = await supabase
    .from('retail_transactions')
    .select('date')
    .order('date', { ascending: true })
    .limit(3)
  console.log('Retail dates:', retail)

  const { data: kpis } = await supabase
    .from('retail_monthly_kpis')
    .select('period')
    .order('period', { ascending: true })
    .limit(5)
  console.log('Monthly KPIs periods:', kpis)

  console.log('\nTesting Airlines...')
  const { data: flights } = await supabase
    .from('airlines_flights')
    .select('flight_date')
    .order('flight_date', { ascending: true })
    .limit(3)
  console.log('Flight dates:', flights)

  console.log('\nTesting Fraud...')
  const { data: fraud } = await supabase
    .from('fraud_transactions')
    .select('timestamp')
    .order('timestamp', { ascending: true })
    .limit(3)
  console.log('Fraud timestamps:', fraud)
}

testDates()
