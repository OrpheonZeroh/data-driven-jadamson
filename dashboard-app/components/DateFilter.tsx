'use client'

import { Calendar } from 'lucide-react'
import { useState } from 'react'

interface DateFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void
  label?: string
  minDate?: string
  maxDate?: string
  availableDates?: string[]  // Array of available dates to enable
}

export default function DateFilter({ onFilterChange, label = 'Filter by Date', minDate, maxDate, availableDates }: DateFilterProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApply = () => {
    if (startDate && endDate) {
      onFilterChange(startDate, endDate)
    }
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    onFilterChange('', '')
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">{label}</h3>
        </div>
        {minDate && maxDate && (
          <div className="text-xs text-gray-500">
            Available: {minDate} to {maxDate}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
