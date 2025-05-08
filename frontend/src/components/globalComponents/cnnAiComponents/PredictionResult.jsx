import React from 'react'
import { Sparkles, Info, RotateCcw } from 'lucide-react'
import FetchedInformation from './FetchedInformation'

export default function PredictionResult({ result, onReset }) {
  if (!result) return null

  const { prediction, confidence, image_url, fetched_info } = result

  // Basic check for fetched_info structure
  const hasFetchedInfo = fetched_info && (fetched_info.wikidata_label || fetched_info.summary)

  return (
    <div className="mt-8 w-full max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-semibold text-sky-700 mb-6 text-center flex items-center justify-center gap-2">
        <Sparkles size={28} className="text-sky-500" /> Prediction Result
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Image Preview Column */} 
        <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          {image_url && (
            <img 
              src={image_url} 
              alt="Uploaded for prediction" 
              className="w-full max-w-xs h-auto rounded-lg object-contain border border-slate-300 shadow-md mb-3"
            />
          )}
          <p className="text-xs text-slate-500 font-medium">Uploaded Image</p>
        </div>

        {/* Prediction Details Column */} 
        <div className="space-y-4">
          <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Predicted Label:</p>
            <p className="text-xl font-bold text-sky-700 capitalize">
              {prediction ? prediction.replace(/_/g, ' ') : 'N/A'}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Confidence Score:</p>
            <p className="text-xl font-bold text-green-700">
              {confidence ? `${(confidence * 100).toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Fetched Information Section */} 
      {hasFetchedInfo && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xl font-semibold text-sky-600 mb-4 flex items-center gap-2">
            <Info size={22} className="text-sky-500" /> Additional Information
          </h3>
          <FetchedInformation info={fetched_info} />
        </div>
      )}

      {/* Reset Button */} 
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
        >
          <RotateCcw size={18} /> Try Another Image
        </button>
      </div>
    </div>
  )
}