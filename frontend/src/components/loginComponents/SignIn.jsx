import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { login as doLogin } from '../../auth'
import { useNavigate } from 'react-router-dom'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.msg || 'Login failed')
      } else {
        doLogin(data.token, data.user)
        if (data.user.role === 'student') navigate('/dashboard')
        else if (data.user.role === 'professor') navigate('/manage-course')
        else if (data.user.role === 'admin') navigate('/admin')
        else navigate('/')
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-sky-700 mb-3 text-center">Welcome Back</h2>
      {error && <div className="text-red-600 text-sm text-center p-2.5 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="email"
          placeholder="Email"
          className="pl-10 pr-3 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="pl-10 pr-10 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
          tabIndex={-1}
          onClick={() => setShowPassword(v => !v)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <button
        type="submit"
        className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  )
}
