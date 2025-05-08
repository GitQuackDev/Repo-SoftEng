import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'react-feather'

const passwordStrength = (password) => {
  let score = 0
  if (!password) return { label: 'Too short', color: 'text-red-500' }
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 2) return { label: 'Weak', color: 'text-red-500' }
  if (score === 3) return { label: 'Medium', color: 'text-yellow-500' }
  if (score >= 4) return { label: 'Strong', color: 'text-green-600' }
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState(1)
  const [emailError, setEmailError] = useState('')
  const [userExists, setUserExists] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')
    setLoading(true)
    try {
      const res = await fetch('/api/user/by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        setUserExists(true)
        setStep(2)
      } else {
        setEmailError('Email not found')
      }
    } catch (err) {
      setEmailError('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setResetError('')
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match')
      return
    }
    if (passwordStrength(newPassword).label === 'Weak' || passwordStrength(newPassword).label === 'Too short') {
      setResetError('Password is too weak')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      })
      if (res.ok) {
        setResetSuccess(true)
      } else {
        setResetError('Failed to reset password')
      }
    } catch (err) {
      setResetError('Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-sky-700 mb-2 text-center">Reset Password</h2>
      {resetSuccess ? (
        <div className="text-green-700 text-center p-3 bg-green-50 border border-green-200 rounded-md">Password reset successful! You may now log in.</div>
      ) : step === 1 ? (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              className="pl-10 pr-3 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {emailError && <div className="text-red-600 text-sm text-center p-2.5 bg-red-50 border border-red-200 rounded-md">{emailError}</div>}
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Next'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New password"
              className="pl-10 pr-10 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
              onClick={() => setShowNewPassword(v => !v)}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          <div className={`text-xs font-medium ${passwordStrength(newPassword)?.color.replace('text-red-500', 'text-red-600').replace('text-yellow-500', 'text-yellow-600').replace('text-green-600', 'text-green-700')}`}>
            Password strength: <span className={passwordStrength(newPassword)?.color.replace('text-red-500', 'text-red-600').replace('text-yellow-500', 'text-yellow-600').replace('text-green-600', 'text-green-700')}>{passwordStrength(newPassword)?.label}</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              className="pl-10 pr-10 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
              onClick={() => setShowConfirmPassword(v => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
          {resetError && <div className="text-red-600 text-sm text-center p-2.5 bg-red-50 border border-red-200 rounded-md">{resetError}</div>}
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  )
}
