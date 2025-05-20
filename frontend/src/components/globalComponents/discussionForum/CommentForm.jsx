import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, Send, Paperclip, XCircle, Save } from 'lucide-react'; // Added Save icon

const API = import.meta.env.VITE_API_URL || '';

export default function CommentForm({
  discussionId,
  onSuccess,
  parentCommentId = null,
  onCancel,
  isEditMode = false,
  commentId = null,
  initialText = '',
  initialExistingFile = null,
}) {
  const [content, setContent] = useState(initialText);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingFile, setExistingFile] = useState(initialExistingFile); // For edit mode
  const [fileRemoved, setFileRemoved] = useState(false); // Track if existing file is marked for removal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode) {
      setContent(initialText);
      setExistingFile(initialExistingFile);
      setSelectedFile(null); // Clear any newly selected file if props change
      setFileRemoved(false); // Reset file removal status
    } else {
      // Reset for new comment/reply form
      setContent('');
      setSelectedFile(null);
      setExistingFile(null);
      setFileRemoved(false);
    }
  }, [isEditMode, initialText, initialExistingFile, commentId]);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File is too large. Maximum size is 10MB.');
        setSelectedFile(null);
        // In edit mode, if a new file is too large, we should not affect the existing file yet.
        // The user might want to cancel this new file selection.
        // So, we don't set setExistingFile(null) or setFileRemoved(true) here.
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setFileError('Invalid file type. Allowed: JPG, PNG, GIF, WEBP, MP4, PDF, DOC, DOCX.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      // When a new file is successfully selected, it implies the existing file (if any) will be replaced upon submission.
      // We don't need to change existingFile state here, but handleSubmit will prioritize selectedFile.
      setFileRemoved(true); // Mark that the original file is intended to be replaced or removed.
      setFileError('');
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // If a new file selection is cleared, the form should revert to using the existingFile if present.
    // So, if initialExistingFile was there, we should consider fileRemoved as false again unless explicitly removed.
    if (initialExistingFile) {
        setFileRemoved(false);
    }
  };

  const removeExistingFile = () => {
    setExistingFile(null);
    setFileRemoved(true); // Mark that the existing file should be removed
    setSelectedFile(null); // Also clear any selected new file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Adjusted condition: if in edit mode, content or a file (either existing and not removed, or newly selected) must be present.
    // Or if not in edit mode, content or a selected file must be present.
    if (!content.trim() && !selectedFile && (!existingFile || fileRemoved)) {
      setError(isEditMode ? 'Cannot save an empty comment. Add text or keep/add a file.' : 'Comment cannot be empty and no file selected.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFileError('');

    let uploadedFileUrl = null;
    let uploadedFileName = null;
    let uploadedFileType = null;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await fetch(`${API}/api/discussion-forum/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
        if (!uploadResponse.ok) {
          const uploadErrorData = await uploadResponse.json();
          throw new Error(uploadErrorData.message || 'Failed to upload file');
        }
        const uploadResult = await uploadResponse.json();
        uploadedFileUrl = uploadResult.fileUrl;
        uploadedFileName = selectedFile.name;
        uploadedFileType = uploadResult.fileType;
      }

      const sections = [];
      if (content.trim()) {
        sections.push({ type: 'text', content: content.trim() });
      }

      if (uploadedFileUrl) { // A new file was uploaded
        sections.push({ type: 'file', fileUrl: uploadedFileUrl, name: uploadedFileName, fileType: uploadedFileType });
      } else if (existingFile && !fileRemoved) { // No new file, but an existing file is kept
        sections.push({ type: 'file', fileUrl: existingFile.url, name: existingFile.name, fileType: existingFile.fileType });
      }
      
      // If fileRemoved is true and no new file uploaded, no file section is added.
      // This means the file is being removed.

      // Check if the comment would be entirely empty after edits
      if (isEditMode && sections.length === 0) {
        setError('Cannot save an empty comment. Add text or a file, or cancel the edit.');
        setIsSubmitting(false);
        return;
      }
      if (!isEditMode && sections.length === 0) { // For new comments, must have some content
         setError('Cannot post an empty comment.');
         setIsSubmitting(false);
         return;
      }

      const apiEndpoint = isEditMode ? `${API}/api/discussion-forum/comments/${commentId}` : `${API}/api/discussion-forum/comments`;
      const method = isEditMode ? 'PUT' : 'POST';

      const body = isEditMode 
        ? { sections } 
        : { discussionId, parentId: parentCommentId || null, sections };

      const response = await fetch(apiEndpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isEditMode ? 'Failed to update comment' : 'Failed to post comment'));
      }

      if (!isEditMode) {
        setContent('');
        setSelectedFile(null);
        setExistingFile(null); 
        setFileRemoved(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isEditMode ? 'Edit your comment...' : (parentCommentId ? 'Write a reply...' : 'Add a comment...')}
        className="w-full p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none overflow-hidden placeholder-gray-400"
        rows="3"
        disabled={isSubmitting}
      />
      
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          id={`file-upload-${commentId || parentCommentId || 'new'}`} // Unique ID for label
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={isSubmitting}
          className="p-2 text-gray-600 hover:text-indigo-600 transition-colors duration-200 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title={isEditMode ? "Change or add file" : "Attach file"}
        >
          <Paperclip size={20} />
        </button>

        {/* Display selected new file */} 
        {selectedFile && (
          <div className="flex items-center space-x-2 text-sm text-gray-700 bg-indigo-100 px-3 py-1.5 rounded-lg">
            <span>New: {selectedFile.name.length > 20 ? `${selectedFile.name.substring(0, 17)}...` : selectedFile.name}</span>
            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={isSubmitting}
              className="text-indigo-500 hover:text-indigo-700"
              title="Clear selected file"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* Display existing file in edit mode if no new file is selected */} 
        {isEditMode && existingFile && !selectedFile && (
          <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
            <span>
              Current: {/* MODIFIED LINE BELOW */}
              {(existingFile.name && typeof existingFile.name === 'string' && existingFile.name.trim() !== '') ?
                (existingFile.name.length > 20 ? `${existingFile.name.substring(0, 17)}...` : existingFile.name)
                : 'Attached File'
              }
            </span>
            <button
              type="button"
              onClick={removeExistingFile}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-red-600"
              title="Remove existing file"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}
      </div>

      {fileError && (
        <p className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded-md flex items-center gap-1">
          <AlertTriangle size={14} /> {fileError}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded-md flex items-center gap-1">
          <AlertTriangle size={14} /> {error}
        </p>
      )}
      <div className={`flex ${parentCommentId && !isEditMode ? 'justify-end' : 'justify-start'} items-center mt-4 space-x-3`}>
        <button
          type="submit"
          disabled={isSubmitting || (!content.trim() && !selectedFile && (!existingFile || fileRemoved))}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 
              {isEditMode ? 'Saving...' : 'Posting...'}
            </>
          ) : (
            <>
              {isEditMode ? <Save size={16} /> : <Send size={16} />}
              {isEditMode ? 'Save Changes' : (parentCommentId ? 'Post Reply' : 'Post Comment')}
            </>
          )}
        </button>
        {(parentCommentId || isEditMode) && onCancel && ( // Show Cancel for replies or edit mode
          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
            }}
            className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
