import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart } from '@/components/Charts'

export default function YearOverYear() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetchYoYData()
  }, [])

  const fetchYoYData = async () => {
    const { data: yearlyData, error } = await supabase
      .from('retail_yearly_kpis')
      .select('*')
      .order('year', { ascending: true })

    if (!error && yearlyData) setData(yearlyData)
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-white mb-4">Year Over Year Revenue</h3>
      <LineChart data={data} xKey="year" yKey="revenue" color="#0ea5e9" />
    </div>
  )
}
