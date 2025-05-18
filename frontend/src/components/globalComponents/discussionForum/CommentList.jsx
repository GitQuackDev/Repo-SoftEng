import React, { useEffect, useState } from 'react';
import CommentForm from './CommentForm';
import ImageModal from './ImageModal';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiEdit2, FiTrash2, FiMoreHorizontal, FiFileText, FiDownload, FiImage, FiVideo, FiExternalLink } from 'react-icons/fi';

const backendUrl = 'http://localhost:5000';
function getAttachmentUrl(fileUrl) {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  return backendUrl + fileUrl;
}

function getInitials(name, email) {
  if (name && name.trim()) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return '??';
}

function AdvancedAvatar({ avatar, name, email, size = 36 }) {
  if (avatar) {
    return (
      <img
        src={avatar.startsWith('http') ? avatar : backendUrl + avatar}
        alt="avatar"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-400 to-pink-300 text-white font-extrabold border-2 border-indigo-200 shadow-lg select-none relative overflow-hidden" // Adjusted gradient and border for light theme
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      <span className="drop-shadow-md tracking-widest"> {/* Removed animate-pulse, adjusted shadow */}
        {getInitials(name, email)}
      </span>
      <svg className="absolute bottom-0 right-0 opacity-40" width={size/1.5} height={size/1.5} viewBox={`0 0 ${size/1.5} ${size/1.5}`}><circle cx={size/3} cy={size/3} r={size/3-2} stroke="white" strokeWidth="2" fill="none" /></svg> {/* Adjusted strokeWidth */}
    </div>
  );
}

export default function CommentList({ discussionId, refresh }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id; // Use .id instead of ._id
  const [discussionAuthorId, setDiscussionAuthorId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [imageModal, setImageModal] = useState({ open: false, src: '', alt: '' });

  const doRefresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/discussion-forum/comments/${discussionId}`)
      .then(res => res.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      });
    // Fetch discussion to get author id
    fetch(`/api/discussion-forum/discussions/${discussionId}`)
      .then(res => res.json())
      .then(data => setDiscussionAuthorId(data.author?._id));
  }, [discussionId, refresh, refreshKey]);

  if (loading) return <div className="text-indigo-600 text-center py-6">Loading comments...</div>; // Changed text color
  if (!comments.length) return <div className="text-gray-500 text-center py-6">No comments yet.</div>; // Changed text color

  return (
    <div className="mt-6 flex flex-col gap-4">
      {comments.map(comment => (
        <CommentItem
          key={comment._id}
          comment={comment}
          depth={0}
          userId={userId}
          discussionAuthorId={discussionAuthorId}
          onRefresh={doRefresh}
          setImageModal={setImageModal}
        />
      ))}
      <ImageModal open={imageModal.open} src={imageModal.src} alt={imageModal.alt} onClose={() => setImageModal({ open: false, src: '', alt: '' })} />
    </div>
  );
}

function CommentItem({ comment, depth, onRefresh, userId, discussionAuthorId, setImageModal }) {
  const [showReply, setShowReply] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = String(userId) === String(comment.author?._id);
  const canDelete = isAuthor || String(userId) === String(discussionAuthorId);

  const handleLike = async () => {
    await fetch(`/api/discussion-forum/comments/${comment._id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    // Instead of forcing a reload, just refresh the comments
    onRefresh();
  };
  const handleDislike = async () => {
    await fetch(`/api/discussion-forum/comments/${comment._id}/dislike`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    onRefresh();
  };
  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    await fetch(`/api/discussion-forum/comments/${comment._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    onRefresh();
  };

  return (
    <div
      className={`relative flex transition-all duration-300 ${depth === 0 ? 'bg-white border border-gray-200 rounded-2xl shadow-lg p-6' : 'bg-transparent border-none p-0'}`} // Changed background and border
      style={{ marginLeft: depth * 32, marginBottom: 12 }}
    >
      {depth > 0 && (
        <div className="flex flex-col items-center mr-3">
          <div className="w-px bg-gray-300 flex-1" style={{ minHeight: '100%' }} /> {/* Changed line color */}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <AdvancedAvatar avatar={comment.author?.avatar} name={comment.author?.name} email={comment.author?.email} size={36} />
          <span className="text-indigo-700 font-semibold text-base">{comment.author?.name || 'Unknown'}</span> {/* Changed text color */}
          <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span> {/* Changed text color */}
          {isAuthor && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-700 font-semibold">Author</span>} {/* Changed background and text color */}
        </div>

        {isAuthor && !showEdit && ( // Show menu only if author and not currently editing
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FiMoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200">
                <button
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                {canDelete && (
                  <button
                    onClick={() => { handleDelete(); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {showEdit ? (
          <div className="mt-2">
            <CommentForm
              isEditMode={true}
              commentId={comment._id}
              initialText={comment.sections.find(s => s.type === 'text')?.content || ''}
              initialExistingFile={
                comment.sections.find(s => s.type === 'file')
                  ? { 
                      name: comment.sections.find(s => s.type === 'file').name, 
                      url: comment.sections.find(s => s.type === 'file').fileUrl, 
                      fileType: comment.sections.find(s => s.type === 'file').fileType 
                    }
                  : null
              }
              onSuccess={() => { setShowEdit(false); onRefresh(); }}
              onCancel={() => setShowEdit(false)}
              discussionId={comment.discussion} // Pass for consistency, form might need it
              parentCommentId={comment.parent} // Pass for consistency
            />
          </div>
        ) : (
          <>
            <div className="mb-2 space-y-3">
              {comment.sections.map((section, idx) => (
                <div key={idx}>
                  {section.type === 'text' ? (
                    <div className="text-gray-700 whitespace-pre-line text-base leading-relaxed tracking-wide">{section.content}</div>
                  ) : section.type === 'file' && section.fileUrl ? (
                    <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition-shadow duration-200">
                      {/* IMAGE RENDERING - MODIFIED */} 
                      {section.fileType && (section.fileType.startsWith('.jpg') || section.fileType.startsWith('.jpeg') || section.fileType.startsWith('.png') || section.fileType.startsWith('.gif') || section.fileType.startsWith('.webp')) ? (
                        <div className="flex flex-col items-start gap-2">
                          <p className="text-sm font-medium text-indigo-700 truncate" title={section.name}>
                            {section.name || 'Image Attachment'}
                          </p>
                          <img
                            src={getAttachmentUrl(section.fileUrl)}
                            alt={section.name || 'Image attachment'}
                            className="rounded-lg border border-gray-300 bg-gray-100 max-w-md max-h-80 cursor-pointer object-contain transition-transform duration-200 hover:scale-105 shadow-md"
                            onClick={() => setImageModal({ open: true, src: getAttachmentUrl(section.fileUrl), alt: section.name || 'Image attachment' })}
                          />
                        </div>
                      /* VIDEO RENDERING - MODIFIED */
                      ) : section.fileType && section.fileType.startsWith('.mp4') ? (
                        <div className="flex flex-col items-start gap-2">
                          <p className="text-sm font-medium text-indigo-700 truncate" title={section.name}>
                            {section.name || 'Video Attachment'}
                          </p>
                          <video controls className="rounded-lg border border-gray-300 bg-gray-100 w-full max-w-md max-h-80 mt-1">
                            <source src={getAttachmentUrl(section.fileUrl)} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      /* PDF RENDERING - Kept as is */
                      ) : section.fileType === '.pdf' ? (
                        <a href={getAttachmentUrl(section.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 group">
                          <FiFileText size={36} className="text-red-500 flex-shrink-0 group-hover:text-red-600" />
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700 truncate" title={section.name}>{section.name || 'PDF Document'}</p>
                            <span className="text-xs text-gray-500 group-hover:text-indigo-500">Open PDF in new tab</span>
                          </div>
                          <FiExternalLink size={20} className="text-gray-400 group-hover:text-indigo-600 ml-auto" />
                        </a>
                      /* OTHER FILES RENDERING - Kept as is */
                      ) : (
                        <a href={getAttachmentUrl(section.fileUrl)} download={section.name || 'download'} className="flex items-center gap-3 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 group">
                          <FiFileText size={36} className="text-gray-500 flex-shrink-0 group-hover:text-indigo-600" />
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700 truncate" title={section.name}>{section.name || 'File Attachment'}</p>
                            <span className="text-xs text-gray-500 group-hover:text-indigo-500">Download file</span>
                          </div>
                          <FiDownload size={20} className="text-gray-400 group-hover:text-indigo-600 ml-auto" />
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-3 text-indigo-600 text-sm font-medium items-center"> {/* Changed text color */}
              <button onClick={handleLike} className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors ${comment.likes?.includes(userId) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600'}`}><FiThumbsUp />{comment.likes?.length || 0}</button> {/* Changed colors */}
              <button onClick={handleDislike} className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors ${comment.dislikes?.includes(userId) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600'}`}><FiThumbsDown />{comment.dislikes?.length || 0}</button> {/* Changed colors */}
              <button onClick={() => setShowReply(v => !v)} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition-colors"><FiMessageCircle />Reply</button> {/* Changed colors */}
            </div>
          </>
        )}

        {!showEdit && showReply && (
          <div className="mt-3 animate-fade-in-down">
            <CommentForm
              discussionId={comment.discussion}
              parentCommentId={comment._id}
              onSuccess={() => { setShowReply(false); onRefresh(); }}
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}
        {!showEdit && comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                depth={depth + 1}
                onRefresh={onRefresh}
                userId={userId}
                discussionAuthorId={discussionAuthorId}
                setImageModal={setImageModal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
