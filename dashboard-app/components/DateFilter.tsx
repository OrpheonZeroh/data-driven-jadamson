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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">{label}</h3>
        </div>
        {minDate && maxDate && (
          <div className="text-[10px] sm:text-xs text-gray-500">
            Available: {minDate} to {maxDate}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
        <div className="flex-1 min-w-full sm:min-w-[150px]">
          <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        
        <div className="flex-1 min-w-full sm:min-w-[150px]">
          <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="flex-1 sm:flex-none px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
