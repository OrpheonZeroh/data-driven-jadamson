const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './backend/.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function validateRetailData() {
  console.log('🔍 VALIDATING RETAIL DATA\n')
  console.log('='.repeat(50))

  // Test 1: Count total transactions
  const { count: totalCount } = await supabase
    .from('retail_transactions')
    .select('*', { count: 'exact', head: true })
  console.log('\n📊 Total Transactions in DB:', totalCount)

  // Test 2: Get sample with filter
  const startDate = '2023-10-01'
  const endDate = '2023-11-01'
  
  const { data: filtered, count: filteredCount } = await supabase
    .from('retail_transactions')
    .select('*', { count: 'exact' })
    .gte('date', startDate)
    .lte('date', endDate)
  
  console.log(`\n📅 Transactions between ${startDate} and ${endDate}:`, filteredCount)
  console.log('   Loaded in query:', filtered?.length)
  
  // Test 3: Calculate stats
  if (filtered && filtered.length > 0) {
    const totalRevenue = filtered.reduce((sum, t) => sum + (t.total_amount || 0), 0)
    const uniqueCustomers = new Set(filtered.map(t => t.customer_id)).size
    const totalProducts = filtered.reduce((sum, t) => sum + (t.quantity || 0), 0)
    
    console.log('\n💰 CALCULATED STATS:')
    console.log('   Total Revenue: $' + totalRevenue.toFixed(2))
    console.log('   Avg Order Value: $' + (totalRevenue / filtered.length).toFixed(2))
    console.log('   Unique Customers:', uniqueCustomers)
    console.log('   Products Sold:', totalProducts)
    
    // Monthly breakdown
    const monthlyData = {}
    filtered.forEach(t => {
      const month = t.date?.substring(0, 7) || 'Unknown'
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, revenue: 0 }
      }
      monthlyData[month].count++
      monthlyData[month].revenue += t.total_amount || 0
    })
    
    console.log('\n📈 MONTHLY BREAKDOWN:')
    Object.entries(monthlyData).sort().forEach(([month, data]) => {
      console.log(`   ${month}: ${data.count} transactions, $${data.revenue.toFixed(2)} revenue`)
    })
    
    // Category breakdown
    const categoryData = {}
    filtered.forEach(t => {
      const cat = t.product_category || 'Unknown'
      if (!categoryData[cat]) categoryData[cat] = 0
      categoryData[cat] += t.total_amount || 0
    })
    
    console.log('\n🏷️  CATEGORY BREAKDOWN:')
    Object.entries(categoryData).forEach(([cat, revenue]) => {
      console.log(`   ${cat}: $${revenue.toFixed(2)}`)
    })
  }
  
  // Test 4: Check retail_monthly_kpis table
  console.log('\n📊 CHECKING retail_monthly_kpis TABLE:')
  const { data: kpis } = await supabase
    .from('retail_monthly_kpis')
    .select('*')
    .order('period', { ascending: true })
    .limit(5)
  
  console.log('   Records found:', kpis?.length)
  if (kpis && kpis.length > 0) {
    console.log('   Sample KPI:', JSON.stringify(kpis[0], null, 2))
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('✅ VALIDATION COMPLETE\n')
}

validateRetailData().catch(console.error).finally(() => process.exit(0))
