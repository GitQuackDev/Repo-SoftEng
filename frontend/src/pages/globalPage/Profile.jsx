import React, { useEffect, useState, useRef } from 'react'
const API = import.meta.env.VITE_API_URL || '';
const backendUrl = API;

function getInitials(name, email) {
  if (name && name.trim()) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return '??';
}

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ? backendUrl + user.avatar : null);
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/user/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setAvatarPreview(data.user.avatar ? backendUrl + data.user.avatar : null);
      });
  }, []);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setRemoving(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setRemoving(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    if (removing) {
      formData.append('removeAvatar', '1');
    } else if (fileInputRef.current.files[0]) {
      formData.append('avatar', fileInputRef.current.files[0]);
    }
    const res = await fetch(`${API}/api/user/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (data.user) {
      setUser(data.user);
      setAvatarPreview(data.user.avatar ? backendUrl + data.user.avatar : null);
      localStorage.setItem('user', JSON.stringify(data.user));
      setRemoving(false);
      alert('Profile updated!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8 animate-fade-in border border-slate-200">
        <h1 className="text-3xl font-bold text-sky-600 mb-8 text-center select-none">Profile</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-sky-300 shadow-lg transition-transform duration-300 group-hover:scale-105 animate-avatar-pop"
              />
            ) : (
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-slate-200 text-sky-700 text-5xl font-semibold border-4 border-sky-300 shadow-lg select-none animate-avatar-pop">
                <span className="tracking-normal">
                  {getInitials(name, email)}
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Upload avatar"
            />
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 m-1 bg-white/70 hover:bg-red-500 text-red-500 hover:text-white rounded-full p-1.5 shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Remove profile picture"
              >
                Remove
              </button>
            )}
          </div>
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-left text-slate-700 font-medium text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2.5 w-full text-base bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition placeholder-slate-400"
              placeholder="Your name"
              autoComplete="off"
            />
          </div>
          <div className="w-full flex flex-col gap-1.5">
            <label className="text-left text-slate-700 font-medium text-sm">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="border border-slate-300 rounded-lg px-4 py-2.5 w-full text-base bg-slate-200 text-slate-500 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="loader border-t-2 border-b-2 border-white w-4 h-4 rounded-full animate-spin mr-2"></span>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .animate-avatar-pop { animation: avatarPop 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes avatarPop { from { opacity: 0; transform: scale(0.7);} to { opacity: 1; transform: scale(1);} }
        .loader { border-style: solid; border-color: #fff transparent #fff transparent; }
      `}</style>
    </div>
  );
}
