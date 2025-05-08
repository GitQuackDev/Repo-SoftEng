import React, { useState, useEffect } from 'react'

export default function ProfSubmission({ courseId, refreshCourse }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ title: '', type: 'Assignment', dueDate: '' })
  const [error, setError] = useState('')

  // Fetch submissions from backend
  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/submission/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubmissions(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load submissions'))
      .finally(() => setLoading(false))
  }, [courseId, showModal])

  const openModal = (item = null) => {
    setEditItem(item)
    setForm(item ? { ...item } : { title: '', type: 'Assignment', dueDate: '' })
    setShowModal(true)
  }
  const closeModal = () => {
    setShowModal(false)
    setEditItem(null)
  }
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const token = localStorage.getItem('token')
    const url = editItem
      ? `http://localhost:5000/api/submission/${editItem._id}`
      : 'http://localhost:5000/api/submission/'
    const method = editItem ? 'PUT' : 'POST'
    const body = JSON.stringify({ ...form, course: courseId })
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body
      })
      if (!res.ok) throw new Error('Failed to save submission')
      closeModal()
      if (refreshCourse) refreshCourse()
    } catch {
      setError('Failed to save submission')
    }
  }
  const toggleStatus = async id => {
    const token = localStorage.getItem('token')
    const sub = submissions.find(s => s._id === id)
    if (!sub) return
    try {
      await fetch(`http://localhost:5000/api/submission/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: sub.status === 'Open' ? 'Closed' : 'Open' })
      })
      setSubmissions(submissions => submissions.map(s => s._id === id ? { ...s, status: s.status === 'Open' ? 'Closed' : 'Open' } : s))
    } catch {}
  }
  const toggleVisibility = async id => {
    const token = localStorage.getItem('token')
    const sub = submissions.find(s => s._id === id)
    if (!sub) return
    try {
      await fetch(`http://localhost:5000/api/submission/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visible: !sub.visible })
      })
      setSubmissions(submissions => submissions.map(s => s._id === id ? { ...s, visible: !s.visible } : s))
    } catch {}
  }
  const handleDelete = async id => {
    if (!window.confirm('Delete this submission item?')) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:5000/api/submission/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubmissions(submissions => submissions.filter(s => s._id !== id))
    } catch {}
  }
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="text-3xl font-bold text-indigo-700">Manage Submissions</div>
        <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold">+ New Submission</button>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        {loading ? <div className="text-gray-500">Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-indigo-700">
              <th>Title</th>
              <th>Type</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Visible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(item => (
              <tr key={item._id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-2 font-semibold text-gray-800">{item.title}</td>
                <td className="text-gray-700">{item.type}</td>
                <td className="text-gray-700">{item.dueDate?.slice(0,10)}</td>
                <td>
                  <button onClick={() => toggleStatus(item._id)} className={`px-2 py-1 rounded ${item.status === 'Open' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} text-white text-xs`}>{item.status}</button>
                </td>
                <td>
                  <button onClick={() => toggleVisibility(item._id)} className={`px-2 py-1 rounded ${item.visible ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'} text-white text-xs`}>{item.visible ? 'Visible' : 'Hidden'}</button>
                </td>
                <td className="space-x-2">
                  <button onClick={() => openModal(item)} className="text-yellow-500 hover:text-yellow-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-300">
            <div className="text-xl font-bold text-indigo-700 mb-4">{editItem ? 'Edit Submission' : 'New Submission'}</div>
            <div className="mb-3">
              <label className="block text-indigo-700 mb-1">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 border border-gray-300" />
            </div>
            <div className="mb-3">
              <label className="block text-indigo-700 mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 border border-gray-300">
                <option>Assignment</option>
                <option>Quiz</option>
                <option>Project</option>
                <option>Exam</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-indigo-700 mb-1">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required className="w-full px-3 py-2 rounded bg-gray-50 text-gray-800 border border-gray-300" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">{editItem ? 'Save' : 'Create'}</button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        </div>
      )}
    </div>
  )
}