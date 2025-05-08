import React, { useEffect, useState } from 'react';
import DiscussionList from '../../components/globalComponents/discussionForum/DiscussionList';
import DiscussionPost from '../../components/globalComponents/discussionForum/DiscussionPost';
import { MessageSquare } from 'lucide-react';

export default function DiscussionBoard() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8 px-6 py-8 bg-white rounded-xl shadow-lg border border-slate-200 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-sky-700 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-sky-600" />
          Discussion Board
        </h1>
        <button
          className={`bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${showPostForm ? 'ring-2 ring-sky-500' : ''}`}
          onClick={() => setShowPostForm(v => !v)}
        >
          {showPostForm ? 'Cancel' : 'Start a Discussion'}
        </button>
      </div>
      {showPostForm && (
        <div className="mb-8 mt-4 p-5 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
          <DiscussionPost onSuccess={() => { setShowPostForm(false); setRefresh(r => !r); }} />
        </div>
      )}
      <div className="flex flex-col gap-5">
        <DiscussionList refresh={refresh} />
      </div>
    </div>
  );
}
