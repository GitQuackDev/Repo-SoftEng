import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, BrainCircuit, BookOpen, List, Settings, LogOut, GraduationCap, Menu, X } from 'lucide-react'
import { logout } from '../../auth'
import ProfCourseList from '../manageCourse/ProfCourseList'
import StudentCourseList from '../manageCourse/StudentCourseList'

const API = import.meta.env.VITE_API_URL || ''

// const courses = [
//   { id: 'cs101', name: 'CS101', details: 'Intro to Computer Science', professor: 'Prof. Smith' },
//   { id: 'math201', name: 'Math 201', details: 'Advanced Mathematics', professor: 'Prof. Doe' },
// ]

export default function Sidebar({ open = false, setOpen }) {
  const navigate = useNavigate()
  const [showCourseList, setShowCourseList] = useState(false)
  const [role, setRole] = useState('student')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.role) setRole(user.role)
    setUser(user)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (typeof logout === 'function') logout()
    navigate('/login', { replace: true })
  }

  // Responsive sidebar classes
  const sidebarBase = 'bg-white rounded-3xl shadow-2xl z-40 transition-all duration-300 flex flex-col justify-between border border-slate-200'
  const sidebarDesktop = 'fixed left-0 top-0 w-64 md:flex hidden'
  const sidebarMobile = `fixed top-0 left-0 w-64 flex md:hidden ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300'`

  // Add hamburger button for mobile
  useEffect(() => {
    // Close sidebar on route change (optional, for better UX)
    const closeSidebar = () => setOpen && setOpen(false)
    window.addEventListener('popstate', closeSidebar)
    return () => window.removeEventListener('popstate', closeSidebar)
  }, [setOpen])

  return (
    <>
      {/* Hamburger button for mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full p-2 shadow-lg border border-slate-200"
        aria-label="Open sidebar menu"
        onClick={() => setOpen && setOpen(true)}
        style={{ display: open ? 'none' : undefined }}
      >
        <Menu className="w-7 h-7 text-sky-700" />
      </button>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          aria-label="Sidebar overlay"
          onClick={() => setOpen && setOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={open ? `${sidebarBase} ${sidebarMobile}` : `${sidebarBase} ${sidebarDesktop}`}
        aria-label="Sidebar navigation"
        tabIndex={-1}
        style={{ margin: 10, height: 'calc(100vh - 20px)', maxHeight: 'calc(100vh - 20px)', overflow: 'hidden' }}
      >
        {/* Close button for mobile */}
        {open && (
          <button
            className="absolute top-4 right-4 z-50 md:hidden bg-white rounded-full p-2 shadow border border-slate-200"
            aria-label="Close sidebar menu"
            onClick={() => setOpen && setOpen(false)}
          >
            <X className="w-6 h-6 text-sky-700" />
          </button>
        )}
        <div>
          <div className="flex items-center justify-center h-20 border-b border-slate-200">
            <span className="flex items-center gap-2 text-2xl font-bold text-sky-700 tracking-widest">
              <GraduationCap className="w-7 h-7 text-sky-600" /> LMS
            </span>
          </div>
          <nav className="flex flex-col gap-1 mt-4">
            <div className="px-6 text-xs text-slate-500 mb-2 tracking-widest font-medium">MENU</div>
            <NavLink to="/discussion" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}> <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>Discussion</span> </NavLink>
            {(role === 'student' || role === 'professor' || role === 'admin') && (
              <NavLink to="/cnn-ai" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}> <BrainCircuit className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>CNN Ai</span> </NavLink>
            )}
            {role === 'student' && (
              <>
                <div className="px-6 text-xs text-slate-500 mt-4 mb-2 tracking-widest font-medium">COURSE</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseList(v => !v)
                    navigate('/student/courses')
                  }}
                  className="flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-sky-700 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 group"
                >
                  <BookOpen className="w-5 h-5 text-slate-400 group-hover:text-sky-600" />
                  <span>Course</span>
                  <svg className={`ml-auto w-4 h-4 transition-transform text-slate-400 group-hover:text-sky-600 ${showCourseList ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                {showCourseList && (
                  <div className="ml-10 flex flex-col gap-1 pl-3 border-l border-slate-200" id="student-course-list-sidebar">
                    <StudentCourseList />
                  </div>
                )}
              </>
            )}
            {role === 'professor' && (
              <>
                <NavLink to="/manage-course" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}> <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>Manage Course</span> </NavLink>
                <button type="button" onClick={() => setShowCourseList(v => !v)} className="flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-sky-700 w-full focus:outline-none focus:ring-2 focus:ring-sky-500 group"> <List className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>Course List</span> <svg className={`ml-auto w-4 h-4 transition-transform text-slate-400 group-hover:text-sky-600 ${showCourseList ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg> </button>
                {showCourseList && (
                  <div className="ml-10 flex flex-col gap-1 pl-3 border-l border-slate-200" id="prof-course-list-sidebar">
                    {/* Dynamic course list for professor will be rendered here by ProfCourseList */}
                    <ProfCourseList />
                  </div>
                )}
              </>
            )}
            {role === 'admin' && (
              <>
                <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}>
                  <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>Admin</span>
                </NavLink>
                <NavLink to="/cnn-ai" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}>
                  <BrainCircuit className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>CNN Ai</span>
                </NavLink>
              </>
            )}
            <div className="px-6 text-xs text-slate-500 mt-4 mb-2 tracking-widest font-medium">GENERAL</div>
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}> <Settings className="w-5 h-5 text-slate-400 group-hover:text-sky-600" /> <span>Settings</span> </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group relative text-base font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 ${isActive ? 'bg-sky-100 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-sky-700'}`}>
              <span className="relative w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
                {user?.avatar ? (
                  <img src={`${API}${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JD'
                )}
              </span>
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md transition-all duration-300 mb-4 mx-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"> <LogOut className="w-5 h-5" /> <span>Logout</span> </button>
      </aside>
    </>
  )
}
