import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import { DollarSign, Plane, Users, TrendingUp, Activity } from 'lucide-react'

async function getExecutiveSummary() {
  try {
    const [digital, retail, airlines, telco] = await Promise.all([
      supabase.from('digital_performance_data').select('*', { count: 'exact', head: true }),
      supabase.from('retail_transactions').select('*', { count: 'exact', head: true }),
      supabase.from('airlines_flights').select('*', { count: 'exact', head: true }),
      supabase.from('telco_customers').select('*', { count: 'exact', head: true }),
    ])

    return {
      digital: digital.count || 0,
      retail: retail.count || 0,
      airlines: airlines.count || 0,
      telco: telco.count || 0,
    }
  } catch (error) {
    return { digital: 0, retail: 0, airlines: 0, telco: 0 }
  }
}

export default async function Home() {
  const summary = await getExecutiveSummary()
  const totalRecords = summary.digital + summary.retail + summary.airlines + summary.telco

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Data-Driven Analytics Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Multi-domain analytics platform for business intelligence
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/30 px-4 py-2 rounded-lg border border-gray-800">
            <span>📊</span>
            <p>
              <strong>Data Sources:</strong> Public datasets from{' '}
              <a 
                href="https://www.kaggle.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-400 underline"
              >
                Kaggle
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Records"
          value={totalRecords.toLocaleString()}
          icon={Activity}
          description="Across all datasets"
        />
        
        <StatCard
          title="Digital Performance"
          value={summary.digital.toLocaleString()}
          icon={TrendingUp}
          description="Marketing records"
        />
        
        <StatCard
          title="Telco Customers"
          value={summary.telco.toLocaleString()}
          icon={Users}
          description="Customer base"
        />
        
        <StatCard
          title="Airlines Flights"
          value={summary.airlines.toLocaleString()}
          icon={Plane}
          description="Flight records"
        />
        
        <StatCard
          title="Retail Transactions"
          value={summary.retail.toLocaleString()}
          icon={DollarSign}
          description="Sales transactions"
        />
        
        <StatCard
          title="Data Quality"
          value="99.8%"
          icon={TrendingUp}
          trend={{ value: '0.2%', isPositive: true }}
          description="Clean data rate"
        />
      </div>

      {/* Dashboard Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <DashboardCard
          title="Digital Performance"
          description="Marketing attribution, ROI, and customer acquisition analytics"
          href="/digital"
          icon="📊"
          color="from-indigo-500 to-purple-500"
          dataType="historical"
        />
        <DashboardCard
          title="Telco Churn"
          description="Customer retention, ARPU, and churn prediction"
          href="/telco"
          icon="📞"
          color="from-green-500 to-emerald-500"
          dataType="snapshot"
        />
        <DashboardCard
          title="Airlines Pricing"
          description="Flight pricing analysis and market insights"
          href="/airlines"
          icon="✈️"
          color="from-purple-500 to-pink-500"
          dataType="snapshot"
        />
        <DashboardCard
          title="Retail Analytics"
          description="Sales performance, customer segments, and revenue trends"
          href="/retail"
          icon="🛒"
          color="from-blue-500 to-cyan-500"
          dataType="historical"
        />
      </div>
    </div>
  )
}

function DashboardCard({ title, description, href, icon, color, dataType }: {
  title: string
  description: string
  href: string
  icon: string
  color: string
  dataType: 'historical' | 'snapshot'
}) {
  // Define badges and metrics based on dashboard type
  const dashboardMeta = {
    'Digital Performance': {
      badges: ['📅 Time-Series', '🤖 ML-Ready', '💰 ROI Focus'],
      metric: '4 Channels',
      cta: 'Explore ROI Analytics →'
    },
    'Telco Churn': {
      badges: ['📸 Snapshot', '⚠️ Predictive', '💎 High-Value'],
      metric: '7K+ Customers',
      cta: 'Analyze Churn Risk →'
    },
    'Airlines Pricing': {
      badges: ['📸 Snapshot', '💹 Market Intel', '🔍 Competitive'],
      metric: '300K+ Flights',
      cta: 'See Pricing Insights →'
    },
    'Retail Analytics': {
      badges: ['📅 Time-Series', '📊 Multi-Year', '💵 Profitability'],
      metric: '540K+ Transactions',
      cta: 'View Sales Trends →'
    }
  }[title] || { badges: [], metric: '', cta: 'View Dashboard →' }

  return (
    <a
      href={href}
      className="card card-hover group cursor-pointer relative overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
        {dashboardMeta.badges.map((badge, idx) => (
          <span 
            key={idx}
            className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${
              badge.includes('Time-Series') 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : badge.includes('Snapshot')
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : badge.includes('Predictive') || badge.includes('ML-Ready')
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {badge}
          </span>
        ))}
      </div>
      
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {title}
      </h3>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      
      {/* Metric preview */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse"></div>
        <span className="text-xs text-gray-500">{dashboardMeta.metric}</span>
      </div>
      
      <div className="mt-auto flex items-center text-primary-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
        {dashboardMeta.cta}
      </div>
    </a>
  )
}
