import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiShare2, FiArrowLeft, FiEdit2, FiTrash2, FiMoreHorizontal, FiFileText, FiDownload, FiImage, FiVideo, FiExternalLink } from 'react-icons/fi';
import DiscussionPost from './DiscussionPost';
import ImageModal from './ImageModal';

const API = import.meta.env.VITE_API_URL || '';

export default function DiscussionDetails() {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [imageModal, setImageModal] = useState({ open: false, src: '', alt: '' });
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  function getAttachmentUrl(fileUrl) {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    return API + fileUrl;
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discussion-forum/discussions/${id}`)
      .then(res => res.json())
      .then(data => {
        setDiscussion(data);
        setLoading(false);
      })
      .catch(() => setError('Failed to load discussion'));
  }, [id]);

  const handleLike = async () => {
    await fetch(`/api/discussion-forum/discussions/${id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    // Instead of window.location.reload(), just refetch the discussion
    fetch(`/api/discussion-forum/discussions/${id}`)
      .then(res => res.json())
      .then(data => setDiscussion(data));
  };
  const handleDislike = async () => {
    await fetch(`/api/discussion-forum/discussions/${id}/dislike`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetch(`/api/discussion-forum/discussions/${id}`)
      .then(res => res.json())
      .then(data => setDiscussion(data));
  };
  const handleDelete = async () => {
    if (!window.confirm('Delete this discussion?')) return;
    await fetch(`/api/discussion-forum/discussions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    navigate('/discussion-board');
  };

  if (loading) return <div className="text-indigo-600 text-center py-8">Loading...</div>; // Changed text color
  if (error || !discussion) return <div className="text-red-500 text-center py-8">{error || 'Not found'}</div>; // Changed text color

  if (editing) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-24 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
        <button onClick={() => setEditing(false)} className="flex items-center gap-2 mb-4 text-indigo-600 hover:text-indigo-700 font-semibold focus:outline-none">
          <FiArrowLeft /> Cancel Edit
        </button>
        <DiscussionPost
          editMode
          discussionId={discussion._id}
          initialData={discussion}
          onSuccess={() => { setEditing(false); setRefreshComments(r => !r); setLoading(true); fetch(`/api/discussion-forum/discussions/${id}`).then(res => res.json()).then(data => { setDiscussion(data); setLoading(false); }); }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-24 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 relative">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-indigo-600 hover:text-indigo-700 font-semibold focus:outline-none">
        <FiArrowLeft /> Back
      </button>
      {/* Ellipsis menu for post author */}
      {discussion.author?._id === userId && (
        <div className="absolute top-6 right-8 z-50">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shadow transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-50"
            aria-label="Show post actions"
            style={{ position: 'relative', zIndex: 50 }}
          >
            <FiMoreHorizontal size={22} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-300 rounded-xl shadow-lg animate-fade-in z-50" style={{ zIndex: 50 }}>
              <button
                onClick={() => { setEditing(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-indigo-700 hover:bg-indigo-50 transition-colors rounded-t-xl"
              >
                <FiEdit2 /> Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); handleDelete(); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          )}
        </div>
      )}
      <h1 className="text-3xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
        {discussion.title}
      </h1>
      <div className="text-gray-500 mb-4 text-sm flex items-center gap-2">
        By <span className="font-semibold text-indigo-600">{discussion.author?.name || 'Unknown'}</span>
        • {new Date(discussion.createdAt).toLocaleString()}
      </div>
      <div className="space-y-6 mb-8">
        {discussion.sections.map((section, idx) => (
          <div key={idx}>
            {section.type === 'text' ? (
              <div className="whitespace-pre-line text-lg text-gray-700 leading-relaxed tracking-wide">{section.content}</div>
            ) : section.type === 'file' && section.fileUrl ? (
              <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-200">
                {section.fileType && (section.fileType.startsWith('.jpg') || section.fileType.startsWith('.jpeg') || section.fileType.startsWith('.png') || section.fileType.startsWith('.gif') || section.fileType.startsWith('.webp')) ? (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm font-medium text-indigo-700 truncate" title={section.name}>
                      <FiImage className="inline mr-2 mb-0.5" />{section.name || 'Image Attachment'}
                    </p>
                    <img
                      src={getAttachmentUrl(section.fileUrl)}
                      alt={section.name || 'Image attachment'}
                      className="rounded-lg border border-gray-300 bg-gray-100 max-w-md max-h-96 cursor-pointer object-contain transition-transform duration-200 hover:scale-105 shadow-md"
                      onClick={() => setImageModal({ open: true, src: getAttachmentUrl(section.fileUrl), alt: section.name || 'Image attachment' })}
                    />
                  </div>
                ) : section.fileType && section.fileType.startsWith('.mp4') ? (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm font-medium text-indigo-700 truncate" title={section.name}>
                      <FiVideo className="inline mr-2 mb-0.5" />{section.name || 'Video Attachment'}
                    </p>
                    <video controls className="rounded-lg border border-gray-300 bg-gray-100 w-full max-w-md max-h-96 mt-1">
                      <source src={getAttachmentUrl(section.fileUrl)} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : section.fileType === '.pdf' ? (
                  <a href={getAttachmentUrl(section.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-md hover:bg-indigo-50 transition-colors duration-150 group">
                    <FiFileText size={40} className="text-red-500 flex-shrink-0 group-hover:text-red-600" />
                    <div className="flex-grow">
                      <p className="text-base font-medium text-gray-800 group-hover:text-indigo-700 truncate" title={section.name}>{section.name || 'PDF Document'}</p>
                      <span className="text-sm text-gray-500 group-hover:text-indigo-500">Open PDF in new tab</span>
                    </div>
                    <FiExternalLink size={22} className="text-gray-400 group-hover:text-indigo-600 ml-auto" />
                  </a>
                ) : (
                  <a href={getAttachmentUrl(section.fileUrl)} download={section.name || 'download'} className="flex items-center gap-3 p-3 rounded-md hover:bg-indigo-50 transition-colors duration-150 group">
                    <FiFileText size={40} className="text-gray-500 flex-shrink-0 group-hover:text-indigo-600" />
                    <div className="flex-grow">
                      <p className="text-base font-medium text-gray-800 group-hover:text-indigo-700 truncate" title={section.name}>{section.name || 'File Attachment'}</p>
                      <span className="text-sm text-gray-500 group-hover:text-indigo-500">Download file</span>
                    </div>
                    <FiDownload size={22} className="text-gray-400 group-hover:text-indigo-600 ml-auto" />
                  </a>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex gap-6 mb-4 text-lg items-center">
        <button onClick={handleLike} className="flex items-center gap-1 hover:text-indigo-700 text-indigo-600 font-semibold focus:outline-none"><FiThumbsUp /> {discussion.likes?.length || 0}</button> {/* Changed text color */}
        <button onClick={handleDislike} className="flex items-center gap-1 hover:text-indigo-700 text-indigo-600 font-semibold focus:outline-none"><FiThumbsDown /> {discussion.dislikes?.length || 0}</button> {/* Changed text color */}
        <button onClick={() => setShowCommentForm(v => !v)} className="flex items-center gap-1 hover:text-indigo-700 text-indigo-600 font-semibold focus:outline-none"><FiMessageCircle /> Comment</button> {/* Changed text color */}
        <button className="flex items-center gap-1 hover:text-indigo-700 text-indigo-600 font-semibold focus:outline-none" onClick={() => navigator.clipboard.writeText(window.location.href)}><FiShare2 /> Share</button> {/* Changed text color */}
      </div>
      {showCommentForm && (
        <CommentForm discussionId={id} onSuccess={() => setRefreshComments(r => !r)} />
      )}
      <CommentList discussionId={id} refresh={refreshComments} />
      <ImageModal open={imageModal.open} src={imageModal.src} alt={imageModal.alt} onClose={() => setImageModal({ open: false, src: '', alt: '' })} />
    </div>
  );
}
