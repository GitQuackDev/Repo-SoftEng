import React, { useState } from 'react';
import { FiEdit2, FiSend, FiPaperclip } from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL || '';

export default function DiscussionPost({ onSuccess, initialData, editMode, discussionId }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.sections?.[0]?.content || '');
  const [files, setFiles] = useState(initialData?.sections?.filter(s => s.type === 'file') || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API}/api/discussion-forum/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    const data = await res.json();
    setFiles(f => [...f, { type: 'file', fileUrl: data.fileUrl, fileType: data.fileType }]);
  };

  const removeFile = idx => setFiles(f => f.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const sections = [
      { type: 'text', content: body },
      ...files
    ];
    const bodyData = { title, sections };
    let res;
    if (editMode && discussionId) {
      res = await fetch(`${API}/api/discussion-forum/discussions/${discussionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(bodyData),
      });
    } else {
      res = await fetch(`${API}/api/discussion-forum/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(bodyData),
      });
    }
    if (res.ok) {
      setTitle('');
      setBody('');
      setFiles([]);
      onSuccess && onSuccess();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to submit discussion');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mb-8 w-full max-w-2xl mx-auto border border-gray-200">
      <div className="mb-4">
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold bg-gray-50 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
      </div>
      <div className="mb-4">
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[120px] bg-gray-50 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Text (optional)"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1 text-indigo-700">Attachments</label>
        <label className="inline-flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-700">
          <FiPaperclip />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <span>Add File</span>
        </label>
        <div className="flex flex-wrap gap-4 mt-2">
          {files.map((file, idx) => (
            <div key={idx} className="relative border border-gray-300 rounded-xl p-2 bg-gray-100">
              {file.fileType === '.pdf' ? (
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">View PDF</a>
              ) : (
                <img src={file.fileUrl} alt="attachment" className="max-w-[120px] max-h-[120px] rounded" />
              )}
              <button type="button" className="absolute top-1 right-1 text-red-500 bg-white rounded-full px-1 hover:bg-gray-100" onClick={() => removeFile(idx)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button type="submit" className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2 rounded-xl font-semibold shadow hover:from-indigo-700 hover:to-blue-600 transition-all duration-200 flex items-center gap-2" disabled={loading}>
        {editMode ? <FiEdit2 /> : <FiSend />}
        {loading ? (editMode ? 'Saving...' : 'Posting...') : (editMode ? 'Save Changes' : 'Post Discussion')}
      </button>
    </form>
  );
}
