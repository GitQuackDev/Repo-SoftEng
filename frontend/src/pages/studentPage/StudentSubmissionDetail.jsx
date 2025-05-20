import React, { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || '';

export default function StudentSubmissionDetail({ submissionId, onBack }) {
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sub, setSub] = useState(null) // Represents the student's specific submission for this assignment
  const user = JSON.parse(localStorage.getItem('user') || '{}'); // Get user from localStorage

  const now = new Date()
  // Access properties directly from submission, not submission.assignment
  const due = submission?.dueDate ? new Date(submission.dueDate) : null
  const isClosed = submission?.status === 'Closed'
  const isLate = due && now > due && (!sub || !sub.submittedAt || new Date(sub.submittedAt) > due)
  const alreadySubmitted = sub && sub.status === 'Submitted';
  const canSubmit = !isClosed && (!due || now <= due) && !alreadySubmitted;

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true); // Ensure loading is true at the start of fetch
      setError(''); // Clear previous errors
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API}/api/submission/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `Server error: ${res.status}` }));
          throw new Error(errorData.message || `Failed to fetch submission details. Status: ${res.status}`);
        }
        const data = await res.json()
        if (!data.data) {
          throw new Error("Submission data not found in response");
        }
        setSubmission(data.data) // data.data is the assignment object
        // Find the current student's submission within the assignment's submissions array
        setSub((data.data.submissions || []).find(s => s.student && (String(s.student._id) === String(user.id) || String(s.student) === String(user.id))) || null);
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError(err.message)
      }
      setLoading(false)
    }
    if (submissionId && user.id) { // Ensure submissionId and user.id are available
        fetchSubmission()
    } else {
        setLoading(false);
        if (!submissionId) setError("Submission ID is missing.");
        if (!user.id) setError("User ID is missing. Please log in.");
    }
  }, [submissionId, user.id]) // Add user.id to dependency array

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
      // Use submission._id (which is the assignment ID)
      const res = await fetch(`${API}/api/submission/${submission._id}/submit`, {
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
      // Use submission._id (which is the assignment ID)
      const res = await fetch(`${API}/api/submission/${submission._id}/unsubmit`, {
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

  if (error) return <div className="text-center text-red-600 py-10">Error: {error}</div> // Adjusted for light mode
  if (loading) return <div className="text-center text-gray-600 py-10">Loading submission...</div> // Adjusted for light mode
  if (!submission) return <div className="text-center text-gray-600 py-10">No submission details found.</div> // Adjusted for light mode

  return (
    <div className="bg-gray-50 shadow-xl rounded-2xl p-8 max-w-2xl mx-auto my-8 border border-gray-300">
      <button onClick={onBack} className="mb-6 text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center">
        &larr; Back to Submissions
      </button>
      <h2 className="text-2xl font-bold text-sky-700 mb-3">{submission.title}</h2>
      <div className="text-sm text-slate-600 mb-1">Due: {submission.dueDate ? new Date(submission.dueDate).toLocaleString() : 'N/A'}</div>
      <div className="text-sm text-slate-600 mb-4">Status: <span className={`font-medium ${submission.status === 'Closed' ? 'text-red-600' : 'text-slate-700'}`}>{submission.status}</span></div>

      {isLate && !alreadySubmitted && <div className="mb-3 p-2.5 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md">This assignment is past due. Submissions may be marked as late.</div>}
      {sub && sub.status === 'Submitted' &&
        <div className="mb-3 p-2.5 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">
          Submitted at: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
        </div>
      }
      {sub && sub.grade !== undefined &&
        <div className="mb-3 p-2.5 text-sm text-sky-700 bg-sky-100 border border-sky-300 rounded-md">
          Grade: <span className="font-bold">{sub.grade}</span>
        </div>
      }
      {sub && sub.feedback &&
        <div className="mb-3 p-2.5 text-sm text-amber-700 bg-amber-100 border border-amber-300 rounded-md">
          Feedback: {sub.feedback}
        </div>
      }
      {error && <div className="mb-3 p-2.5 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">{error}</div>}
      {success && <div className="mb-3 p-2.5 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">{success}</div>}

      <div className="mt-6 pt-6 border-t border-slate-300">
        {sub && sub.fileUrl && (
          <div className="mb-4 p-3 bg-slate-100 rounded-md border border-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Your Submission:</p>
                <a href={sub.fileUrl} download className="text-sky-600 hover:text-sky-700 underline text-sm">
                  Download submitted file
                </a>
              </div>
              {/* Allow unsubmit only if not closed and not past due (unless already submitted, then allow unsubmit) */}
              {(!isClosed && (!due || now <= due) || alreadySubmitted) && !isClosed &&
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

        {canSubmit && !alreadySubmitted && (
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-1">Upload new file:</label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 transition-colors cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center justify-between p-2 bg-slate-100 rounded-md border border-slate-300">
                <span className="text-xs text-slate-700 truncate pr-2">{file.name}</span>
                <button onClick={handleRemoveFile} className="text-red-600 hover:text-red-700 text-xs font-medium">Remove</button>
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
        {!canSubmit && !alreadySubmitted && !isClosed && (due && now > due) && <div className="mt-4 p-3 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md">The deadline has passed. You can no longer submit.</div>}
        {!canSubmit && !alreadySubmitted && isClosed && <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">This assignment is closed. You cannot submit at this time.</div>}
        {alreadySubmitted && <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">You have already submitted this assignment. Unsubmit to make changes.</div>}
      </div>
    </div>
  )
}
