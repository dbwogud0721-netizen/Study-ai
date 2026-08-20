import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ScoreChartProps {
  data: { label: string; score: number }[]
  height?: number
  compact?: boolean
}

export function ScoreChart({ data, height = 160, compact = false }: ScoreChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: compact ? -24 : 0, bottom: 0 }}>
          {!compact && <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />}
          {!compact && <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />}
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
            labelStyle={{ fontWeight: 700 }}
          />
          <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} dot={{ r: 3, fill: '#6366F1' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
