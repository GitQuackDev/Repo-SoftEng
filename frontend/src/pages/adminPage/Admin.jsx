import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Plus, Loader, X, CheckCircle, User, Mail, Lock, Shield } from 'lucide-react'

const roles = [
	{ value: 'student', label: 'Student' },
	{ value: 'professor', label: 'Professor' },
	{ value: 'admin', label: 'Admin' },
]

function UserRow({ user, onEdit, onDelete }) {
	return (
		<tr className="hover:bg-slate-50 transition-colors">
			<td className="py-3 px-4 font-medium flex items-center gap-2">
				<User size={18} className="text-sky-500" /> {user.name}
			</td>
			<td className="py-3 px-4">{user.email}</td>
			<td className="py-3 px-4 capitalize">{user.role}</td>
			<td className="py-3 px-4 text-xs text-slate-400">
				{new Date(user.createdAt).toLocaleDateString()}
			</td>
			<td className="py-3 px-4 flex gap-2">
				<button
					onClick={() => onEdit(user)}
					className="p-2 rounded hover:bg-sky-100 text-sky-600 transition-colors"
					title="Edit"
				>
					<Pencil size={16} />
				</button>
				<button
					onClick={() => onDelete(user)}
					className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
					title="Delete"
				>
					<Trash2 size={16} />
				</button>
			</td>
		</tr>
	)
}

function UserModal({ open, onClose, onSave, initial, isEdit }) {
	const [form, setForm] = useState(
		initial || { name: '', email: '', password: '', role: 'student' }
	)
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		setForm(
			initial || { name: '', email: '', password: '', role: 'student' }
		)
	}, [initial, open])
	const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		await onSave(form, setLoading)
	}
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 animate-fade-in"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.form
						onSubmit={handleSubmit}
						className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative animate-pop-in"
						initial={{ scale: 0.97 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0.97 }}
					>
						<button
							type="button"
							onClick={onClose}
							className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
						>
							<X size={20} />
						</button>
						<h2 className="text-xl font-bold mb-4 text-sky-700">
							{isEdit ? 'Edit User' : 'Add User'}
						</h2>
						<div className="flex flex-col gap-4">
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
								<input
									name="name"
									type="text"
									placeholder="Full Name"
									className="pl-10 pr-3 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none w-full text-slate-700 placeholder-slate-400 text-sm"
									value={form.name}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
								<input
									name="email"
									type="email"
									placeholder="Email"
									className="pl-10 pr-3 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none w-full text-slate-700 placeholder-slate-400 text-sm"
									value={form.email}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
								<input
									name="password"
									type="password"
									placeholder={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
									className="pl-10 pr-3 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none w-full text-slate-700 placeholder-slate-400 text-sm"
									value={form.password}
									onChange={handleChange}
									minLength={isEdit ? 0 : 6}
								/>
							</div>
							<div className="relative">
								<Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
								<select
									name="role"
									className="pl-10 pr-3 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none w-full text-slate-700 text-sm"
									value={form.role}
									onChange={handleChange}
									required
								>
									{roles.map((r) => (
										<option key={r.value} value={r.value}>
											{r.label}
										</option>
									))}
								</select>
							</div>
						</div>
						<button
							type="submit"
							className="w-full mt-6 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:shadow-lg transition-all duration-300 focus:outline-none disabled:opacity-70 disabled:from-slate-400 disabled:to-slate-500"
							disabled={loading}
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<Loader size={18} className="animate-spin mr-2" />
									Saving...
								</span>
							) : isEdit ? (
								'Save Changes'
							) : (
								'Add User'
							)}
						</button>
					</motion.form>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

const API = import.meta.env.VITE_API_URL || '';

