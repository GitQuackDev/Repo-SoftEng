import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/globalComponents/Sidebar'
import LoginPage from './pages/globalPage/LoginPage'
import MainLayout from './components/globalComponents/MainLayout'
import CourseList from './pages/studentPage/CourseList'
import Course from './pages/studentPage/Course'
import ManageCourse from './pages/ProfessorPage/ManageCourse'
import ProfCourseDashboard from './pages/ProfessorPage/ProfCourseDashboard'
import Admin from './pages/adminPage/Admin'
import DiscussionBoard from './pages/globalPage/DiscussionBoard'
import Profile from './pages/globalPage/Profile'
import Settings from './pages/globalPage/Settings'
import LearningMaterials from './pages/ProfessorPage/LearningMaterials'
import Grading from './pages/ProfessorPage/Grading'
import { isAuthenticated, subscribe } from './auth'
import ProtectedRoute from './components/ProtectedRoute'
import CnnAi from './pages/globalPage/CnnAi'
import LessonPage from './pages/studentPage/LessonPage'
import DiscussionDetails from './components/globalComponents/discussionForum/DiscussionDetails'

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(isAuthenticated())
  const [role, setRole] = React.useState('student') // TODO: Replace with real role logic
  const [userName] = React.useState('Jane Doe')

  React.useEffect(() => {
    const unsub = subscribe(auth => setIsLoggedIn(auth))
    return unsub
  }, [])

  return { isLoggedIn, role, userName }
}

function getUserRole() {
  const user = localStorage.getItem('user')
  if (!user) return null
  try {
    return JSON.parse(user).role
  } catch {
    return null
  }
}

function AppRoutes() {
  const role = getUserRole()
  if (!role) {
    // Not logged in, always show login page
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Student routes */}
      {role === 'student' && (
        <>
          <Route path="/" element={<ProtectedRoute><MainLayout><Navigate to="/student/courses" /></MainLayout></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute><MainLayout><CourseList /></MainLayout></ProtectedRoute>} />
          <Route path="/student/course/:id" element={<ProtectedRoute><MainLayout><Course /></MainLayout></ProtectedRoute>} />
          <Route path="/student/course/:courseId/lesson/:lessonId" element={<ProtectedRoute><MainLayout><LessonPage /></MainLayout></ProtectedRoute>} />
          <Route path="/discussion" element={<ProtectedRoute><MainLayout><DiscussionBoard /></MainLayout></ProtectedRoute>} />
          <Route path="/discussion/:id" element={<ProtectedRoute><MainLayout><DiscussionDetails /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          <Route path="/cnn-ai" element={<ProtectedRoute><MainLayout><CnnAi /></MainLayout></ProtectedRoute>} />
        </>
      )}
      {/* Professor routes */}
      {role === 'professor' && (
        <>
          <Route path="/" element={<ProtectedRoute><MainLayout><Navigate to="/manage-course" /></MainLayout></ProtectedRoute>} />
          <Route path="/manage-course" element={<ProtectedRoute><MainLayout><ManageCourse /></MainLayout></ProtectedRoute>} />
          <Route path="/learning-materials" element={<ProtectedRoute><MainLayout><LearningMaterials /></MainLayout></ProtectedRoute>} />
          <Route path="/grading" element={<ProtectedRoute><MainLayout><Grading /></MainLayout></ProtectedRoute>} />
          <Route path="/discussion" element={<ProtectedRoute><MainLayout><DiscussionBoard /></MainLayout></ProtectedRoute>} />
          <Route path="/discussion/:id" element={<ProtectedRoute><MainLayout><DiscussionDetails /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          <Route path="/course/:courseId" element={<ProtectedRoute><MainLayout><ProfCourseDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/cnn-ai" element={<ProtectedRoute><MainLayout><CnnAi /></MainLayout></ProtectedRoute>} />
        </>
      )}
      {/* Admin routes */}
      {role === 'admin' && (
        <>
          <Route path="/" element={<ProtectedRoute><MainLayout><Navigate to="/admin" /></MainLayout></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><MainLayout><Admin /></MainLayout></ProtectedRoute>} />
          <Route path="/cnn-ai" element={<ProtectedRoute><MainLayout><CnnAi /></MainLayout></ProtectedRoute>} />
          <Route path="/discussion" element={<ProtectedRoute><MainLayout><DiscussionBoard /></MainLayout></ProtectedRoute>} />
          <Route path="/discussion/:id" element={<ProtectedRoute><MainLayout><DiscussionDetails /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        </>
      )}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  const { isLoggedIn, loading, error } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false) // Retained for Sidebar component

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('theme')
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700 font-sans text-lg">Loading authentication...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 font-sans text-lg p-4">Authentication Error: {error.message || 'Could not connect to server.'} Please try again later.</div>

  return (
    <Router>
      <div className={`min-h-screen ${isLoggedIn ? 'bg-slate-100' : 'bg-white'} font-sans`}>
        {isLoggedIn && (
          <>
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            {/* Navbar was previously rendered here or inside main, now completely removed */}
          </>
        )}
        <main className={`flex-1 ${isLoggedIn ? 'md:ml-[calc(16rem+20px)]' : ''}`}>
          {/* Navbar component rendering removed */}
          <AppRoutes />
        </main>
      </div>
    </Router>
  )
}
