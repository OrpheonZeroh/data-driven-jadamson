'use client'

import { 
  LineChart as RechartsLine, 
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  Line, 
  Bar,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

interface ChartData {
  [key: string]: any
}

interface LineChartProps {
  data: ChartData[]
  xKey: string
  yKey: string
  color?: string
}

interface BarChartProps {
  data: ChartData[]
  xKey: string
  yKey: string
  color?: string
}

interface PieChartProps {
  data: { name: string; value: number }[]
}

export function LineChart({ data, xKey, yKey, color = '#0ea5e9' }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data to display</div>
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey={xKey} 
          stroke="#9ca3af"
          style={{ fontSize: '10px' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="#9ca3af"
          style={{ fontSize: '10px' }}
          tickFormatter={(value) => smartFormat(value, yKey)}
          width={60}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value: any) => smartFormat(value, yKey)}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Line 
          type="monotone" 
          dataKey={yKey} 
          stroke={color} 
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLine>
    </ResponsiveContainer>
  )
}

export function BarChart({ data, xKey, yKey, color = '#10b981' }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data to display</div>
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBar data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey={xKey} 
          stroke="#9ca3af"
          style={{ fontSize: '10px' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="#9ca3af"
          style={{ fontSize: '10px' }}
          tickFormatter={(value) => smartFormat(value, yKey)}
          width={60}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value: any) => smartFormat(value, yKey)}
        />
        <Legend wrapperStyle={{ color: '#9ca3af' }} />
        <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  )
}

// Format large numbers for display
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`
  }
  return `$${num.toFixed(0)}`
}

// Smart formatter for tooltips - detects context
function smartFormat(value: any, key?: string): string {
  const num = Number(value)
  
  // Handle percentages
  if (key && (key.toLowerCase().includes('rate') || key.toLowerCase().includes('ratio') || key.toLowerCase().includes('%'))) {
    return `${num.toFixed(1)}%`
  }
  
  // Handle currency/money values
  if (key && (key.toLowerCase().includes('price') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('spend') || key.toLowerCase().includes('arpu') || key.toLowerCase().includes('cac') || key.toLowerCase().includes('clv'))) {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`
    }
    return `$${num.toFixed(2)}`
  }
  
  // Handle large counts
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  
  // Default: show with decimals if needed
  return num % 1 === 0 ? num.toString() : num.toFixed(2)
}

export function PieChart({ data }: PieChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data to display</div>
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const { name, percent } = props
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
            return (
              <text
                x={props.x}
                y={props.y}
                fill="#ffffff"
                textAnchor={props.x > props.cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 500 }}
              >
                {`${name} ${((percent || 0) * 100).toFixed(0)}%`}
              </text>
            )
          }}
          outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#ffffff'
          }}
          itemStyle={{
            color: '#ffffff'
          }}
          labelStyle={{
            color: '#ffffff'
          }}
          formatter={(value: any) => formatNumber(Number(value))}
        />
      </RechartsPie>
    </ResponsiveContainer>
  )
}
