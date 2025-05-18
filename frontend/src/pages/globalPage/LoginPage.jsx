import React, { useState, useEffect } from 'react'
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
  
  useEffect(() => {
    // Set up event listeners for switching between components
    const handleSwitchToSignup = () => setActiveTab('signup')
    const handleSwitchToSignin = () => setActiveTab('signin')
    const handleSwitchToForgot = () => setActiveTab('forgot')
    
    // Add event listeners
    window.addEventListener('switch-to-signup', handleSwitchToSignup)
    window.addEventListener('switch-to-signin', handleSwitchToSignin)
    window.addEventListener('switch-to-forgot', handleSwitchToForgot)
    
    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('switch-to-signup', handleSwitchToSignup)
      window.removeEventListener('switch-to-signin', handleSwitchToSignin)
      window.removeEventListener('switch-to-forgot', handleSwitchToForgot)
    }
  }, [])

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
