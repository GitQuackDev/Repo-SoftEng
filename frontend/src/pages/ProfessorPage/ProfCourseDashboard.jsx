import React, { useState, useEffect } from 'react'
import ManageCourseTabs from '../../components/manageCourse/ManageCourseTabs'
import CourseHeader from '../../components/manageCourse/CourseHeader'
import CourseAnalytics from '../../components/manageCourse/CourseAnalytics'
import StudentList from '../../components/manageCourse/StudentList'
import EnrollStudentForm from '../../components/manageCourse/EnrollStudentForm'
import LessonList from '../../components/manageCourse/LessonList'
import { useParams } from 'react-router-dom'
import ProfSubmission from './ProfSubmission'
import Grading from './Grading'

const API = import.meta.env.VITE_API_URL || '';

export default function ProfCourseDashboard() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollMsg, setEnrollMsg] = useState('')
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    fetchCourse()
  }, [courseId])

  const fetchCourse = async () => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/api/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) setError(data.msg || 'Failed to fetch course')
      else setCourse(data.data)
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  // Enroll student handler
  const handleEnroll = async (email, resetEmail) => {
    setEnrollLoading(true)
    setEnrollMsg('')
    setError('')
    const token = localStorage.getItem('token')
    // Find user by email
    let userRes = await fetch(`${API}/api/user/by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email })
    })
    let userData = await userRes.json()
    if (!userRes.ok || !userData.user) {
      setError(userData.msg || 'Student not found')
      setEnrollLoading(false)
      return
    }
    // Enroll student
    let enrollRes = await fetch(`${API}/api/course/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId: userData.user._id })
    })
    let enrollData = await enrollRes.json()
    if (!enrollRes.ok) setError(enrollData.msg || 'Failed to enroll')
    else {
      setEnrollMsg('Student enrolled!')
      resetEmail('')
      fetchCourse()
    }
    setEnrollLoading(false)
  }

  // Remove student
  const handleRemove = async studentId => {
    setError('')
    setEnrollMsg('')
    const token = localStorage.getItem('token')
    let res = await fetch(`${API}/api/course/${courseId}/enroll/${studentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    let data = await res.json()
    if (!res.ok) setError(data.msg || 'Failed to remove student')
    else fetchCourse()
  }

  // Toast auto-hide
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3500)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <>
      {/* Fixed tab bar at the very top of the container, always visible and above all content */}
      <div className="sticky top-0 z-50 bg-gray-100 rounded-t-3xl pb-2 w-full border-b border-gray-300"> {/* Changed background to bg-gray-100 and border to border-gray-300 */}
        <ManageCourseTabs tab={tab} setTab={setTab} />
      </div>
      {error && (
        <div className="fixed bottom-8 right-8 z-[9999] min-w-[300px] max-w-sm bg-[#721c24] border border-red-700 text-white px-6 py-4 rounded-md flex items-center shadow-2xl transition-transform duration-200 animate-slide-in-toast hover:scale-105 hover:shadow-3xl group" style={{ boxShadow: '0 8px 24px 0 rgba(0,0,0,0.25)' }}>
          <svg className="w-6 h-6 mr-3 flex-shrink-0 text-red-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#f8d7da"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" stroke="#721c24" /></svg>
          <div className="flex-1">
            <span className="font-bold text-lg text-[#f8d7da]">Oh snap! </span>
            <span className="text-[#f8d7da]">{error}</span>
          </div>
          <button onClick={() => setError('')} className="ml-4 text-2xl text-[#f8d7da] hover:text-white focus:outline-none transition-colors duration-200" aria-label="Close" tabIndex={0}>&times;</button>
        </div>
      )}
      {loading ? <div className="text-center py-10">Loading...</div> : course && (
        <div className="w-full">
          {tab === 'dashboard' && (
            <>
              <CourseHeader course={course} />
              <CourseAnalytics course={course} />
              <EnrollStudentForm onEnroll={handleEnroll} loading={enrollLoading} error={error} enrollMsg={enrollMsg} />
              <StudentList students={course.enrolled || []} grades={course.grades || []} onRemove={handleRemove} />
            </>
          )}
          {tab === 'learning' && (
            <LessonList courseId={courseId} course={course} refreshCourse={fetchCourse} />
          )}
          {tab === 'submissions' && (
            <ProfSubmission courseId={courseId} course={course} refreshCourse={fetchCourse} />
          )}
          {tab === 'grading' && (
            <Grading courseId={courseId} course={course} refreshCourse={fetchCourse} />
          )}
        </div>
      )}
    </>
  )
}

// Add this to your CSS (App.css or index.css):
// .animate-slide-in-toast { animation: slideInToast 0.5s cubic-bezier(0.4,0,0.2,1); }
// @keyframes slideInToast { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
