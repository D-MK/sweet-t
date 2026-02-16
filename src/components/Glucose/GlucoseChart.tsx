import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { GlucoseReading } from '@/types'
import { formatTime } from '@/lib/utils'

interface GlucoseChartProps {
  readings: GlucoseReading[]
  targetMin?: number
  targetMax?: number
}

export default function GlucoseChart({ readings, targetMin = 80, targetMax = 140 }: GlucoseChartProps) {
  const chartData = useMemo(() => {
    return [...readings]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((r) => ({
        time: r.timestamp,
        label: formatTime(r.timestamp),
        value: r.unit === 'mmol/L' ? r.value * 18 : r.value,
        originalValue: r.value,
        unit: r.unit,
      }))
  }, [readings])

  if (chartData.length < 2) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500 text-sm">
        Add at least 2 readings to see a chart
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Glucose Trend (mg/dL)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
            }}
            formatter={(val, _name, props) => {
              const entry = (props as any).payload
              if (entry.unit === 'mmol/L') {
                return [`${entry.originalValue} mmol/L (${val} mg/dL)`, 'Glucose']
              }
              return [`${val} mg/dL`, 'Glucose']
            }}
          />
          <ReferenceLine
            y={targetMin}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: 'Low', position: 'left', fontSize: 11, fill: '#22c55e' }}
          />
          <ReferenceLine
            y={targetMax}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'High', position: 'left', fontSize: 11, fill: '#f59e0b' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
