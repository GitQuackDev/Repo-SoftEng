import React, { useState } from 'react'
export default function EnrollStudentForm({ onEnroll, loading, error, enrollMsg }) {
  const [email, setEmail] = useState('')
  const handleSubmit = e => {
    e.preventDefault()
    if (email) onEnroll(email, setEmail)
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-6 items-center bg-white rounded-xl p-4 shadow">
      <input type="email" placeholder="Student email" className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none flex-1 placeholder-gray-400" value={email} onChange={e => setEmail(e.target.value)} required />
      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all duration-300" disabled={loading}>Add Student</button>
      {enrollMsg && <span className="text-green-500 text-sm ml-2">{enrollMsg}</span>}
      {/* Error toast handled globally */}
    </form>
  )
}