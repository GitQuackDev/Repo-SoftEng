import React, { useState } from 'react'
import SignIn from '../../components/loginComponents/SignIn'
import SignUp from '../../components/loginComponents/SignUp'
import ForgotPassword from '../../components/loginComponents/ForgotPassword'

const tabs = [
  { label: 'Sign In', value: 'signin' },
  { label: 'Sign Up', value: 'signup' },
  { label: 'Forgot Password', value: 'forgot' },
]

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('signin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-8 space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.value}
              className={`px-5 py-2.5 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                activeTab === tab.value
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="transition-all duration-500">
          {activeTab === 'signin' && <SignIn />}
          {activeTab === 'signup' && <SignUp />}
          {activeTab === 'forgot' && <ForgotPassword />}
        </div>
      </div>
    </div>
  )
}
