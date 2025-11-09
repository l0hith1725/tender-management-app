import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await api.post('/auth/register', {
        username: data.username,
        password: data.password,
        role: data.role,
      })
      setSuccessMsg('✅ Registration successful! Redirecting to login…')
      reset()
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-3xl font-semibold text-center mb-6 text-green-700">Create Account</h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <input
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
              })}
              placeholder="Enter username"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
              type="password"
              placeholder="Enter password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              type="password"
              placeholder="Confirm password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Select Role</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
            >
              <option value="">-- Select Role --</option>
              <option value="bidder">Bidder</option>
              <option value="tender_manager">Tender Manager</option>
              <option value="evaluator">Evaluator</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold transition ${
              loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-5 text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
