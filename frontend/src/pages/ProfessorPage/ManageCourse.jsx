import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || '';

export default function ManageCourse() {
  const [courses, setCourses] = useState([])
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [banner, setBanner] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const [editCourse, setEditCourse] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkUploadMsg, setBulkUploadMsg] = useState('')
  const [bulkUploading, setBulkUploading] = useState(false)
  const menuRef = useRef()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/api/course/professor`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCourses(Array.isArray(data.data) ? data.data : [])
    } catch {
      setCourses([])
    }
  }

  const handleBannerChange = e => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.')
        setBanner(null)
        setBannerPreview(null)
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB.')
        setBanner(null)
        setBannerPreview(null)
        return
      }
      setBanner(file)
      setBannerPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const formData = new FormData()
    formData.append('name', name)
    formData.append('details', details)
    if (banner) formData.append('banner', banner)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/api/course/professor`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      let data = null
      try {
        data = await res.json()
      } catch {
        setError('Server error: invalid response')
        setLoading(false)
        return
      }
      if (!res.ok) setError(data.error || 'Failed to create course')
      else {
        setSuccess('Course created!')
        setName('')
        setDetails('')
        setBanner(null)
        setBannerPreview(null)
        fetchCourses()
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API}/api/course/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchCourses()
    } catch {}
  }

  const handleEdit = (course) => {
    setEditCourse(course)
    setEditError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    setEditError('')
    const formData = new FormData()
    formData.append('name', editCourse.name)
    formData.append('details', editCourse.details)
    if (editCourse.bannerFile) formData.append('banner', editCourse.bannerFile)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/api/course/${editCourse._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) setEditError(data.msg || 'Failed to update course')
      else {
        setEditCourse(null)
        fetchCourses()
      }
    } catch {
      setEditError('Network error')
    }
    setEditLoading(false)
  }

  const handleBulkFileChange = e => {
    const files = Array.from(e.target.files).slice(0, 10)
    setBulkFiles(files)
  }

  const handleBulkUpload = async () => {
    if (!bulkFiles.length) return
    setBulkUploading(true)
    setBulkUploadMsg('')
    const formData = new FormData()
    bulkFiles.forEach(f => formData.append('files', f))
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/api/course/bulk-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) setBulkUploadMsg(data.msg || 'Bulk upload failed')
      else {
        setBulkUploadMsg('Bulk upload successful!')
        setBulkFiles([])
        fetchCourses()
      }
    } catch {
      setBulkUploadMsg('Network error')
    }
    setBulkUploading(false)
  }

  return (
    <div className="w-full max-w-xl mx-auto py-8"> {/* Added py-8 for padding */}
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 tracking-tight">Manage Courses</h1> {/* Changed text color */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl flex flex-col gap-4 mb-10 border border-gray-200 p-6"> {/* Changed background, border, and added padding */}
        <h2 className="text-xl font-semibold text-indigo-600 mb-2">Create a New Course</h2> {/* Changed text color */}
        {error && <div className="text-red-500 text-sm">{error}</div>} {/* Adjusted error text color */}
        {success && <div className="text-green-500 text-sm">{success}</div>} {/* Adjusted success text color */}
        <input
          type="text"
          placeholder="Course Name"
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500" /* Changed styles */
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Course Details"
          className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] placeholder-gray-500" /* Changed styles */
          value={details}
          onChange={e => setDetails(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="block text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /* Changed styles */
          onChange={handleBannerChange}
        />
        {bannerPreview && (
          <img src={bannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded-xl border mt-2 border-gray-300" /> /* Changed border */
        )}
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2 rounded-lg shadow transition-all duration-300 text-lg tracking-wide" /* Adjusted gradient */
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
      {/* Bulk Upload Section - Assuming this might be added later, no dark styles to remove for now */}
      
      <h2 className="text-xl font-bold text-indigo-700 mb-4 border-l-4 border-indigo-500 pl-2 bg-gray-100 w-fit p-2 rounded-r-lg">Your Courses</h2> {/* Changed text, background, and added padding/rounding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <div key={course._id} className="relative group bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-200 cursor-pointer"> {/* Changed background and border */}
            {/* Ellipsis menu */}
            <button
              className="absolute top-2 right-2 z-20 p-1 rounded-full hover:bg-gray-200 text-gray-600 hover:text-indigo-600 focus:outline-none" /* Changed styles */
              onClick={e => { e.preventDefault(); setMenuOpen(menuOpen === course._id ? null : course._id) }}
              tabIndex={0}
            >
              <span style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 2 }}>⋯</span>
            </button>
            {menuOpen === course._id && (
              <div ref={menuRef} className="absolute top-10 right-2 bg-white border border-gray-300 rounded-xl shadow-lg py-2 w-32 z-30"> {/* Changed background and border */}
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 rounded-t-xl" /* Changed styles */
                  onClick={e => { e.preventDefault(); setMenuOpen(null); handleEdit(course) }}
                >Edit</button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-b-xl" /* Changed styles */
                  onClick={e => { e.preventDefault(); setMenuOpen(null); handleDelete(course._id) }}
                >Delete</button>
              </div>
            )}
            <NavLink to={`/course/${course._id}`} className="flex-1 flex flex-col">
              {course.banner && (
                <img src={`${API}${course.banner}`} alt={course.name} className="w-full h-40 object-cover bg-gray-100" /> /* Changed background */
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-indigo-700 mb-1 group-hover:text-indigo-800 transition-colors">{course.name}</h3> {/* Changed text color */}
                <p className="text-gray-700 mb-2 flex-1">{course.details}</p> {/* Changed text color */}
                <div className="text-xs text-gray-500 mt-auto">Created: {new Date(course.createdAt).toLocaleString()}</div> {/* Changed text color */}
              </div>
            </NavLink>
          </div>
        ))}
        {!courses.length && <div className="text-gray-600 col-span-2">No courses created yet.</div>} {/* Changed text color */}
      </div>
      {/* Edit Course Modal */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"> {/* Lightened overlay */}
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-300 text-gray-800 relative"> {/* Changed background, border, text color */}
            <button type="button" className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setEditCourse(null)}>&times;</button> {/* Changed text color */}
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">Edit Course</h2> {/* Changed text color */}
            {editError && <div className="text-red-500 text-sm mb-2">{editError}</div>} {/* Adjusted error text color */}
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">Course Name</label> {/* Changed text color */}
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" value={editCourse.name} onChange={e => setEditCourse(c => ({ ...c, name: e.target.value }))} /> {/* Changed styles */}
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">Course Details</label> {/* Changed text color */}
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" value={editCourse.details} onChange={e => setEditCourse(c => ({ ...c, details: e.target.value }))} /> {/* Changed styles */}
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1 text-gray-700">Change Banner (optional)</label> {/* Changed text color */}
              <input type="file" accept="image/*" className="block text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={e => setEditCourse(c => ({ ...c, bannerFile: e.target.files[0] }))} /> {/* Changed styles */}
            </div>
            <div className="flex gap-4 mt-6">
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-all duration-300" type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</button>
              <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold" type="button" onClick={() => setEditCourse(null)}>Cancel</button> {/* Changed styles */}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
