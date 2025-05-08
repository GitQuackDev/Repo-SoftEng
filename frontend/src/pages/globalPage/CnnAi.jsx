import React, { useState } from 'react'
import FetchedInformation from '../../components/globalComponents/cnnAiComponents/FetchedInformation'

export default function CnnAi() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
    setResult(null)
    setError(null)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const res = await fetch('/api/cnn-ai/predict', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Prediction failed')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto bg-slate-50 font-sans">
      <h1 className="text-3xl font-bold text-sky-700 mb-8 flex items-center gap-3">
        <span role="img" aria-label="ai" className="text-3xl">🤖</span> CNN AI Image Recognition
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
        <label className="flex flex-col items-center px-6 py-10 bg-slate-50 rounded-lg shadow-sm border-2 border-dashed border-slate-300 hover:border-sky-400 transition-all duration-300 group cursor-pointer">
          <svg className="w-12 h-12 text-slate-400 mb-3 group-hover:text-sky-500 transition-colors duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span className="text-slate-600 font-medium group-hover:text-sky-600 transition-colors duration-300">Click to upload or drag an image</span>
          <span className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {previewUrl && (
          <div className="flex flex-col items-center">
            <img src={previewUrl} alt="Preview" className="max-h-72 rounded-lg border-2 border-slate-300 shadow-md mb-2 transition-all duration-300 hover:scale-[1.02]" />
            <span className="text-slate-500 text-xs">Image Preview</span>
          </div>
        )}
        <button
          type="submit"
          disabled={!selectedFile || loading}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Predicting...
            </span>
          ) : 'Predict Image'}
        </button>
      </form>
      {error && <div className="mt-5 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg shadow-sm">Error: {error}</div>}
      {result && (
        <>
          <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="text-xl font-semibold text-sky-700 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prediction Results
            </div>
            {result.predictions && result.predictions.length > 0 ? (
              <ul className="space-y-3">
                {result.predictions.map((pred, idx) => (
                  <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                    <span className="text-base font-medium text-slate-700 w-6 text-right">{idx + 1}.</span>
                    <span className="font-semibold text-sky-700 flex-1 truncate">{pred.className}</span>
                    <div className="w-1/3 mx-2">
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-sky-400 to-sky-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(pred.confidence * 100).toFixed(2)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-slate-600 font-mono text-sm w-16 text-right">{(pred.confidence * 100).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500 p-3 bg-slate-100 rounded-md border border-slate-200">No predictions available.</div>
            )}
          </div>
          <FetchedInformation info={result.info} />
        </>
      )}
    </div>
  )
}
