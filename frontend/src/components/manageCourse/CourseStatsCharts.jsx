import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, LineChart, Line } from 'recharts'

export default function CourseStatsCharts({ grades }) {
  if (!grades) return null
  // Pie chart data
  const passing = grades.filter(g => g.status === 'pass').length
  const failing = grades.filter(g => g.status === 'fail').length
  const chartData = [
    { name: 'Passing', value: passing },
    { name: 'Failing', value: failing },
  ]
  const COLORS = ['#34d399', '#f87171']
  // Bar/Line chart data
  const gradeDist = grades.filter(g => typeof g.grade === 'number').map(g => g.grade)
  const gradeDistData = [
    { name: '90+', value: gradeDist.filter(g => g >= 90).length },
    { name: '80-89', value: gradeDist.filter(g => g >= 80 && g < 90).length },
    { name: '70-79', value: gradeDist.filter(g => g >= 70 && g < 80).length },
    { name: '60-69', value: gradeDist.filter(g => g >= 60 && g < 70).length },
    { name: '<60', value: gradeDist.filter(g => g < 60).length },
  ]
  // Line chart: grade trend (stub, replace with real data)
  const lineData = grades.map((g, i) => ({ name: `S${i+1}`, grade: g.grade || 0 }))
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">Passing vs Failing</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {chartData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} itemStyle={{ color: '#4a5568' }} />
            <Legend wrapperStyle={{ color: '#718096' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">Grade Distribution</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={gradeDistData}>
            <XAxis dataKey="name" tick={{ fill: '#718096' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#718096' }} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} itemStyle={{ color: '#4a5568' }} cursor={{ fill: 'rgba(99, 102, 241, 0.2)' }}/>
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-indigo-700 mb-4">Grade Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" tick={{ fill: '#718096' }} />
            <YAxis tick={{ fill: '#718096' }} />
            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} itemStyle={{ color: '#4a5568' }} />
            <Line type="monotone" dataKey="grade" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}