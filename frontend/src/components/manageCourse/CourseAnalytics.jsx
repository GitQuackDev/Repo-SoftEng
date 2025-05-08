import React from 'react'
import CourseStatsCharts from './CourseStatsCharts'

export default function CourseAnalytics({ course }) {
  // You can add more analytics visualizations here as needed
  return (
    <div className="space-y-8 bg-gray-100 rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-indigo-700 mb-4">Course Analytics & Reports</h2>
      <CourseStatsCharts grades={course.grades || []} />
      {/* Add more analytics: enrollment, submissions, etc. */}
    </div>
  )
}
