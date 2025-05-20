import React, { useState } from 'react'

const API = import.meta.env.VITE_API_URL || '';

export default function StudentSubmissionDetail({ assignment, user, onBack }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sub, setSub] = useState(
    (assignment.submissions || []).find(s => String(s.student) === String(user._id) || s.student?._id === user._id) || null
  )
  const now = new Date()
  const due = assignment.dueDate ? new Date(assignment.dueDate) : null
  const isClosed = assignment.status === 'Closed'
  const isLate = due && now > due && (!sub || !sub.submittedAt || new Date(sub.submittedAt) > due)
  const canSubmit = !isClosed && (!due || now <= due)

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
      const res = await fetch(`${API}/api/submission/${assignment._id}/submit`, {
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
      const res = await fetch(`${API}/api/submission/${assignment._id}/unsubmit`, {
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

  return (
    <div className="p-8 max-w-lg mx-auto bg-white dark:bg-[#23243a] rounded-2xl shadow-lg text-gray-800 dark:text-gray-100">
      <button onClick={onBack} className="mb-4 text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Submissions</button>
      <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-2">{assignment.title}</div>
      <div className="text-gray-600 dark:text-gray-300 mb-2">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'N/A'}</div>
      <div className="text-gray-500 dark:text-gray-400 mb-2">Status: {assignment.status}</div>
      {isLate && <div className="text-yellow-600 dark:text-yellow-400 mb-2">Late</div>}
      {sub && sub.status === 'Submitted' && <div className="text-green-600 dark:text-green-400 mb-2">Submitted at: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}</div>}
      {sub && sub.grade !== undefined && <div className="text-green-500 dark:text-green-300 mb-2">Grade: {sub.grade}</div>}
      {sub && sub.feedback && <div className="text-yellow-500 dark:text-yellow-300 mb-2">Feedback: {sub.feedback}</div>}
      {error && <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-600 dark:text-green-400 mb-2">{success}</div>}
      <div className="mb-4">
        {sub && sub.fileUrl && (
          <div className="mb-2 flex items-center gap-2">
            <a href={sub.fileUrl} download className="text-blue-600 dark:text-blue-400 underline text-xs">Download submitted file</a>
            {canSubmit && <button onClick={handleUnsubmit} className="text-red-600 dark:text-red-400 text-xs ml-2">Unsubmit</button>}
          </div>
        )}
        {canSubmit && (
          <div className="flex flex-col gap-2">
            <input type="file" onChange={handleFileChange} disabled={uploading} className="text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50" />
            {file && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">{file.name}</span>
                <button onClick={handleRemoveFile} className="text-red-600 dark:text-red-400 text-xs">Remove</button>
              </div>
            )}
            <button onClick={handleSubmit} disabled={uploading || !file} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50">Submit</button>
          </div>
        )}
        {!canSubmit && !sub && <div className="text-gray-500 dark:text-gray-400">Submission is closed or late. You cannot submit.</div>}
      </div>
    </div>
  )
}
