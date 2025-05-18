import React, { useState, useEffect } from 'react'

export default function Grading({ courseId }) {
  const [assignments, setAssignments] = useState([])
  const [courseAssignmentsData, setCourseAssignmentsData] = useState([]) // Renamed from submissions
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [search, setSearch] = useState('')
  const [grading, setGrading] = useState(null)
  const [gradeVal, setGradeVal] = useState('')
  const [feedbackVal, setFeedbackVal] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')

    fetch(`http://localhost:5000/api/submission/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => { throw new Error(errData.error || `Failed to load data (status: ${res.status})`) });
        }
        return res.json();
      })
      .then(data => {
        const assignmentsArray = Array.isArray(data) ? data : [];
        setAssignments(assignmentsArray); // For the dropdown
        setCourseAssignmentsData(assignmentsArray); // For the table data source
        // Set initial selected assignment only if not already set by user or previous render
        if (assignmentsArray.length > 0 && !selectedAssignment) {
          setSelectedAssignment(assignmentsArray[0]._id);
        } else if (assignmentsArray.length === 0) {
          setSelectedAssignment('');
        }
      })
      .catch(err => {
        console.error("Error fetching course assignments:", err);
        setError(err.message || 'Failed to load assignments data.');
        setAssignments([]);
        setCourseAssignmentsData([]);
      })
      .finally(() => setLoading(false))
  }, [courseId]) // selectedAssignment removed from dependencies

  // Flatten all student submissions for the selected assignment
  const filteredSubs = courseAssignmentsData // Use new state name
    .filter(a => a._id === selectedAssignment)
    .flatMap(a => (a.submissions || []).map(s => ({
      ...s,
      studentId: String(s.student?._id || s.student), // Ensure studentId is a string
      studentName: s.student?.name || s.student?.email || String(s.student?._id || s.student), // Robust student name
      id: s._id, // This is student submission's _id
    })))
    .filter(s => !search || (s.studentName && s.studentName.toLowerCase().includes(search.toLowerCase())))

  const openGrading = (sub) => {
    setGrading(sub)
    setGradeVal(sub.grade ?? '')
    setFeedbackVal(sub.feedback ?? '')
  }
  const closeGrading = () => {
    setGrading(null)
    setGradeVal('')
    setFeedbackVal('')
  }
  const handleGrade = async (e) => {
    e.preventDefault()
    if (!grading || !grading.studentId) {
        setError('Cannot save grade: missing student information.');
        return;
    }
    const token = localStorage.getItem('token')
    setLoading(true); 
    setError('');
    try {
      await fetch(`http://localhost:5000/api/submission/${selectedAssignment}/grade/${grading.studentId}`, { // Use grading.studentId
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grade: gradeVal, feedback: feedbackVal })
      })
      closeGrading()

      // Refresh data
      const refreshRes = await fetch(`http://localhost:5000/api/submission/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!refreshRes.ok) {
        const errData = await refreshRes.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to refresh submissions (status: ${refreshRes.status})`);
      }
      const refreshedData = await refreshRes.json();
      const refreshedAssignmentsArray = Array.isArray(refreshedData) ? refreshedData : [];
      setCourseAssignmentsData(refreshedAssignmentsArray);
      // Also update assignments for the dropdown if necessary, though it might not change often.
      setAssignments(refreshedAssignmentsArray);

    } catch (err) {
      console.error("Error in handleGrade:", err);
      setError(err.message || 'Failed to save grade or refresh data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="text-3xl font-bold text-indigo-700">Grading Center</div>
        <div className="flex gap-2 items-center">
          <select value={selectedAssignment} onChange={e => setSelectedAssignment(e.target.value)} className="px-3 py-2 rounded bg-gray-100 text-gray-800 border border-gray-300">
            {assignments.map(a => <option key={a._id} value={a._id}>{a.title} ({a.type})</option>)}
          </select>
          <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded bg-white text-gray-800 border border-gray-300" />
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        {loading ? <div className="text-gray-500">Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-indigo-700">
              <th>Student</th>
              <th>Status</th>
              <th>Grade</th>
              <th>Feedback</th>
              <th>File</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length === 0 && <tr><td colSpan={6} className="text-gray-500 py-4 text-center">No submissions found.</td></tr>}
            {filteredSubs.map(sub => (
              <tr key={sub.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-2 font-semibold text-gray-800">{sub.studentName}</td>
                <td className="text-gray-700">{sub.status}</td>
                <td>{sub.grade !== null && sub.grade !== undefined ? <span className="text-green-600 font-bold">{sub.grade}</span> : <span className="text-gray-500">Not graded</span>}</td>
                <td>{sub.feedback ? <span className="text-xs text-gray-600">{sub.feedback}</span> : <span className="text-gray-500">-</span>}</td>
                <td>{sub.fileUrl && <a href={sub.fileUrl} download className="text-blue-600 hover:text-blue-700 underline text-xs">Download</a>}</td>
                <td><button onClick={() => openGrading(sub)} className="text-indigo-600 hover:text-indigo-700 hover:underline text-xs">Grade</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {grading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <form onSubmit={handleGrade} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-300">
            <div className="text-xl font-bold text-indigo-700 mb-4">Grade Submission: {grading.studentName}</div>
            <div className="mb-3">
              <label className="block text-indigo-700 mb-1">Grade</label>
              <input type="number" min="0" max="100" value={gradeVal} onChange={e => setGradeVal(e.target.value)} required className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 border border-gray-300" />
            </div>
            <div className="mb-3">
              <label className="block text-indigo-700 mb-1">Feedback</label>
              <textarea value={feedbackVal} onChange={e => setFeedbackVal(e.target.value)} className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 border border-gray-300" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={closeGrading} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Save Grade</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
