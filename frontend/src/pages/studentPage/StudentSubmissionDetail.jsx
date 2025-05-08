import React, { useState, useEffect } from 'react'

export default function StudentSubmissionDetail({ submissionId, onBack }) {
  const [submission, setSubmission] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sub, setSub] = useState(null)
  const now = new Date()
  const due = submission?.assignment?.dueDate ? new Date(submission.assignment.dueDate) : null
  const isClosed = submission?.assignment?.status === 'Closed'
  const isLate = due && now > due && (!sub || !sub.submittedAt || new Date(sub.submittedAt) > due)
  const canSubmit = !isClosed && (!due || now <= due)

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`http://localhost:5000/api/submission/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch submission details')
        const data = await res.json()
        setSubmission(data.data)
        setSub((data.data.submissions || []).find(s => String(s.student) === String(user._id) || s.student?._id === user._id) || null)
      } catch (err) {
        setError(err.message)
      }
      setLoading(false)
    }
    fetchSubmission()
  }, [submissionId])

  const handleFileChange = e => {
    setFile(e.target.files[0])
    setError('')
    setSuccess('')
  }

  const handleSubmit = async () => {
    if (!file) return setError('Please select a file to submit.')
    setUploading(true)
    setError('')
    setSuccess('')
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch(`http://localhost:5000/api/submission/${submission.assignment._id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSuccess('Submitted!')
      setSub({ ...sub, fileUrl: URL.createObjectURL(file), status: 'Submitted', submittedAt: new Date().toISOString() })
      setFile(null)
    } catch {
      setError('Failed to submit file')
    }
    setUploading(false)
  }

  const handleUnsubmit = async () => {
    setUploading(true)
    setError('')
    setSuccess('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:5000/api/submission/${submission.assignment._id}/unsubmit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to unsubmit')
      setSuccess('Unsubmitted!')
      setSub(null)
    } catch {
      setError('Failed to unsubmit')
    }
    setUploading(false)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError('')
    setSuccess('')
  }

  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400 py-10">Loading submission...</div>
  if (error) return <div className="text-center text-red-500 dark:text-red-400 py-10">Error: {error}</div>
  if (!submission) return <div className="text-center text-gray-500 dark:text-gray-400 py-10">No submission details found.</div>

  return (
    <div className="bg-white dark:bg-[#23243a] shadow-xl rounded-2xl p-8 max-w-2xl mx-auto my-8 border border-gray-200 dark:border-[#35365a]">
      <button onClick={onBack} className="mb-6 text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center">
        &larr; Back to Submissions
      </button>
      <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-300 mb-3">{submission.assignment.title}</h2>
      <div className="text-sm text-slate-500 mb-1">Due: {submission.assignment.dueDate ? new Date(submission.assignment.dueDate).toLocaleString() : 'N/A'}</div>
      <div className="text-sm text-slate-500 mb-4">Status: <span className={`font-medium ${submission.assignment.status === 'Closed' ? 'text-red-600' : 'text-slate-700'}`}>{submission.assignment.status}</span></div>

      {isLate && <div className="mb-3 p-2.5 text-sm text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-md">This submission is late.</div>}
      {sub && sub.status === 'Submitted' && 
        <div className="mb-3 p-2.5 text-sm text-green-700 bg-green-50 border border-green-300 rounded-md">
          Submitted at: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
        </div>
      }
      {sub && sub.grade !== undefined && 
        <div className="mb-3 p-2.5 text-sm text-sky-700 bg-sky-50 border border-sky-300 rounded-md">
          Grade: <span className="font-bold">{sub.grade}</span>
        </div>
      }
      {sub && sub.feedback && 
        <div className="mb-3 p-2.5 text-sm text-amber-700 bg-amber-50 border border-amber-300 rounded-md">
          Feedback: {sub.feedback}
        </div>
      }
      {error && <div className="mb-3 p-2.5 text-sm text-red-700 bg-red-50 border border-red-300 rounded-md">{error}</div>}
      {success && <div className="mb-3 p-2.5 text-sm text-green-700 bg-green-50 border border-green-300 rounded-md">{success}</div>}

      <div className="mt-6 pt-6 border-t border-slate-200">
        {sub && sub.fileUrl && (
          <div className="mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Your Submission:</p>
                <a href={sub.fileUrl} download className="text-sky-600 hover:text-sky-700 underline text-sm">
                  Download submitted file
                </a>
              </div>
              {canSubmit && 
                <button 
                  onClick={handleUnsubmit} 
                  disabled={uploading}
                  className="text-red-600 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Unsubmit'}
                </button>
              }
            </div>
          </div>
        )}

        {canSubmit && (
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-1">Upload new file:</label>
              <input 
                id="file-upload"
                type="file" 
                onChange={handleFileChange} 
                disabled={uploading} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-colors cursor-pointer" 
              />
            </div>
            {file && (
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-200">
                <span className="text-xs text-slate-600 truncate pr-2">{file.name}</span>
                <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-600 text-xs font-medium">Remove</button>
              </div>
            )}
            <button 
              onClick={handleSubmit} 
              disabled={uploading || !file} 
              className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-md font-semibold shadow-sm hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Assignment'}
            </button>
          </div>
        )}
        {!canSubmit && !sub && <div className="mt-4 p-3 text-sm text-slate-600 bg-slate-100 border border-slate-200 rounded-md">Submission is closed or the deadline has passed. You cannot submit at this time.</div>}
      </div>
    </div>
  )
}
