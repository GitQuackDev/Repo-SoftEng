import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { login as doLogin } from '../../auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_URL || '';

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      let data = {}
      let errorText = ''
      try {
        data = await res.clone().json()
      } catch {
        try {
          errorText = await res.text()
        } catch {}
      }
      if (!res.ok) {
        const msg = data.msg || data.error || data.message || errorText || 'Login failed'
        toast.error(msg)
        setLoading(false)
        return
      }
      doLogin(data.token, data.user)
      toast.success('Signed in successfully!')
      if (data.user.role === 'student') navigate('/dashboard')
      else if (data.user.role === 'professor') navigate('/manage-course')
      else if (data.user.role === 'admin') navigate('/admin')
      else navigate('/')
    } catch {
      toast.error('Network error')
    }
    setLoading(false)
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
    <motion.form 
      className="flex flex-col gap-5 max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg" 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
        <h2 className="text-3xl font-bold text-sky-700 mb-2 text-center">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-6">Sign in to continue to your account</p>
      </motion.div>

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
          placeholder="Email"
          className="pl-10 pr-3 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </motion.div>

      <motion.div 
        className="relative"
        initial="blurred"
        whileFocus="focused"
        animate="blurred"
        variants={inputVariants}
        {...fadeIn}
        transition={{ delay: 0.3 }}
      >
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="pl-10 pr-10 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <motion.button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors p-1 rounded-full hover:bg-sky-50"
          tabIndex={-1}
          onClick={() => setShowPassword(v => !v)}
          whileHover={{ rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {formError && (
          <motion.div
            className="bg-red-50 text-red-600 p-2 rounded-lg text-sm flex items-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AlertCircle size={16} className="mr-2" />
            {formError}
          </motion.div>
        )}
      </AnimatePresence>      <motion.div 
        className="flex justify-end mb-2"
        {...fadeIn}
        transition={{ delay: 0.4 }}
      >        <button 
          type="button" 
          onClick={() => {
            const evt = new CustomEvent('switch-to-forgot')
            window.dispatchEvent(evt)
          }} 
          className="text-sm text-sky-600 hover:text-sky-800 transition-colors hover:underline"
        >
          Forgot Password?
        </button>
      </motion.div>

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
            <span>Signing In...</span>
          </motion.div>
        ) : 'Sign In'}
      </motion.button>      <motion.div 
        className="text-center text-sm text-slate-500 mt-4"
        {...fadeIn}
        transition={{ delay: 0.6 }}
      >        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={() => {
            const evt = new CustomEvent('switch-to-signup')
            window.dispatchEvent(evt)
          }}
          className="text-sky-600 hover:text-sky-800 font-medium hover:underline transition-colors bg-transparent border-none p-0 cursor-pointer"
        >
          Sign Up
        </button>
      </motion.div>
    </motion.form>
  )
}
