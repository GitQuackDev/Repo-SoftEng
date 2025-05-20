import { useState, useEffect, useRef } from 'react'
import { X, ImageIcon, AlertTriangle, Loader2, UploadCloud } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || '';

export default function ImageUpload({ onUpload, onRemove, initialImage, onImageChange }) {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(initialImage || null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    setPreview(initialImage) // Update preview if initialImage changes
  }, [initialImage])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size exceeds 5MB. Please choose a smaller image.')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Please select a JPG, PNG, GIF, or WEBP image.')
        return
      }
      setError('')
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        if (onImageChange) onImageChange(reader.result) // Propagate change if needed
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!image) {
      setError('Please select an image first.')
      return
    }
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('image', image)

    try {
      const response = await fetch(`${API}/api/cnn-ai/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }
      onUpload(data) // Pass the full response data to the parent
      // setPreview(data.filePath); // Assuming data.filePath is the URL of the uploaded image
    } catch (err) {
      setError(err.message || 'An error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setPreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Reset file input
    }
    if (onRemove) onRemove() // Notify parent component
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-xl shadow-xl border border-slate-200">
      <label htmlFor="image-upload" className="block text-sm font-medium text-slate-700 mb-1">Upload Image</label>
      <div className="mt-2 flex flex-col items-center space-y-4">
        <div className={`w-full h-56 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center transition-colors ${preview ? 'bg-slate-50' : 'bg-white hover:border-sky-400'}`}>
          {preview ? (
            <div className="relative group">
              <img src={preview} alt="Preview" className="max-h-52 object-contain rounded-md" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center p-4">
              <ImageIcon size={40} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">
                Drag & drop or <span className="font-semibold text-sky-600">click to browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF, WEBP up to 5MB</p>
            </div>
          )}
          <input
            id="image-upload-input"
            name="image-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="sr-only"
            aria-label="Image upload input"
          />
        </div>
        <label htmlFor="image-upload-input" className="cursor-pointer w-full px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg text-sm text-center hover:bg-slate-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
          {preview ? 'Change Image' : 'Select Image'}
        </label>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleUpload}
          disabled={!image || uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <UploadCloud size={18} /> Upload Image
            </>
          )}
        </button>
      </div>
    </div>
  )
}