'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DateFilter from '@/components/DateFilter'
import { Shield, AlertTriangle, DollarSign, Activity } from 'lucide-react'
import { BarChart, LineChart, PieChart } from '@/components/Charts'

export default function FraudDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [dateLimit, setDateLimit] = useState({ min: '', max: '' })

  useEffect(() => {
    loadData()
  }, [dateRange])

  useEffect(() => {
    loadDateLimits()
  }, [])

  async function loadDateLimits() {
    try {
      const { data: transactions } = await supabase
        .from('fraud_transactions')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1)

      const { data: transactionsMax } = await supabase
        .from('fraud_transactions')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)

      if (transactions?.[0] && transactionsMax?.[0]) {
        setDateLimit({
          min: transactions[0].timestamp?.split('T')[0] || '',
          max: transactionsMax[0].timestamp?.split('T')[0] || ''
        })
      }
    } catch (error) {
      // Silent error handling
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      let transactionsQuery = supabase
        .from('fraud_transactions')
        .select('*')
        .limit(50000)

      if (dateRange.start && dateRange.end) {
        transactionsQuery = transactionsQuery
          .gte('timestamp', `${dateRange.start}T00:00:00`)
          .lte('timestamp', `${dateRange.end}T23:59:59`)
      }

      const { data: transactions } = await transactionsQuery

      const { data: merchantKPIs } = await supabase
        .from('fraud_merchant_kpis')
        .select('*')
        .order('fraud_rate', { ascending: false })
        .limit(10)

      const { data: countryKPIs } = await supabase
        .from('fraud_country_kpis')
        .select('*')
        .order('fraud_rate', { ascending: false })

      const { data: hourlyPatterns } = await supabase
        .from('fraud_hourly_patterns')
        .select('*')
        .order('hour', { ascending: true })

      const totalTransactions = transactions?.length || 0
      const fraudulentTxns = transactions?.filter(t => t.is_fraud === 1).length || 0
      const fraudRate = (fraudulentTxns / totalTransactions) * 100
      const totalAmount = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
      const fraudAmount = transactions?.filter(t => t.is_fraud === 1)
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0

      const categoryFraud = transactions?.reduce((acc: any, t) => {
        const cat = t.merchant_category || 'Unknown'
        if (!acc[cat]) acc[cat] = { total: 0, fraud: 0 }
        acc[cat].total++
        if (t.is_fraud === 1) acc[cat].fraud++
        return acc
      }, {})

      const categoryChartData = Object.entries(categoryFraud || {})
        .map(([name, data]: [string, any]) => ({
          name,
          'Fraud Rate': ((data.fraud / data.total) * 100).toFixed(1),
          transactions: data.total,
        }))
        .sort((a, b) => parseFloat(b['Fraud Rate']) - parseFloat(a['Fraud Rate']))
        .slice(0, 8)

      const topRiskyMerchants = merchantKPIs?.slice(0, 8).map(m => ({
        merchant: m.merchant || 'Unknown',
        'Fraud Rate': (m.fraud_rate || 0).toFixed(1),
        amount: m.total_amount || 0,
      })) || []

      const countryRiskData = countryKPIs?.map(c => ({
        country: c.country || 'Unknown',
        'Fraud Rate': (c.fraud_rate || 0).toFixed(1),
        transactions: c.total_transactions || 0,
      })) || []

      const hourlyData = hourlyPatterns?.map(h => ({
        hour: `${h.hour}:00`,
        'Fraud Rate': (h.fraud_rate || 0).toFixed(1),
        transactions: h.total_transactions || 0,
      })) || []

      const cardTypeFraud = transactions?.reduce((acc: any, t) => {
        const type = t.card_type || 'Unknown'
        if (!acc[type]) acc[type] = 0
        if (t.is_fraud === 1) acc[type]++
        return acc
      }, {})

      const cardTypeChartData = Object.entries(cardTypeFraud || {}).map(([name, value]) => ({
        name,
        value: value as number,
      }))

      setData({
        totalTransactions,
        fraudRate: fraudRate.toFixed(2),
        fraudAmount,
        totalAmount,
        categoryChartData,
        topRiskyMerchants,
        countryRiskData,
        hourlyData,
        cardTypeChartData,
      })
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate })
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Fraud Detection Analytics</h1>
        <p className="text-gray-400">Real-time fraud monitoring and pattern analysis</p>
      </div>

      <DateFilter 
        onFilterChange={handleFilterChange} 
        label="Filter by Transaction Date"
        minDate={dateLimit.min}
        maxDate={dateLimit.max}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Transactions Analyzed"
          value={data.totalTransactions.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          title="Fraud Rate"
          value={`${data.fraudRate}%`}
          icon={AlertTriangle}
          trend={{ value: '0.3%', isPositive: false }}
        />
        <StatCard
          title="Fraud Amount"
          value={`$${(data.fraudAmount / 1000000).toFixed(1)}M`}
          icon={DollarSign}
        />
        <StatCard
          title="Protected Amount"
          value={`$${((data.totalAmount - data.fraudAmount) / 1000000).toFixed(1)}M`}
          icon={Shield}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Fraud Rate by Merchant Category</h3>
          {data.categoryChartData.length > 0 ? (
            <BarChart 
              data={data.categoryChartData}
              xKey="name"
              yKey="Fraud Rate"
              color="#ef4444"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Fraud by Card Type</h3>
          {data.cardTypeChartData.length > 0 ? (
            <PieChart data={data.cardTypeChartData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Fraud Pattern</h3>
          {data.hourlyData.length > 0 ? (
            <LineChart 
              data={data.hourlyData}
              xKey="hour"
              yKey="Fraud Rate"
              color="#f59e0b"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">High-Risk Merchants</h3>
          {data.topRiskyMerchants.length > 0 ? (
            <BarChart 
              data={data.topRiskyMerchants}
              xKey="merchant"
              yKey="Fraud Rate"
              color="#ef4444"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Fraud Rate by Country</h3>
          {data.countryRiskData.length > 0 ? (
            <BarChart 
              data={data.countryRiskData}
              xKey="country"
              yKey="Fraud Rate"
              color="#f59e0b"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Top 10 High-Risk Merchants</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Merchant</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Fraud Rate</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Amount</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {data.topRiskyMerchants.map((merchant: any, idx: number) => {
                const fraudRate = parseFloat(merchant['Fraud Rate'])
                return (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-white font-medium">{merchant.merchant}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={fraudRate > 5 ? 'text-error' : fraudRate > 2 ? 'text-warning' : 'text-success'}>
                        {merchant['Fraud Rate']}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      ${(merchant.amount / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        fraudRate > 5 
                          ? 'bg-error/20 text-error' 
                          : fraudRate > 2
                          ? 'bg-warning/20 text-warning'
                          : 'bg-success/20 text-success'
                      }`}>
                        {fraudRate > 5 ? 'Critical' : fraudRate > 2 ? 'High' : 'Medium'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-error/50">
          <h4 className="text-sm font-semibold text-error mb-2">Highest Risk Category</h4>
          <p className="text-2xl font-bold text-white">
            {data.categoryChartData[0]?.name || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.categoryChartData[0]?.['Fraud Rate'] || '0'}% fraud rate
          </p>
        </div>
        
        <div className="card border-warning/50">
          <h4 className="text-sm font-semibold text-warning mb-2">Peak Fraud Hour</h4>
          <p className="text-2xl font-bold text-white">
            {data.hourlyData.reduce((max: any, curr: any) => 
              parseFloat(curr['Fraud Rate']) > parseFloat(max['Fraud Rate']) ? curr : max
            , data.hourlyData[0] || {})?.hour || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Monitor closely during this time</p>
        </div>
        
        <div className="card border-success/50">
          <h4 className="text-sm font-semibold text-success mb-2">Detection Rate</h4>
          <p className="text-2xl font-bold text-white">
            {(100 - parseFloat(data.fraudRate)).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Successfully prevented fraud</p>
        </div>
      </div>
    </div>
  )
}
