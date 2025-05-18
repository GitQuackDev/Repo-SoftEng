import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import StudentCoursetab from '../../components/manageCourse/StudentCoursetab'

export default function Course() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCourse = useCallback(() => {
    setLoading(true)
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/course/${id}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setCourse(data.data)
      })
      .catch(err => {
        setCourse(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, navigate, location.pathname])

  useEffect(() => {
    fetchCourse()
  }, [id, fetchCourse])

  if (loading && !course) return <div className="p-6 text-base text-slate-500 font-sans">Loading course...</div>
  if (!course && !loading) return <div className="p-6 text-base text-red-600 font-sans">Course not found or failed to load.</div>

  return <StudentCoursetab course={course} />
}