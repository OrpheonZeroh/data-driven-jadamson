const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './backend/.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function checkData() {
  console.log('🔍 Checking Retail Data...\n')
  
  // Check transactions
  const { data: txs, error: txError } = await supabase
    .from('retail_transactions')
    .select('date, total_amount, product_category')
    .limit(5)
  
  if (txError) {
    console.error('❌ Transactions Error:', txError)
  } else {
    console.log('✅ Sample Transactions:', txs)
    console.log(`Total fetched: ${txs?.length || 0}`)
  }

  // Check KPIs
  const { data: kpis, error: kpiError } = await supabase
    .from('retail_monthly_kpis')
    .select('*')
    .order('period', { ascending: true })
    .limit(5)
  
  if (kpiError) {
    console.error('❌ KPIs Error:', kpiError)
  } else {
    console.log('\n✅ Monthly KPIs:', kpis)
    console.log(`Total KPIs: ${kpis?.length || 0}`)
  }

  // Get date range
  const { data: minDate } = await supabase
    .from('retail_transactions')
    .select('date')
    .order('date', { ascending: true })
    .limit(1)
    
  const { data: maxDate } = await supabase
    .from('retail_transactions')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)

  console.log('\n📅 Date Range:')
  console.log('Min:', minDate?.[0]?.date)
  console.log('Max:', maxDate?.[0]?.date)
}

checkData().then(() => process.exit(0))
