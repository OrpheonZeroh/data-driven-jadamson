'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import DateFilter from '@/components/DateFilter'
import { Users, TrendingDown, DollarSign, Phone } from 'lucide-react'
import { BarChart, PieChart } from '@/components/Charts'

export default function TelcoDashboard() {
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
      // Note: telco_customers doesn't have date field, using signup_date if available
      // If no date field exists, we'll show all data
      const { data: kpis } = await supabase
        .from('telco_segment_kpis')
        .select('*')
        .limit(1)

      // For telco, we don't have temporal data, so we'll disable date filter
      setDateLimit({ min: '', max: '' })
    } catch (error) {
      // Silent error handling
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const { data: customers } = await supabase
        .from('telco_customers')
        .select('*')

      const { data: segmentKPIs } = await supabase
        .from('telco_segment_kpis')
        .select('*')
        .order('revenue_at_risk', { ascending: false })

      const totalCustomers = customers?.length || 0
      const churnedCustomers = customers?.filter(c => c.churn_binary === 1).length || 0
      const churnRate = (churnedCustomers / totalCustomers) * 100
      const avgARPU = customers?.reduce((sum, c) => sum + (c.monthly_charges || 0), 0) / totalCustomers
      const totalCLV = customers?.reduce((sum, c) => sum + (c.estimated_clv || 0), 0) || 0

      // Contract Type Distribution
      const contractTypes = customers?.reduce((acc: any, c) => {
        const type = c.contract
        if (!type || type.trim() === '') return acc
        if (!acc[type]) acc[type] = 0
        acc[type]++
        return acc
      }, {})

      const contractChartData = Object.entries(contractTypes || {})
        .map(([name, value]) => ({
          name,
          value: value as number,
        }))
        .filter(item => item.value > 0)

      // Churn by Contract Type (CRITICAL)
      const contractChurn = customers?.reduce((acc: any, c) => {
        const type = c.contract || 'Unknown'
        if (!acc[type]) acc[type] = { total: 0, churned: 0 }
        acc[type].total++
        if (c.churn_binary === 1) acc[type].churned++
        return acc
      }, {})

      const churnByContractData = Object.entries(contractChurn || {})
        .map(([contract, data]: [string, any]) => ({
          contract,
          'Churn Rate': ((data.churned / data.total) * 100).toFixed(1),
          customers: data.total,
        }))
        .sort((a, b) => parseFloat(b['Churn Rate']) - parseFloat(a['Churn Rate']))

      // Internet Service Analysis
      const internetService = customers?.reduce((acc: any, c) => {
        const service = c.internet_service
        // Skip empty or No values
        if (!service || service.trim() === '' || service === 'No') return acc
        if (!acc[service]) acc[service] = 0
        acc[service]++
        return acc
      }, {})

      const internetChartData = Object.entries(internetService || {})
        .map(([name, value]) => ({
          name,
          value: value as number,
        }))
        .filter(item => item.value > 0)

      // Payment Method vs Churn
      const paymentChurn = customers?.reduce((acc: any, c) => {
        const method = c.payment_method
        // Skip if payment method is empty or undefined
        if (!method || method.trim() === '') return acc
        if (!acc[method]) acc[method] = { total: 0, churned: 0 }
        acc[method].total++
        if (c.churn_binary === 1) acc[method].churned++
        return acc
      }, {})

      const paymentChurnData = Object.entries(paymentChurn || {})
        .map(([method, data]: [string, any]) => ({
          method,
          'Churn Rate': ((data.churned / data.total) * 100).toFixed(1),
          customers: data.total,
        }))
        .filter(item => item.customers > 0)  // Remove empty segments
        .sort((a, b) => parseFloat(b['Churn Rate']) - parseFloat(a['Churn Rate']))

      // Services Adoption
      const servicesAdoption = {
        'Streaming TV': customers?.filter(c => c.streaming_tv === 'Yes').length || 0,
        'Streaming Movies': customers?.filter(c => c.streaming_movies === 'Yes').length || 0,
        'Tech Support': customers?.filter(c => c.tech_support === 'Yes').length || 0,
        'Online Security': customers?.filter(c => c.online_security === 'Yes').length || 0,
        'Device Protection': customers?.filter(c => c.device_protection === 'Yes').length || 0,
      }

      const servicesChartData = Object.entries(servicesAdoption).map(([name, value]) => ({
        name,
        value,
      }))

      const tenureChurn = customers?.reduce((acc: any, c) => {
        const segment = c.tenure_segment
        // Skip empty or unknown segments
        if (!segment || segment.trim() === '' || segment === 'Unknown') return acc
        if (!acc[segment]) acc[segment] = { total: 0, churned: 0 }
        acc[segment].total++
        if (c.churn_binary === 1) acc[segment].churned++
        return acc
      }, {})

      const tenureChartData = Object.entries(tenureChurn || {})
        .map(([segment, data]: [string, any]) => ({
          segment,
          'Churn Rate': ((data.churned / data.total) * 100).toFixed(1),
          customers: data.total,
        }))
        .filter(item => item.customers > 0 && parseFloat(item['Churn Rate']) >= 0)
        .sort((a, b) => b.customers - a.customers)

      const arpuSegments = customers?.reduce((acc: any, c) => {
        const segment = c.arpu_segment || 'Unknown'
        if (!acc[segment]) acc[segment] = { total: 0, revenue: 0 }
        acc[segment].total++
        acc[segment].revenue += c.monthly_charges || 0
        return acc
      }, {})

      const arpuChartData = Object.entries(arpuSegments || {})
        .map(([segment, data]: [string, any]) => ({
          segment,
          arpu: (data.revenue / data.total).toFixed(2),
          customers: data.total,
        }))
        .sort((a, b) => parseFloat(b.arpu) - parseFloat(a.arpu))

      // Revenue at Risk by Segment
      const revenueAtRiskData = segmentKPIs?.slice(0, 8).map(s => ({
        segment: `${s.contract}-${s.tenure_segment}-${s.arpu_segment}`,
        revenueAtRisk: s.revenue_at_risk || 0,
        churnRate: s.churn_rate || 0,
        customers: s.total_customers || 0,
      })) || []

      const topSegments = segmentKPIs
        ?.filter(s => (s.total_customers || 0) > 0)  // Only segments with customers
        .slice(0, 6)
        .map(s => ({
          segment: `${s.contract} / ${s.tenure_segment} / ${s.arpu_segment}`,
          customers: s.total_customers || 0,
          'Churn Rate': (s.churn_rate || 0).toFixed(1),
          arpu: (s.avg_monthly_charges || 0).toFixed(2),
          revenueAtRisk: (s.revenue_at_risk || 0).toFixed(0),
        })) || []

      setData({
        totalCustomers,
        churnRate: churnRate.toFixed(1),
        avgARPU: avgARPU.toFixed(2),
        totalCLV,
        contractChartData,
        churnByContractData,
        internetChartData,
        paymentChurnData,
        servicesChartData,
        tenureChartData,
        arpuChartData,
        revenueAtRiskData,
        topSegments,
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
        <h1 className="text-3xl font-bold text-white mb-2">Telco Customer Analytics</h1>
        <p className="text-gray-400">Comprehensive churn analysis and retention strategy insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={data.totalCustomers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          title="Churn Rate"
          value={`${data.churnRate}%`}
          icon={TrendingDown}
          trend={{ value: '1.2%', isPositive: false }}
        />
        <StatCard
          title="Avg ARPU"
          value={`$${data.avgARPU}`}
          icon={DollarSign}
          trend={{ value: '3.5%', isPositive: true }}
        />
        <StatCard
          title="Total CLV"
          value={`$${(data.totalCLV / 1000000).toFixed(1)}M`}
          icon={Phone}
        />
      </div>

      {/* SECTION 1: Who Are Our Customers */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">📊 Customer Base Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Contract Type Distribution</h3>
            {data.contractChartData.length > 0 ? (
              <PieChart data={data.contractChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Shows how customers are distributed across contract types. Month-to-month contracts typically have higher churn rates, 
              while longer contracts (One/Two year) indicate stronger commitment and lower churn risk.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Internet Service Distribution</h3>
            {data.internetChartData.length > 0 ? (
              <PieChart data={data.internetChartData} />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Breakdown of internet service types. Fiber optic customers typically pay more but may have different retention patterns 
              compared to DSL users. Understanding this mix helps in targeted retention strategies.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: What Services Do They Use */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">🎯 Services Adoption</h2>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Add-on Services Usage</h3>
          {data.servicesChartData.length > 0 ? (
            <BarChart 
              data={data.servicesChartData}
              xKey="name"
              yKey="value"
              color="#8b5cf6"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
          <p className="text-sm text-gray-400 mt-4">
            Shows adoption rates of premium services. Customers with more add-ons typically have lower churn rates due to 
            increased switching costs and deeper product engagement. This identifies cross-sell opportunities.
          </p>
        </div>
      </div>

      {/* SECTION 3: Why Are They Leaving (CRITICAL) */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">⚠️ Churn Risk Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Churn Rate by Contract Type</h3>
            {data.churnByContractData.length > 0 ? (
              <BarChart 
                data={data.churnByContractData}
                xKey="contract"
                yKey="Churn Rate"
                color="#ef4444"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              <strong>CRITICAL INSIGHT:</strong> This shows which contract types have highest churn. Month-to-month contracts typically 
              show significantly higher churn rates. Converting customers to longer contracts is a key retention strategy.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Churn Rate by Payment Method</h3>
            {data.paymentChurnData.length > 0 ? (
              <BarChart 
                data={data.paymentChurnData}
                xKey="method"
                yKey="Churn Rate"
                color="#f59e0b"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              Payment method correlates with churn behavior. Electronic check often shows higher churn, while automatic payments 
              (credit card, bank transfer) indicate stronger commitment. Target customers with risky payment methods.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Churn Rate by Customer Tenure</h3>
            {data.tenureChartData.length > 0 ? (
              <BarChart 
                data={data.tenureChartData}
                xKey="segment"
                yKey="Churn Rate"
                color="#ef4444"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              New customers (0-12 months) typically have highest churn risk. Focus retention efforts on this critical onboarding period. 
              Long-tenure customers are more stable and valuable.
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue at Risk by Segment</h3>
            {data.revenueAtRiskData.length > 0 ? (
              <BarChart 
                data={data.revenueAtRiskData}
                xKey="segment"
                yKey="revenueAtRisk"
                color="#dc2626"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              <strong>ACTION PRIORITY:</strong> Shows which customer segments represent the highest revenue at risk from churn. 
              Focus retention investments on these high-value, high-risk segments for maximum ROI.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Where Is The Value */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">💰 Revenue Insights</h2>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">ARPU by Segment</h3>
          {data.arpuChartData.length > 0 ? (
            <BarChart 
              data={data.arpuChartData}
              xKey="segment"
              yKey="arpu"
              color="#10b981"
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
          <p className="text-sm text-gray-400 mt-4">
            Average Revenue Per User by segment. High-ARPU segments are your premium customers. 
            Protect these segments with white-glove service and proactive retention programs.
          </p>
        </div>
      </div>

      {/* SECTION 5: Action Required */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">🎯 Top Priority Segments</h2>
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">High-Risk Segments Requiring Immediate Action</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Segment</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Customers</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Churn Rate</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">ARPU</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Revenue at Risk</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {data.topSegments.map((segment: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-white font-medium text-xs">{segment.segment}</td>
                    <td className="py-3 px-4 text-right text-gray-300">{segment.customers.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={parseFloat(segment['Churn Rate']) > 30 ? 'text-error' : 'text-success'}>
                        {segment['Churn Rate']}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">${segment.arpu}</td>
                    <td className="py-3 px-4 text-right text-error font-semibold">${parseFloat(segment.revenueAtRisk).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        parseFloat(segment['Churn Rate']) > 40 && parseFloat(segment.revenueAtRisk) > 10000
                          ? 'bg-error text-white font-bold' 
                          : parseFloat(segment['Churn Rate']) > 30
                          ? 'bg-warning/20 text-warning'
                          : 'bg-success/20 text-success'
                      }`}>
                        {parseFloat(segment['Churn Rate']) > 40 && parseFloat(segment.revenueAtRisk) > 10000 ? 'URGENT' : parseFloat(segment['Churn Rate']) > 30 ? 'High' : 'Medium'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            <strong>Retention Strategy:</strong> Prioritize segments marked URGENT (high churn + high revenue at risk). 
            Deploy targeted campaigns: contract upgrades, service bundles, loyalty programs, or personalized outreach.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Highest Risk Contract Type</h4>
          <p className="text-2xl font-bold text-error">
            {data.churnByContractData[0]?.contract || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.churnByContractData[0]?.['Churn Rate'] || '0'}% churn rate
          </p>
        </div>
        
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Most Valuable Segment</h4>
          <p className="text-2xl font-bold text-success">
            ${data.arpuChartData[0]?.arpu || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {data.arpuChartData[0]?.segment || 'N/A'} ARPU
          </p>
        </div>
        
        <div className="card">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Retention Strategy</h4>
          <p className="text-2xl font-bold text-white">
            {parseFloat(data.churnRate) < 20 ? 'Maintain' : parseFloat(data.churnRate) < 30 ? 'Optimize' : 'Transform'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {parseFloat(data.churnRate) < 20 ? 'Keep current practices' : parseFloat(data.churnRate) < 30 ? 'Improve weak segments' : 'Urgent intervention needed'}
          </p>
        </div>
      </div>
    </div>
  )
}
