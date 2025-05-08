import { useState } from 'react'

export default function CourseForm({ course = {}, onSave, onCancel, loading, error }) {
  const [name, setName] = useState(course.name || '')
  const [details, setDetails] = useState(course.details || '')
  const [banner, setBanner] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(course.banner ? `http://localhost:5000${course.banner}` : null)
  const handleSubmit = e => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('details', details)
    if (banner) formData.append('banner', banner)
    onSave(formData)
  }
  const handleBannerChange = e => {
    const file = e.target.files[0]
    if (file) {
      setBanner(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-indigo-700">{course._id ? 'Edit Course' : 'Create Course'}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Details</label>
        <textarea value={details} onChange={e => setDetails(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Banner</label>
        <input type="file" onChange={handleBannerChange} className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
        {bannerPreview && <img src={bannerPreview} alt="Banner Preview" className="mt-4 w-full h-48 object-cover rounded-lg border border-gray-200" />}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-4">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all duration-300" disabled={loading}>Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg">Cancel</button>
      </div>
    </form>
  )
}