export default function Admin() {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [modal, setModal] = useState({ open: false, user: null, isEdit: false })
	const [deleteUser, setDeleteUser] = useState(null)
	const token = localStorage.getItem('token')

	// Fetch all users
	useEffect(() => {
		fetch(`${API}/api/user/`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then((res) => res.json())
			.then((data) => {
				setUsers(data.users || [])
				setLoading(false)
			})
			.catch(() => {
				toast.error('Failed to load users')
				setLoading(false)
			})
	}, [modal, deleteUser])

	// Add or edit user
	const handleSave = async (form, setModalLoading) => {
		try {
			const method = modal.isEdit ? 'PUT' : 'POST'
			const url = modal.isEdit ? `${API}/api/user/${modal.user._id}` : `${API}/api/user/`
			const body = { ...form }
			if (modal.isEdit && !form.password) delete body.password
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.msg || 'Failed to save user')
			toast.success(data.msg || (modal.isEdit ? 'User updated' : 'User added'))
			setModal({ open: false, user: null, isEdit: false })
		} catch (err) {
			toast.error(err.message)
		} finally {
			setModalLoading(false)
		}
	}

	// Delete user
	const handleDelete = async () => {
		if (!deleteUser) return
		try {
			const res = await fetch(`${API}/api/user/${deleteUser._id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.msg || 'Failed to delete user')
			toast.success('User deleted')
			setDeleteUser(null)
		} catch (err) {
			toast.error(err.message)
		}
	}

	return (
		<div className="p-8 min-h-screen bg-slate-50">
			<div className="max-w-5xl mx-auto animate-fade-in">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-indigo-700 mb-1">Admin Panel</h1>
						<p className="text-gray-600">Manage all user accounts below.</p>
					</div>
					<button
						onClick={() => setModal({ open: true, user: null, isEdit: false })}
						className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow hover:shadow-lg transition-all duration-300 focus:outline-none"
					>
						<Plus size={18} /> Add User
					</button>
				</div>
				<div className="bg-white rounded-xl shadow-lg overflow-x-auto animate-pop-in">
					<table className="min-w-full text-left">
						<thead>
							<tr className="border-b text-slate-500 text-sm">
								<th className="py-3 px-4 font-semibold">Name</th>
								<th className="py-3 px-4 font-semibold">Email</th>
								<th className="py-3 px-4 font-semibold">Role</th>
								<th className="py-3 px-4 font-semibold">Created</th>
								<th className="py-3 px-4 font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={5} className="py-8 text-center">
										<Loader className="animate-spin mx-auto text-sky-500" size={32} />
									</td>
								</tr>
							) : users.length === 0 ? (
								<tr>
									<td colSpan={5} className="py-8 text-center text-slate-400">
										No users found.
									</td>
								</tr>
							) : (
								users.map((user) => (
									<UserRow
										key={user._id}
										user={user}
										onEdit={(u) => setModal({ open: true, user: u, isEdit: true })}
										onDelete={(u) => setDeleteUser(u)}
									/>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
			{/* User Modal */}
			<UserModal
				open={modal.open}
				onClose={() => setModal({ open: false, user: null, isEdit: false })}
				onSave={handleSave}
				initial={modal.user}
				isEdit={modal.isEdit}
			/>
			{/* Delete Confirmation */}
			<AnimatePresence>
				{deleteUser && (
					<motion.div
						className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 animate-fade-in"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm animate-pop-in text-center"
							initial={{ scale: 0.97 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.97 }}
						>
							<X size={32} className="mx-auto text-red-400 mb-2" />
							<h2 className="text-xl font-bold mb-2 text-red-700">
								Delete User?
							</h2>
							<p className="mb-6 text-slate-500">
								Are you sure you want to delete{' '}
								<span className="font-semibold">{deleteUser.name}</span>? This action
								cannot be undone.
							</p>
							<div className="flex gap-3 justify-center">
								<button
									onClick={() => setDeleteUser(null)}
									className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
								>
									Cancel
								</button>
								<button
									onClick={handleDelete}
									className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:shadow-lg transition-all duration-300"
								>
									Delete
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
