import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const user = await login(data.username, data.password)
      const role = user?.Role || user?.role

      if (role === 'admin') navigate('/admin/users')
      else if (role === 'tender_manager') navigate('/manager/dashboard')
      else if (role === 'bidder') navigate('/bidder/tenders')
      else if (role === 'evaluator') navigate('/evaluator/assignments')
      else navigate('/dashboard')
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-3xl font-semibold text-center mb-6 text-blue-700">Welcome Back</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <input
              {...register('username', { required: 'Username is required' })}
              placeholder="Enter your username"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-2 top-2 text-gray-500 hover:text-blue-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold transition ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-gray-600">
          Don’t have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-green-600 hover:underline"
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  )
}
