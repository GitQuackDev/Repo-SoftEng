import React from 'react'

export default function ManageCourseTabs({ tab, setTab }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'learning', label: 'Lessons' },
    { key: 'submissions', label: 'Submissions' },
    { key: 'grading', label: 'Grading' },
  ]
  const tabIdx = tabs.findIndex(t => t.key === tab)
  return (
    <div className="flex w-full justify-center">
      <div className="relative flex rounded-full border border-gray-300 bg-gray-100 w-full max-w-2xl h-14 items-center">
        {/* Animated background for active tab */}
        <div
          className="absolute top-1 left-1 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 z-0"
          style={{ width: `calc(25% - 0.5rem)`, transform: `translateX(calc(${tabIdx} * 100% + ${tabIdx} * 0.5rem))` }}
        />
        {tabs.map((t, idx) => (
          <button
            key={t.key}
            className={`z-10 flex-1 h-full rounded-full text-lg font-semibold transition-all duration-200 relative${tab === t.key ? ' text-white' : ' text-indigo-600 hover:text-indigo-700'}`}
            style={{ letterSpacing: '0.01em' }}
            onClick={() => setTab(t.key)}
            type="button"
            tabIndex={0}
          >
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
