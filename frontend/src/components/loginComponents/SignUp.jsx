import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Mail, Shield, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const roles = [
	{ value: 'student', label: 'Student' },
	{ value: 'professor', label: 'Professor' },
	{ value: 'admin', label: 'Admin' },
]

export default function SignUp() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [role, setRole] = useState('student')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const handleSubmit = async e => {
		e.preventDefault()
		setLoading(true)
		setError('')
		try {
			const res = await fetch('http://localhost:5000/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password, role }),
			})
			const data = await res.json()
			if (!res.ok) {
				setError(data.msg || 'Registration failed')
				toast.error(data.msg || 'Registration failed')
			} else {
				toast.success('Registration successful! You can now sign in.')
				setTimeout(() => {
					const evt = new CustomEvent('switch-to-signin')
					window.dispatchEvent(evt)
				}, 1200)
			}
		} catch {
			setError('Network error')
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
				<h2 className="text-3xl font-bold text-sky-700 mb-2 text-center">
					Create Account
				</h2>
				<p className="text-slate-500 text-center mb-6">Sign up to get started</p>
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
				<User className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
				<input
					type="text"
					placeholder="Full Name"
					className="pl-10 pr-3 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300"
					value={name}
					onChange={e => setName(e.target.value)}
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
				transition={{ delay: 0.4 }}
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

			<motion.div 
				className="relative"
				initial="blurred"
				whileFocus="focused"
				animate="blurred"
				variants={inputVariants}
				{...fadeIn}
				transition={{ delay: 0.5 }}
			>
				<Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
				<select
					className="pl-10 pr-3 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm transition-all duration-300 appearance-none"
					value={role}					onChange={e => setRole(e.target.value)}
				>
					{roles.map(r => (
						<option key={r.value} value={r.value} className="text-slate-700">
							{r.label}
						</option>
					))}
				</select>
				<div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
					<svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M1 0.5L6 5.5L11 0.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</div>
			</motion.div>

			<AnimatePresence>
				{error && (
					<motion.div
						className="bg-red-50 text-red-600 p-2 rounded-lg text-sm flex items-center"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
					>
						<AlertCircle size={16} className="mr-2" />
						{error}
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
				transition={{ delay: 0.6 }}
			>
				{loading ? (
					<motion.div 
						className="flex items-center justify-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<Loader size={18} className="animate-spin mr-2" />
						<span>Signing Up...</span>
					</motion.div>
				) : 'Sign Up'}
			</motion.button>

			<motion.div 
				className="text-center text-sm text-slate-500 mt-4"
				{...fadeIn}
				transition={{ delay: 0.7 }}
			>
				Already have an account?{' '}
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
	)
}
