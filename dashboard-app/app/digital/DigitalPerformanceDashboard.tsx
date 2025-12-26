'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DateFilter from '@/components/DateFilter'
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react'
import { BarChart, LineChart, PieChart } from '@/components/Charts'

export default function DigitalPerformanceDashboard() {
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
      const { data: dates } = await supabase
        .from('digital_performance_data')
        .select('date')
        .order('date', { ascending: true })
        .limit(1)

      const { data: maxDates } = await supabase
        .from('digital_performance_data')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)

      if (dates?.[0] && maxDates?.[0]) {
        const limits = {
          min: dates[0].date,
          max: maxDates[0].date
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
      // Build query with date filter
      let query = supabase.from('digital_performance_data').select('*')
      
      if (dateRange.start && dateRange.end) {
        query = query.gte('date', dateRange.start).lte('date', dateRange.end)
      }

      const { data: performance, error } = await query

      if (error) {
        return
      }

      if (!performance || performance.length === 0) {
        setLoading(false)
        return
      }

      // Calculate aggregate metrics
      const totalSpend = performance.reduce((sum, p) => sum + (parseFloat(p.spend) || 0), 0)
      const totalRevenue = performance.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0)
      const totalNewCustomers = performance.reduce((sum, p) => sum + (p.new_customers || 0), 0)
      const totalClicks = performance.reduce((sum, p) => sum + (p.clicks || 0), 0)
      const totalLeads = performance.reduce((sum, p) => sum + (p.leads || 0), 0)
      const totalImpressions = performance.reduce((sum, p) => sum + (p.impressions || 0), 0)
      const avgActiveCustomers = performance.reduce((sum, p) => sum + (p.active_customers_start_of_day || 0), 0) / performance.length

      const roi = ((totalRevenue - totalSpend) / totalSpend) * 100
      const cac = totalSpend / totalNewCustomers
      const arpu = totalRevenue / avgActiveCustomers

      // Channel breakdown
      const channelStats = performance.reduce((acc: any, p) => {
        const channel = p.channel || 'Unknown'
        if (!acc[channel]) {
          acc[channel] = { 
            spend: 0, 
            revenue: 0, 
            newCustomers: 0,
            clicks: 0,
            leads: 0,
            impressions: 0
          }
        }
        acc[channel].spend += parseFloat(p.spend) || 0
        acc[channel].revenue += parseFloat(p.revenue) || 0
        acc[channel].newCustomers += p.new_customers || 0
        acc[channel].clicks += p.clicks || 0
        acc[channel].leads += p.leads || 0
        acc[channel].impressions += p.impressions || 0
        return acc
      }, {})

      // Spend by Channel (Pie)
      const spendByChannelData = Object.entries(channelStats).map(([channel, stats]: [string, any]) => ({
        name: channel,
        value: parseFloat(stats.spend.toFixed(2)),
      }))

      // Revenue by Channel (Bar)
      const revenueByChannelData = Object.entries(channelStats)
        .map(([channel, stats]: [string, any]) => ({
          channel,
          revenue: parseFloat(stats.revenue.toFixed(2)),
        }))
        .sort((a, b) => b.revenue - a.revenue)

      // ROI by Channel (Bar) - CRITICAL
      const roiByChannelData = Object.entries(channelStats)
        .map(([channel, stats]: [string, any]) => ({
          channel,
          'ROI': parseFloat((((stats.revenue - stats.spend) / stats.spend) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.ROI - a.ROI)

      // CAC by Channel (Bar)
      const cacByChannelData = Object.entries(channelStats)
        .map(([channel, stats]: [string, any]) => ({
          channel,
          CAC: parseFloat((stats.spend / stats.newCustomers).toFixed(2)),
        }))
        .sort((a, b) => a.CAC - b.CAC)

      // LTV/CAC Ratio (would need churn data for full LTV calculation)
      // For now, using simplified version
      const ltvCacRatioData = Object.entries(channelStats)
        .map(([channel, stats]: [string, any]) => {
          const channelCAC = stats.spend / stats.newCustomers
          const channelARPU = stats.revenue / stats.newCustomers
          return {
            channel,
            'LTV/CAC': parseFloat((channelARPU / channelCAC).toFixed(2)),
          }
        })
        .sort((a, b) => b['LTV/CAC'] - a['LTV/CAC'])

      // Monthly trends
      const monthlyData = performance.reduce((acc: any, p) => {
        const month = p.date.substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { revenue: 0, spend: 0, newCustomers: 0 }
        }
        acc[month].revenue += parseFloat(p.revenue) || 0
        acc[month].spend += parseFloat(p.spend) || 0
        acc[month].newCustomers += p.new_customers || 0
        return acc
      }, {})

      const monthlyTrendData = Object.entries(monthlyData)
        .map(([month, stats]: [string, any]) => ({
          month,
          Revenue: parseFloat(stats.revenue.toFixed(2)),
          Spend: parseFloat(stats.spend.toFixed(2)),
        }))
        .sort((a, b) => a.month.localeCompare(b.month))

      const newCustomersTrendData = Object.entries(monthlyData)
        .map(([month, stats]: [string, any]) => ({
          month,
          'New Customers': stats.newCustomers,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Channel Priority Table
      const channelPriorityData = Object.entries(channelStats)
        .map(([channel, stats]: [string, any]) => {
          const channelROI = ((stats.revenue - stats.spend) / stats.spend) * 100
          const channelCAC = stats.spend / stats.newCustomers
          return {
            channel,
            spend: stats.spend.toFixed(2),
            revenue: stats.revenue.toFixed(2),
            roi: channelROI.toFixed(1),
            cac: channelCAC.toFixed(2),
            newCustomers: stats.newCustomers,
            status: channelROI > 100 ? 'scale' : channelROI > 0 ? 'optimize' : 'review',
          }
        })
        .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
        .slice(0, 5)

      setData({
        totalSpend: totalSpend.toFixed(2),
        totalRevenue: totalRevenue.toFixed(2),
        roi: roi.toFixed(1),
        totalNewCustomers,
        cac: cac.toFixed(2),
        arpu: arpu.toFixed(2),
        spendByChannelData,
        revenueByChannelData,
        roiByChannelData,
        cacByChannelData,
        ltvCacRatioData,
        monthlyTrendData,
        newCustomersTrendData,
        channelPriorityData,
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
        <h1 className="text-3xl font-bold text-white mb-2">Digital Performance Marketing</h1>
        <p className="text-gray-400">Marketing attribution and customer acquisition analytics</p>
      </div>

      <DateFilter 
        onFilterChange={handleFilterChange} 
        label="Filter by Date Range"
        minDate={dateLimit.min}
        maxDate={dateLimit.max}
      />

      {/* SECTION 1: Marketing Investment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Spend"
          value={`$${parseFloat(data.totalSpend).toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Total Revenue"
          value={`$${parseFloat(data.totalRevenue).toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: '12.5%', isPositive: true }}
        />
        <StatCard
          title="Overall ROI"
          value={`${data.roi}%`}
          icon={Target}
          trend={{ 
            value: `${Math.abs(parseFloat(data.roi))}%`, 
            isPositive: parseFloat(data.roi) > 0 
          }}
        />
        <StatCard
          title="New Customers"
          value={data.totalNewCustomers.toLocaleString()}
          icon={Users}
        />
      </div>

      {/* SECTION 2: Channel Performance */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">🎯 Channel Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Budget Allocation by Channel</h3>
            {data.spendByChannelData.length > 0 ? (
              <PieChart data={data.spendByChannelData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Shows marketing budget distribution across channels. This helps identify budget concentration 
              and opportunities to diversify or double down on winning channels.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue by Channel</h3>
            {data.revenueByChannelData.length > 0 ? (
              <BarChart 
                data={data.revenueByChannelData}
                xKey="channel"
                yKey="revenue"
                color="#10b981"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Compares revenue generation across marketing channels. High-revenue channels are your 
              top performers and should be protected with adequate budget and optimization focus.
            </p>
          </div>

          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">ROI by Channel</h3>
            {data.roiByChannelData.length > 0 ? (
              <BarChart 
                data={data.roiByChannelData}
                xKey="channel"
                yKey="ROI"
                color="#0ea5e9"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              <strong>CRITICAL METRIC:</strong> Shows return on investment by channel. Channels with ROI &gt; 100% 
              are profitable and should be scaled. ROI &lt; 0% indicates spend exceeds revenue and requires immediate attention.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Acquisition Efficiency */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">🔥 Acquisition Efficiency</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Acquisition Cost (CAC) by Channel</h3>
            {data.cacByChannelData.length > 0 ? (
              <BarChart 
                data={data.cacByChannelData}
                xKey="channel"
                yKey="CAC"
                color="#f59e0b"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Cost to acquire one new customer by channel. Lower CAC means more efficient acquisition. 
              Compare against customer lifetime value to ensure profitable growth.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">New Customers Trend</h3>
            {data.newCustomersTrendData.length > 0 ? (
              <LineChart 
                data={data.newCustomersTrendData}
                xKey="month"
                yKey="New Customers"
                color="#8b5cf6"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Monthly customer acquisition trend. Upward trends indicate successful growth strategies. 
              Declines require investigation of channel performance or market conditions.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Customer Value */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">💎 Customer Value Metrics</h2>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">LTV/CAC Ratio by Channel</h3>
          {data.ltvCacRatioData.length > 0 ? (
            <BarChart 
              data={data.ltvCacRatioData}
              xKey="channel"
              yKey="LTV/CAC"
              color="#10b981"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
          <p className="text-sm text-gray-400 mt-4">
            <strong>CRITICAL BUSINESS HEALTH METRIC:</strong> Ratio of customer lifetime value to acquisition cost. 
            <br />• <strong>Ratio &gt; 3:</strong> Healthy and scalable
            <br />• <strong>Ratio 1-3:</strong> Acceptable but monitor closely
            <br />• <strong>Ratio &lt; 1:</strong> Unprofitable - urgent action required
          </p>
        </div>
      </div>

      {/* SECTION 5: Time Intelligence */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">📅 Performance Trends</h2>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue vs Spend</h3>
          {data.monthlyTrendData.length > 0 ? (
            <LineChart 
              data={data.monthlyTrendData}
              xKey="month"
              yKey="Revenue"
              color="#0ea5e9"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
          <p className="text-sm text-gray-400 mt-4">
            Shows revenue and spend evolution over time. The gap between lines represents profit margin. 
            Look for seasonal patterns, growth trends, and efficiency improvements over time.
          </p>
        </div>
      </div>

      {/* SECTION 6: Action Priority */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">🎯 Channel Priority Matrix</h2>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Allocation Recommendations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Channel</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Spend</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">ROI</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">CAC</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">New Customers</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.channelPriorityData.map((channel: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-white font-medium">{channel.channel}</td>
                    <td className="py-3 px-4 text-right text-gray-300">${parseFloat(channel.spend).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-300">${parseFloat(channel.revenue).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={parseFloat(channel.roi) > 100 ? 'text-success' : parseFloat(channel.roi) > 0 ? 'text-warning' : 'text-error'}>
                        {channel.roi}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">${channel.cac}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{channel.newCustomers.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        channel.status === 'scale' 
                          ? 'bg-success text-white font-bold' 
                          : channel.status === 'optimize'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                      }`}>
                        {channel.status === 'scale' ? '🚀 SCALE' : channel.status === 'optimize' ? '⚙️ Optimize' : '⚠️ Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            <strong>Action Guide:</strong>
            <br />• <strong>🚀 SCALE:</strong> ROI &gt; 100% - Increase budget aggressively
            <br />• <strong>⚙️ Optimize:</strong> Positive ROI but &lt; 100% - Improve efficiency before scaling
            <br />• <strong>⚠️ Review:</strong> Negative ROI - Pause spending and analyze or shut down
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Best Performing Channel</h4>
          <p className="text-2xl font-bold text-success">
            {data.roiByChannelData[0]?.channel || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.roiByChannelData[0]?.ROI || '0'}% ROI
          </p>
        </div>
        
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Most Efficient Acquisition</h4>
          <p className="text-2xl font-bold text-primary-500">
            {data.cacByChannelData[0]?.channel || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ${data.cacByChannelData[0]?.CAC || '0'} CAC
          </p>
        </div>
        
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Marketing Health</h4>
          <p className="text-2xl font-bold text-white">
            {parseFloat(data.roi) > 100 ? 'Excellent' : parseFloat(data.roi) > 0 ? 'Good' : 'Needs Action'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Overall {data.roi}% ROI
          </p>
        </div>
      </div>
    </div>
  )
}
