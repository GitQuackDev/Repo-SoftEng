import React, { useEffect, useState } from 'react'
import StudentSubmissionDetail from './StudentSubmissionDetail'

export default function StudentSubmission({ course }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!course?._id) return
    setLoading(true)
    fetch(`http://localhost:5000/api/submission/course/${course._id}`)
      .then(async res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return []
        return res.json()
      })
      .then(assignmentsData => {
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      })
      .finally(() => setLoading(false))
  }, [course])

  if (loading) return <div className="p-6 text-base text-slate-500 font-sans">Loading submissions...</div>
  if (selectedAssignment) {
    return <StudentSubmissionDetail assignment={selectedAssignment} user={user} onBack={() => setSelectedAssignment(null)} />
  }
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-sky-700 mb-6">My Submissions</h1>
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        {assignments.length === 0 && <div className="p-6 text-slate-500">No assignments found for this course.</div>}
        <ul className="divide-y divide-slate-200">
          {assignments.map((a, idx) => {
            const mySub = (a.submissions || []).find(s => String(s.student) === String(user._id) || s.student?._id === user._id)
            const dueDate = a.dueDate ? new Date(a.dueDate) : null;
            const isLate = dueDate && new Date() > dueDate && (!mySub || !mySub.submittedAt || new Date(mySub.submittedAt) > dueDate);
            let statusText = mySub?.status || 'Not Submitted';
            let statusColor = 'text-slate-500';
            if (mySub?.status === 'Submitted') {
              statusText = `Submitted ${isLate ? '(Late)' : ''}`;
              statusColor = isLate ? 'text-amber-600' : 'text-green-600';
            } else if (isLate) {
              statusText = 'Overdue';
              statusColor = 'text-red-600';
            }

            return (
              <li key={a._id} className="p-4 hover:bg-slate-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-grow">
                    <span className="font-semibold text-sky-700 text-base group-hover:text-sky-800">{a.title}</span>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Due: {dueDate ? dueDate.toLocaleDateString() : 'N/A'}
                      <span className="mx-1.5">|</span>
                      Status: <span className={`font-medium ${statusColor}`}>{statusText}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-2 sm:mt-0 flex-shrink-0">
                    {mySub?.fileUrl && 
                      <a 
                        href={mySub.fileUrl} 
                        download 
                        className="text-sky-600 hover:text-sky-700 underline font-medium"
                        onClick={(e) => e.stopPropagation()} // Prevent li click when downloading
                      >
                        Download
                      </a>
                    }
                    {mySub?.grade !== undefined && 
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                        Grade: {mySub.grade}
                      </span>
                    }
                    {mySub?.feedback && 
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium truncate max-w-[100px] sm:max-w-[150px]" title={mySub.feedback}>
                        Feedback: {mySub.feedback}
                      </span>
                    }
                  </div>
                  <button 
                    onClick={() => setSelectedAssignment(a)} 
                    className="ml-auto sm:ml-4 mt-2 sm:mt-0 px-3.5 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-md shadow-sm hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                  >
                    View/Submit
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}