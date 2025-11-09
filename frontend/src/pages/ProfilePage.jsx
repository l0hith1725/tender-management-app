import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      // This endpoint would need to be implemented in the backend
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      toast.success('Password changed successfully!')
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      tender_manager: 'bg-blue-100 text-blue-700',
      bidder: 'bg-green-100 text-green-700',
      evaluator: 'bg-orange-100 text-orange-700'
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      tender_manager: 'Tender Manager',
      bidder: 'Bidder',
      evaluator: 'Evaluator'
    }
    return labels[role] || role
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {user?.username || 'User Profile'}
                </h1>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">User ID</span>
              <span className="text-gray-800">{user?.id || user?.userId || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">Username</span>
              <span className="text-gray-800">{user?.username || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-medium text-gray-600">Role</span>
              <span className="text-gray-800">{getRoleLabel(user?.role)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-medium text-gray-600">Account Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Security</h2>
          
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white transition ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Changing...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
