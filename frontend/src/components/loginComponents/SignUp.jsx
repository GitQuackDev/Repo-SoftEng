import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock, Mail, Shield } from 'lucide-react'

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
			} else {
				alert('Registration successful! You can now sign in.')
				// Optionally, auto-login or redirect
			}
		} catch {
			setError('Network error')
		}
		setLoading(false)
	}

	return (
		<form
			className="flex flex-col gap-5"
			onSubmit={handleSubmit}
		>
			<h2 className="text-2xl font-semibold text-sky-700 mb-3 text-center">
				Create Account
			</h2>
			{error && (
				<div className="text-red-600 text-sm text-center p-2.5 bg-red-50 border border-red-200 rounded-md">
					{error}
				</div>
			)}
			<div className="relative">
				<User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
				<input
					type="text"
					placeholder="Full Name"
					className="pl-10 pr-3 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
					value={name}
					onChange={e => setName(e.target.value)}
					required
				/>
			</div>
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
			<div className="relative">
				<Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
				<select
					className="pl-10 pr-3 py-3 rounded-md border border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white w-full text-slate-700 placeholder-slate-400 text-sm"
					value={role}
					onChange={e => setRole(e.target.value)}
				>
					{roles.map(r => (
						<option key={r.value} value={r.value} className="text-slate-700">
							{r.label}
						</option>
					))}
				</select>
			</div>
			<button
				type="submit"
				className="bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-md shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60"
				disabled={loading}
			>
				{loading ? 'Signing Up...' : 'Sign Up'}
			</button>
		</form>
	)
}
