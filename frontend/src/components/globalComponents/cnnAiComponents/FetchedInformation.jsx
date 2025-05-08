import React, { useState } from 'react'

export default function FetchedInformation({ info }) {
  const [tab, setTab] = useState('wikidata')

  // Determine if there is any Wikidata or Wikipedia/DuckDuckGo info
  const hasWikidata = info.wikidata_label || info.wikidata_description || info.instance_of || info.use || info.inventor || info.wikidata_image
  const hasWikiOrDuck = info.summary || info.description || info.type || info.history || info.uses || info.inventor || info.url || (info.related && info.related.length > 0)

  if (!info || (!hasWikidata && !hasWikiOrDuck)) {
    return (
      <div className="mt-8 p-6 bg-slate-50 rounded-2xl shadow-lg border border-slate-200 text-slate-600">
        <span role="img" aria-label="info" className="mr-2">ℹ️</span> No additional information found.
      </div>
    )
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="flex gap-4 mb-6 justify-center border-b border-slate-200 pb-4">
        {hasWikidata && (
          <button
            className={`px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${tab === 'wikidata' ? 'bg-sky-600 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            onClick={() => setTab('wikidata')}
          >
            <span role="img" aria-label="wikidata" className="text-lg">📊</span> Wikidata
          </button>
        )}
        {hasWikiOrDuck && (
          <button
            className={`px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${tab === 'wiki' ? 'bg-sky-600 text-white shadow-md scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            onClick={() => setTab('wiki')}
          >
            <span role="img" aria-label="wikipedia" className="text-lg">📖</span> Wikipedia / DuckDuckGo
          </button>
        )}
      </div>
      <div className="transition-opacity duration-500 ease-in-out">
        {tab === 'wikidata' && hasWikidata && (
          <div className="space-y-4">
            {info.wikidata_image && (
              <div className="flex flex-col items-center mb-6">
                <img src={info.wikidata_image} alt="wikidata" className="max-h-52 rounded-xl border-2 border-slate-200 shadow-lg mb-2 mx-auto object-contain" />
                <span className="text-slate-500 text-xs font-medium">Wikidata Image</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[ 'wikidata_label', 'wikidata_description', 'instance_of', 'use', 'inventor'].map(key => 
                info[key] && (
                  <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
                    <span className="font-semibold text-sky-700 capitalize">{key.replace('wikidata_', '').replace('_', ' ')}:</span> 
                    <span className="text-slate-700 ml-1">{info[key]}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {tab === 'wiki' && hasWikiOrDuck && (
          <div className="space-y-4">
            {info.image && (
              <img src={info.image} alt={info.heading} className="max-h-52 rounded-xl border-2 border-slate-200 shadow-lg mb-6 mx-auto object-contain" />
            )}
            {info.heading && (
              <h2 className="text-2xl font-semibold text-sky-700 mb-3 flex items-center gap-2">
                <span role="img" aria-label="wikipedia" className="text-2xl">📖</span> {info.heading}
              </h2>
            )}
            {[ 'summary', 'description', 'type'].map(key => 
              info[key] && (
                <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
                  <span className="font-semibold text-sky-700 capitalize">{key}:</span> 
                  <span className="text-slate-700 ml-1 leading-relaxed">{info[key]}</span>
                </div>
              )
            )}
            {info.related && Array.isArray(info.related) && info.related.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
                <span className="font-semibold text-sky-700">Related Topics:</span>
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  {info.related.slice(0, 5).map((rel, idx) => (
                    <li key={idx} className="text-slate-600">{rel}</li>
                  ))}
                </ul>
              </div>
            )}
            {[ 'history', 'uses', 'inventor'].map(key => 
              info[key] && (
                <div key={key} className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
                  <span className="font-semibold text-sky-700 capitalize">{key.replace('_', ' ')}:</span>
                  <div className="prose prose-sm max-w-none text-slate-700 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: info[key] }} />
                </div>
              )
            )}
            {info.url && (
              <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                Read more on Wikipedia or DuckDuckGo
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
