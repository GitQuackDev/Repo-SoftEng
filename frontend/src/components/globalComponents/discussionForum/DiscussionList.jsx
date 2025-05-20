import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

const API = import.meta.env.VITE_API_URL || '';

export default function DiscussionList({ refresh }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/discussion-forum/discussions`)
      .then(res => res.json())
      .then(data => {
        setDiscussions(data);
        setLoading(false);
      });
  }, [refresh]);

  if (loading) return <div className="text-indigo-600 text-center py-8">Loading discussions...</div>;

  return (
    <div className="space-y-4">
      {discussions.length === 0 && <div className="text-gray-500 text-center py-8">No discussions yet.</div>}
      {discussions.map(disc => (
        <div
          key={disc._id}
          className="border border-gray-200 rounded-xl p-5 bg-white shadow hover:bg-gray-50 cursor-pointer transition-all duration-150 group"
          onClick={() => navigate(`/discussion/${disc._id}`)}
        >
          <h2 className="text-xl font-semibold text-indigo-700 group-hover:text-indigo-800 transition-colors">{disc.title}</h2>
          <div className="text-xs text-gray-500 mb-2">By {disc.author?.name || 'Unknown'} • {new Date(disc.createdAt).toLocaleString()}</div>
          <div className="flex gap-4 mt-2 text-indigo-600 font-medium items-center">
            <span className="flex items-center gap-1"><FiThumbsUp />{disc.likes?.length || 0}</span>
            <span className="flex items-center gap-1"><FiThumbsDown />{disc.dislikes?.length || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
