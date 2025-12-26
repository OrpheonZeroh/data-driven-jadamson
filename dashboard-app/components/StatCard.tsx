import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  description?: string
}

export default function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-success' : 'text-error'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {trend.value}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-600/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary-500" />
        </div>
      </div>
    </div>
  )
}
