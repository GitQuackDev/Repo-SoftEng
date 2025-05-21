import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

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

const API = import.meta.env.VITE_API_URL || '';

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
      const res = await fetch(`${API}/api/user/by-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        setUserExists(true)
        setStep(2)
        toast.success('Email found! Please set a new password.')
      } else {
        setEmailError('Email not found')
        toast.error('Email not found')
      }
    } catch (err) {
      setEmailError('Server error')
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setResetError('')
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }
    if (passwordStrength(newPassword).label === 'Weak' || passwordStrength(newPassword).label === 'Too short') {
      setResetError('Password is too weak')
      toast.error('Password is too weak')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      })
      if (res.ok) {
        setResetSuccess(true)
        toast.success('Password reset successful! Redirecting to sign in...')
        setTimeout(() => {
          const evt = new CustomEvent('switch-to-signin')
          window.dispatchEvent(evt)
        }, 1200)
      } else {
        setResetError('Failed to reset password')
        toast.error('Failed to reset password')
      }
    } catch (err) {
      setResetError('Server error')
      toast.error('Server error')
    } finally {
      setLoading(false)
    }
  }
  // Custom animations for elements
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  }

  const inputVariants = {
    focused: { boxShadow: '0 0 0 2px rgba(14, 165, 233, 0.3)' },
    blurred: { boxShadow: 'none' }
  }

  return (
    <motion.div 
      className="flex flex-col gap-5 max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <h2 className="text-3xl font-bold text-sky-700 mb-2 text-center">Reset Password</h2>
        <p className="text-slate-500 text-center mb-6">
          {resetSuccess 
            ? "Password has been successfully reset" 
            : step === 1 
              ? "Enter your email to reset your password" 
              : "Create a new secure password"
          }
        </p>
      </motion.div>

      {resetSuccess ? (
        <motion.div 
          className="text-green-700 text-center p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CheckCircle size={20} className="mr-2 text-green-600" />
          <span>Password reset successful! You may now log in.</span>
        </motion.div>
      ) : step === 1 ? (
        <motion.form 
          onSubmit={handleEmailSubmit} 
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="relative"
            initial="blurred"
            whileFocus="focused"
            animate="blurred"
            variants={inputVariants}
            {...fadeIn}
            transition={{ delay: 0.2 }}
          >
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              className="pl-10 pr-3 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </motion.div>

          <AnimatePresence>
            {emailError && (
              <motion.div
                className="bg-red-50 text-red-600 p-2 rounded-lg text-sm flex items-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={16} className="mr-2" />
                {emailError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3.5 rounded-lg shadow hover:shadow-lg transition-all duration-300 focus:outline-none disabled:opacity-70 disabled:from-slate-400 disabled:to-slate-500 mt-2"
            disabled={loading}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            {...fadeIn}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <motion.div 
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader size={18} className="animate-spin mr-2" />
                <span>Checking...</span>
              </motion.div>
            ) : 'Next'}
          </motion.button>
        </motion.form>      ) : (
        <motion.form 
          onSubmit={handleResetSubmit} 
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="relative"
            initial="blurred"
            whileFocus="focused"
            animate="blurred"
            variants={inputVariants}
            {...fadeIn}
            transition={{ delay: 0.2 }}
          >
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New password"
              className="pl-10 pr-10 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <motion.button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-sky-50"
              onClick={() => setShowNewPassword(v => !v)}
              tabIndex={-1}
              whileHover={{ rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {showNewPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </motion.button>
          </motion.div>

          <motion.div 
            className={`text-xs font-medium ${passwordStrength(newPassword)?.color.replace('text-red-500', 'text-red-600').replace('text-yellow-500', 'text-yellow-600').replace('text-green-600', 'text-green-700')} px-2`}
            {...fadeIn} 
            transition={{ delay: 0.3 }}
          >
            Password strength: <span className={passwordStrength(newPassword)?.color.replace('text-red-500', 'text-red-600').replace('text-yellow-500', 'text-yellow-600').replace('text-green-600', 'text-green-700')}>{passwordStrength(newPassword)?.label}</span>
          </motion.div>

          <motion.div 
            className="relative"
            initial="blurred"
            whileFocus="focused"
            animate="blurred"
            variants={inputVariants}
            {...fadeIn}
            transition={{ delay: 0.4 }}
          >
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              className="pl-10 pr-10 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
            <motion.button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-sky-50"
              onClick={() => setShowConfirmPassword(v => !v)}
              tabIndex={-1}
              whileHover={{ rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {resetError && (
              <motion.div
                className="bg-red-50 text-red-600 p-2 rounded-lg text-sm flex items-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={16} className="mr-2" />
                {resetError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3.5 rounded-lg shadow hover:shadow-lg transition-all duration-300 focus:outline-none disabled:opacity-70 disabled:from-slate-400 disabled:to-slate-500 mt-2"
            disabled={loading}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            {...fadeIn}
            transition={{ delay: 0.5 }}
          >
            {loading ? (
              <motion.div 
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader size={18} className="animate-spin mr-2" />
                <span>Resetting...</span>
              </motion.div>
            ) : 'Reset Password'}
          </motion.button>

          <motion.div 
            className="text-center text-sm text-slate-500 mt-4"
            {...fadeIn}
            transition={{ delay: 0.6 }}
          >
            Remember your password?{' '}
            <button 
              type="button"
              onClick={() => {
                const evt = new CustomEvent('switch-to-signin')
                window.dispatchEvent(evt)
              }} 
              className="text-sky-600 hover:text-sky-800 font-medium hover:underline transition-colors"
            >
              Sign In
            </button>
          </motion.div>
        </motion.form>
      )}
    </motion.div>
  )
}
