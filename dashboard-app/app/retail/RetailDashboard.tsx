'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DateFilter from '@/components/DateFilter'
import { DollarSign, TrendingUp, Users, Package } from 'lucide-react'
import { LineChart, BarChart, PieChart } from '@/components/Charts'

export default function RetailDashboard() {
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
        .from('retail_transactions')
        .select('date')
        .order('date', { ascending: true })
        .limit(1)

      const { data: transactionsMax } = await supabase
        .from('retail_transactions')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)

      if (transactions?.[0] && transactionsMax?.[0]) {
        const limits = {
          min: transactions[0].date,
          max: transactionsMax[0].date
        }
        setDateLimit(limits)
      }
    } catch (error) {
      // Silent error handling
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      // Load ALL transactions with pagination if needed
      let allTransactions: any[] = []
      let page = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        let query = supabase
          .from('retail_transactions')
          .select('*', { count: 'exact' })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (dateRange.start && dateRange.end) {
          query = query
            .gte('date', dateRange.start)
            .lte('date', dateRange.end)
        }

        const { data, error, count } = await query
        
        if (error) {
          break
        }

        if (data && data.length > 0) {
          allTransactions = [...allTransactions, ...data]
          
          if (data.length < pageSize) {
            hasMore = false
          } else {
            page++
          }
        } else {
          hasMore = false
        }
      }

      const transactions = allTransactions

      // Calculate summary stats DIRECTLY from transactions
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0
      const totalTransactions = transactions?.length || 0
      const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      const uniqueCustomers = new Set(transactions?.map(t => t.customer_id)).size
      const totalProducts = transactions?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0
      
      // Calculate aggregate stats
      const totalCost = transactions?.reduce((sum, t) => sum + (t.total_cogs || 0), 0) || 0
      const totalProfit = transactions?.reduce((sum, t) => sum + (t.gross_profit || 0), 0) || 0
      const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
      
      // Category breakdown
      const categoryData = transactions?.reduce((acc: any, t) => {
        const cat = t.product_category
        if (!acc[cat]) acc[cat] = 0
        acc[cat] += t.total_amount
        return acc
      }, {})

      const categoryChartData = Object.entries(categoryData || {}).map(([name, value]) => ({
        name,
        value: Math.round(value as number),
      }))

      // Calculate monthly trend FROM transactions using REAL cost data
      const monthlyData = transactions?.reduce((acc: any, t) => {
        const month = t.date?.substring(0, 7) || 'Unknown' // Extract YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            month,
            revenue: 0,
            transactions: 0,
            totalCost: 0,
            totalProfit: 0,
            count: 0
          }
        }
        acc[month].revenue += t.total_amount || 0
        acc[month].transactions += 1
        acc[month].totalCost += t.total_cogs || 0  // Use REAL cost from DB
        acc[month].totalProfit += t.gross_profit || 0  // Use REAL profit from DB
        acc[month].count += 1
        return acc
      }, {})

      const monthlyTrend = Object.values(monthlyData || {})
        .map((m: any) => ({
          month: m.month,
          revenue: Math.round(m.revenue),
          transactions: m.transactions,
          cost: Math.round(m.totalCost),
          profit: Math.round(m.totalProfit),
          margin: m.revenue > 0 ? parseFloat((((m.revenue - m.totalCost) / m.revenue) * 100).toFixed(2)) : 0
        }))
        .sort((a: any, b: any) => a.month.localeCompare(b.month))

      // Calculate trends (compare last 2 months)
      const sortedMonths = monthlyTrend.sort((a: any, b: any) => a.month.localeCompare(b.month))
      const lastMonth = sortedMonths[sortedMonths.length - 1]
      const prevMonth = sortedMonths[sortedMonths.length - 2]
      
      const revenueTrend = prevMonth && lastMonth ? 
        ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100) : 0
      const marginTrend = prevMonth && lastMonth ?
        (lastMonth.margin - prevMonth.margin) : 0
      
      const finalData = {
        totalRevenue,
        avgOrderValue,
        uniqueCustomers,
        totalProducts,
        totalCost,
        totalProfit,
        overallMargin,
        categoryChartData,
        monthlyTrend,
        transactions: transactions?.length || 0,
        revenueTrend: {
          value: `${Math.abs(revenueTrend).toFixed(1)}%`,
          isPositive: revenueTrend >= 0
        },
        marginTrend: {
          value: `${Math.abs(marginTrend).toFixed(1)}%`,
          isPositive: marginTrend >= 0
        }
      }

      setData(finalData)
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (startDate: string, endDate: string) => {
    setDateRange({ start: startDate, end: endDate })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Error loading data</div>
          <div className="text-gray-400">Check browser console for details</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Retail Analytics</h1>
        <p className="text-gray-400">Sales performance and customer insights</p>
      </div>

      {/* Date Filter */}
      <DateFilter 
        onFilterChange={handleFilterChange} 
        label="Filter by Transaction Date"
        minDate={dateLimit.min}
        maxDate={dateLimit.max}
      />

      {/* Filter Status Indicator */}
      {dateRange.start && dateRange.end ? (
        <div className="bg-primary-600/20 border border-primary-600/50 rounded-lg px-4 py-2 text-sm">
          <span className="text-primary-400 font-semibold">🔍 Filtered:</span>
          <span className="text-white ml-2">
            {dateRange.start} to {dateRange.end}
          </span>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm">
          <span className="text-gray-400">📊 Showing all available data (no date filter applied)</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={data.revenueTrend}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${data.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          trend={data.marginTrend}
        />
        <StatCard
          title="Unique Customers"
          value={data.uniqueCustomers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Products Sold"
          value={data.totalProducts.toLocaleString()}
          icon={Package}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Category</h3>
          {data.categoryChartData && data.categoryChartData.length > 0 ? (
            <PieChart data={data.categoryChartData} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No category data available for selected period</p>
              <p className="text-xs text-gray-600 mt-2">Try adjusting your date filter</p>
            </div>
          )}
        </div>

        {/* Monthly Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue Trend</h3>
          {data.monthlyTrend && data.monthlyTrend.length > 0 ? (
            <LineChart 
              data={data.monthlyTrend}
              xKey="month"
              yKey="revenue"
              color="#0ea5e9"
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No monthly trend data available</p>
              <p className="text-xs text-gray-600 mt-2">Try selecting a broader date range</p>
            </div>
          )}
        </div>

        {/* Transactions by Month */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Transactions by Month</h3>
          {data.monthlyTrend.length > 0 ? (
            <BarChart 
              data={data.monthlyTrend}
              xKey="month"
              yKey="transactions"
              color="#10b981"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Profit Margin Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Profit Margin %</h3>
          {data.monthlyTrend.length > 0 ? (
            <LineChart 
              data={data.monthlyTrend}
              xKey="month"
              yKey="margin"
              color="#f59e0b"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-white">{data.transactions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Categories</p>
            <p className="text-2xl font-bold text-white">{data.categoryChartData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avg Items/Order</p>
            <p className="text-2xl font-bold text-white">
              {data.transactions > 0 ? (data.totalProducts / data.transactions).toFixed(1) : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Revenue/Customer</p>
            <p className="text-2xl font-bold text-white">
              ${data.uniqueCustomers > 0 ? (data.totalRevenue / data.uniqueCustomers).toFixed(2) : '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
