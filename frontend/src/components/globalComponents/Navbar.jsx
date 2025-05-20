import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react' // Removed Sun, Moon icons

const API = import.meta.env.VITE_API_URL || '';

export default function Navbar({ onToggleSidebar }) {
  const [user, setUser] = useState(null)
  // Removed isDark state and related logic

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    setUser(storedUser)
    // Removed theme loading logic
    document.documentElement.classList.remove('dark') // Ensure dark mode is removed
    localStorage.removeItem('theme') // Remove theme from local storage
  }, [])

  // Removed toggleTheme function

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 rounded-b-3xl mx-3 mb-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger menu for mobile */}
          <button
            className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Spacer for desktop when sidebar is present */}
          <div className="hidden md:block w-64 flex-shrink-0"></div>
          {/* Search (optional) - hidden for now */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            {/* Search input removed for brevity, was previously commented out */}
          </div>
          {/* User Info */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Theme Toggle Button Removed */}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.name}</span>
                <span className="relative w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden border-2 border-white shadow-sm">
                  {user.avatar ? (
                    <img src={`${API}${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JD'
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}