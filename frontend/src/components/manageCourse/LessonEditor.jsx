import React, { useState } from 'react';

function isImage(fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)
}
function isVideo(fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  return ["mp4", "webm", "ogg", "mov", "avi"].includes(ext)
}
function isPdf(fileName) {
  return fileName.split('.').pop().toLowerCase() === 'pdf'
}
function isDoc(fileName) {
  return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileName.split('.').pop().toLowerCase())
}

// Helper to get file name from URL or File
function getFileName(file) {
  if (typeof file === 'string') return file.split('/').pop();
  if (file && file.name) return file.name;
  return '';
}

// Helper to get file URL for preview/download
function getFileUrl(file) {
  if (typeof file === 'string') return file.startsWith('/uploads') ? `http://localhost:5000${file}` : file;
  if (file instanceof File) return URL.createObjectURL(file);
  // Defensive: skip invalid file types
  return undefined;
}

// Use actionSteps for lesson steps/modules/resources
export default function LessonEditor({ lesson = {}, onClose, onSave }) {
  const [title, setTitle] = useState(lesson.title || '')
  const [description, setDescription] = useState(lesson.description || '')
  const [actionSteps, setActionSteps] = useState(
    lesson.actionSteps && lesson.actionSteps.length > 0
      ? lesson.actionSteps.map(s => ({
          stepId: s.stepId || '',
          title: s.title || '',
          description: s.description || '',
          resourceUrl: s.resourceUrl || '',
          youtubeLinks: s.youtubeLinks || [''],
          files: s.files || []
        }))
      : [{ stepId: '', title: '', description: '', resourceUrl: '', youtubeLinks: [''], files: [] }]
  )
  const [activeStep, setActiveStep] = useState(0)
  const [open, setOpen] = useState(lesson.open ?? true)

  // Action step handlers
  const handleStepChange = (idx, field, value) => {
    setActionSteps(steps => steps.map((step, i) => i === idx ? { ...step, [field]: value } : step))
  }
  const handleStepYoutubeChange = (idx, yidx, value) => {
    setActionSteps(steps => steps.map((step, i) => i === idx ? { ...step, youtubeLinks: step.youtubeLinks.map((l, j) => j === yidx ? value : l) } : step))
  }
  const addStepYoutubeLink = idx => {
    setActionSteps(steps => steps.map((step, i) => i === idx ? { ...step, youtubeLinks: [...step.youtubeLinks, ''] } : step))
  }
  const removeStepYoutubeLink = (idx, yidx) => {
    setActionSteps(steps => steps.map((step, i) => i === idx ? { ...step, youtubeLinks: step.youtubeLinks.filter((_, j) => j !== yidx) } : step))
  }
  const handleStepFileChange = (idx, e) => {
    const newFiles = Array.from(e.target.files).slice(0, 10 - (actionSteps[idx].files?.length || 0))
    setActionSteps(steps => steps.map((step, i) => i === idx
      ? { ...step, files: [...(step.files || []).filter(f => typeof f === 'string'), ...newFiles].slice(0, 10) }
      : step))
  }
  const handleStepDrop = (idx, e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 10 - (actionSteps[idx].files?.length || 0))
    const newFiles = [...(actionSteps[idx].files || []), ...droppedFiles].slice(0, 10)
    setActionSteps(steps => steps.map((step, i) => i === idx ? { ...step, files: newFiles } : step))
  }
  const handleStepDragOver = e => e.preventDefault()
  const addStep = () => setActionSteps([...actionSteps, { stepId: '', title: '', description: '', resourceUrl: '', youtubeLinks: [''], files: [] }])
  const removeStep = idx => setActionSteps(actionSteps.filter((_, i) => i !== idx))

  // Save handler
  const handleSave = () => {
    // Assign stepId if missing
    let steps = actionSteps.map((step, idx) => ({
      ...step,
      stepId: step.stepId || `step-${Date.now()}-${idx}`,
      files: step.files && step.files.length > 0
        ? step.files.filter(f => typeof f === 'string')
        : []
    }))
    onSave({
      ...lesson,
      title,
      description,
      open,
      actionSteps: steps,
    })
  }

  // Reset state when lesson prop changes (for editing after save)
  React.useEffect(() => {
    setTitle(lesson.title || '')
    setDescription(lesson.description || '')
    setOpen(lesson.open ?? true)
    setActionSteps(
      lesson.actionSteps && lesson.actionSteps.length > 0
        ? lesson.actionSteps.map(s => ({
            stepId: s.stepId || '',
            title: s.title || '',
            description: s.description || '',
            resourceUrl: s.resourceUrl || '',
            youtubeLinks: s.youtubeLinks || [''],
            files: s.files || []
          }))
        : [{ stepId: '', title: '', description: '', resourceUrl: '', youtubeLinks: [''], files: [] }]
    )
  }, [lesson])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative border border-gray-200 text-gray-800 flex flex-col md:flex-row overflow-hidden">
        {/* Form Section */}
        <div className="flex-1 p-8 overflow-y-auto max-h-[90vh]">
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose}>&times;</button>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700">{lesson.lessonId || lesson._id ? 'Edit Lesson' : 'Add Lesson'}</h2>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Lesson Title</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Lesson Description</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" checked={open} onChange={e => setOpen(e.target.checked)} id="open-toggle" className="accent-indigo-600" />
            <label htmlFor="open-toggle" className="text-gray-700">Open (visible to students)</label>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-gray-700">Action Steps</label>
            <div className="flex gap-2 mb-2">
              {actionSteps.map((step, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-all duration-200 ${activeStep === idx ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-100 text-indigo-700 border-transparent'}`}
                  onClick={() => setActiveStep(idx)}
                  type="button"
                >
                  {step.title?.trim() ? step.title : `Step ${idx + 1}`}
                </button>
              ))}
              <button type="button" className="ml-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={addStep}>+ Add Step</button>
            </div>
            {actionSteps[activeStep] && (
              <div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4 bg-white">
                <div className="flex gap-2 mb-1 items-center">
                  <input className="flex-1 border border-gray-300 rounded px-2 py-1 bg-white text-gray-800" value={actionSteps[activeStep].title} onChange={e => handleStepChange(activeStep, 'title', e.target.value)} placeholder={`Step ${activeStep + 1} Title`} />
                  {actionSteps.length > 1 && <button type="button" className="text-red-500 px-2" onClick={() => removeStep(activeStep)}>&times;</button>}
                </div>
                <textarea className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-800 mb-1" value={actionSteps[activeStep].description} onChange={e => handleStepChange(activeStep, 'description', e.target.value)} placeholder="Step description" />
                <input className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-800" value={actionSteps[activeStep].resourceUrl} onChange={e => handleStepChange(activeStep, 'resourceUrl', e.target.value)} placeholder="Resource URL (optional)" />
                <div className="mt-2">
                  <label className="block font-semibold mb-1 text-gray-700">YouTube Video Links for this Step</label>
                  {actionSteps[activeStep].youtubeLinks.map((link, yidx) => (
                    <div key={yidx} className="flex gap-2 mb-2">
                      <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" value={link} onChange={e => handleStepYoutubeChange(activeStep, yidx, e.target.value)} placeholder="https://youtube.com/..." />
                      {actionSteps[activeStep].youtubeLinks.length > 1 && <button type="button" className="text-red-500 px-2" onClick={() => removeStepYoutubeLink(activeStep, yidx)}>&times;</button>}
                    </div>
                  ))}
                  <button type="button" className="text-indigo-600 hover:underline text-sm" onClick={() => addStepYoutubeLink(activeStep)}>+ Add another link</button>
                </div>
                <div className="mt-2">
                  <label className="block font-semibold mb-1 text-gray-700">Upload Files for this Step</label>
                  <div
                    className="border-2 border-dashed border-indigo-500 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100/50 transition mb-2"
                    onDrop={e => handleStepDrop(activeStep, e)}
                    onDragOver={handleStepDragOver}
                    onClick={() => document.getElementById(`step-file-input-${activeStep}`).click()}
                    style={{ minHeight: 80 }}
                  >
                    <span className="text-indigo-600 font-semibold mb-1">Drag & drop files here or click to browse</span>
                    <input id={`step-file-input-${activeStep}`} type="file" multiple onChange={e => handleStepFileChange(activeStep, e)} className="hidden" />
                  </div>
                  {actionSteps[activeStep].files && actionSteps[activeStep].files.length > 0 && (
                    <ul className="space-y-2">
                      {actionSteps[activeStep].files
                        .filter(file => typeof file === 'string' || (typeof File !== 'undefined' && file instanceof File))
                        .map((file, idx) => {
                          const fileName = getFileName(file);
                          const fileUrl = getFileUrl(file);
                          if (!fileUrl) return null;
                          if (isImage(fileName)) {
                            return (
                              <li key={idx} className="flex items-center gap-2">
                                <img src={fileUrl} alt={fileName} className="w-16 h-16 object-cover rounded shadow cursor-pointer hover:scale-105 transition" title="Click to view fullscreen" onClick={() => window.open(fileUrl, '_blank')} />
                                <span className="truncate max-w-[120px] text-xs text-gray-600">{fileName}</span>
                              </li>
                            );
                          }
                          if (isVideo(fileName)) {
                            return (
                              <li key={idx} className="flex items-center gap-2">
                                <video src={fileUrl} controls className="w-24 h-16 rounded shadow" />
                                <span className="truncate max-w-[120px] text-xs text-gray-600">{fileName}</span>
                              </li>
                            );
                          }
                          // For other files, show a download link
                          return (
                            <li key={idx} className="flex items-center gap-2">
                              <a href={fileUrl} download={fileName} className="text-blue-500 underline text-xs">Download</a>
                              <span className="truncate max-w-[120px] text-xs text-gray-600">{fileName}</span>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow transition-all duration-300" onClick={handleSave}>Save</button>
            <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg" onClick={onClose}>Cancel</button>
          </div>
        </div>
        {/* Preview Section */}
        <div className="hidden md:block w-[2px] bg-gray-200 h-full"></div>
        <div className="w-full md:w-[380px] p-6 overflow-y-auto max-h-[90vh] border-l border-gray-200 bg-white">
          <div className="text-lg font-bold text-indigo-700 mb-2">Preview</div>
          <div className="mb-2 text-xl font-bold flex items-center gap-2 text-gray-800">{title} {open && <span className="text-green-500">✔</span>}</div>
          <div className="font-bold text-indigo-700 mt-4 mb-2">ACTION STEPS</div>
          <div className="flex gap-2 mb-2">
            {actionSteps.map((step, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded-lg font-semibold border-b-2 transition-all duration-200 ${activeStep === idx ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-100 text-indigo-700 border-transparent'}`}
                onClick={() => setActiveStep(idx)}
                type="button"
              >
                {step.title?.trim() ? step.title : `Step ${idx + 1}`}
              </button>
            ))}
          </div>
          {actionSteps[activeStep] && (
            <div className="border border-gray-300 rounded-lg p-4 bg-white mt-2">
              <div className="font-semibold text-indigo-600 mb-1">{actionSteps[activeStep].title}</div>
              <div className="mb-2 text-gray-700">{actionSteps[activeStep].description}</div>
              {actionSteps[activeStep].resourceUrl && <a href={actionSteps[activeStep].resourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">Resource</a>}
              {actionSteps[activeStep].youtubeLinks && actionSteps[activeStep].youtubeLinks.filter(l => l.trim()).map((link, idx) => (
                <div key={idx} className="mb-2">
                  <iframe width="100%" height="120" src={link.replace('watch?v=', 'embed/')} title={`YouTube video ${idx + 1}`} frameBorder="0" allowFullScreen className="rounded-xl"></iframe>
                </div>
              ))}
              {actionSteps[activeStep].files && actionSteps[activeStep].files.length > 0 && (
                <div className="mb-2">
                  <div className="font-semibold text-indigo-600 mb-1">Attachments</div>
                  <ul className="space-y-2">
                    {actionSteps[activeStep].files
                      .filter(file => typeof file === 'string' || (typeof File !== 'undefined' && file instanceof File))
                      .map((file, idx) => {
                        const fileName = getFileName(file);
                        const fileUrl = getFileUrl(file);
                        if (!fileUrl) return null;
                        if (isImage(fileName)) {
                          return (
                            <li key={idx} className="flex items-center gap-2">
                              <img src={fileUrl} alt={fileName} className="w-16 h-16 object-cover rounded shadow cursor-pointer hover:scale-105 transition" title="Click to view fullscreen" onClick={() => window.open(fileUrl, '_blank')} />
                              <span className="truncate max-w-[120px] text-xs text-gray-600">{fileName}</span>
                            </li>
                          );
                        }
                        if (isVideo(fileName)) {
                          return (
                            <li key={idx} className="flex items-center gap-2">
                              <video src={fileUrl} controls className="w-24 h-16 rounded shadow" />
                              <span className="truncate max-w-[120px] text-xs text-gray-600">{fileName}</span>
                            </li>
                          );
                        }
                        // For other files, show a download link
                        return (
                          <li key={idx} className="flex items-center gap-2">
                            <a href={fileUrl} download={fileName} className="text-blue-500 underline text-xs">Download</a>
                            <span className="truncate max-w-[120px] text-xs text-gray-600">{fileName}</span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
