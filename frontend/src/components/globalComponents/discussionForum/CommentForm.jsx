import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, Send } from 'lucide-react';

export default function CommentForm({ discussionId, onSuccess, parentCommentId = null, onCancel }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto' // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px` // Set to scroll height
    }
  }, [content])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Comment cannot be empty.')
      return
    }
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/discussion-forum/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, parentCommentId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to post comment')
      }

      setContent('')
      if (onSuccess) onSuccess()
      if (onCancel) onCancel() // Close form if it's a reply form
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentCommentId ? 'Write a reply...' : 'Add a comment...'}
        className="w-full p-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none overflow-hidden placeholder-gray-400"
        rows="3"
        disabled={isSubmitting}
      />
      {error && (
        <p className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded-md flex items-center gap-1">
          <AlertTriangle size={14} /> {error}
        </p>
      )}
      <div className={`flex ${parentCommentId ? 'justify-end' : 'justify-start'} items-center mt-3 space-x-3`}>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Posting...
            </>
          ) : (
            <>
              <Send size={16} /> {parentCommentId ? 'Post Reply' : 'Post Comment'}
            </>
          )}
        </button>
        {parentCommentId && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
