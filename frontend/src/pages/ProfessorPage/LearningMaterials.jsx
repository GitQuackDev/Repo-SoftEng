import React, { useState } from 'react'
import LessonList from '../../components/manageCourse/LessonList'

export default function LearningMaterials({ courseId, refreshCourse }) {
  // Pass courseId and refreshCourse from parent (ProfCourseDashboard)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Learning Materials</h1>
      <LessonList courseId={courseId} refreshCourse={refreshCourse} />
    </div>
  )
}
