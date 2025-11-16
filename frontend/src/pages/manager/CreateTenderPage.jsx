import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import axios from 'axios'

function CreateTenderPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      tenderType: 'Goods',
      documentFee: '0',
      emdAmount: '0'
    }
  })
  
  const submissionDeadline = watch('submissionDeadline')

  const onSubmit = async (data) => {
    setError('')
    setIsSubmitting(true)
    
    try {
      const response = await axios.post('http://localhost:4000/api/tenders', {
        title: data.title,
        description: data.description,
        tenderType: data.tenderType,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        estimatedValue: parseFloat(data.estimatedValue),
        submissionDeadline: data.submissionDeadline,
        openingDate: data.openingDate || null,
        documentFee: parseFloat(data.documentFee),
        emdAmount: parseFloat(data.emdAmount)
      }, { 
        withCredentials: true 
      })

      if (response.data.ok) {
        alert(response.data.message || 'Tender created successfully!')
        navigate('/manager/tenders')
      } else {
        setError(response.data.error || 'Failed to create tender')
      }
    } catch (err) {
      console.error('Create tender error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to create tender')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => navigate('/manager/tenders')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to My Tenders
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Create New Tender</h1>
        <p className="text-gray-600 mt-2">Fill in the details to publish a new tender</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tender Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Supply of Office Equipment"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the tender requirements..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Tender Type and Category ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tender Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tenderType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Goods">Goods</option>
              <option value="Services">Services</option>
              <option value="Works">Works</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category ID <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="number"
              {...register('categoryId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1"
            />
          </div>
        </div>

        {/* Estimated Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Value (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('estimatedValue', { 
              required: 'Estimated value is required',
              min: { value: 1, message: 'Value must be greater than 0' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 500000.00"
          />
          {errors.estimatedValue && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedValue.message}</p>
          )}
        </div>

        {/* Submission Deadline and Opening Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('submissionDeadline', { 
                required: 'Submission deadline is required'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.submissionDeadline && (
              <p className="mt-1 text-sm text-red-600">{errors.submissionDeadline.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Date <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <input
              type="datetime-local"
              {...register('openingDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              If not set, defaults to 1 day after submission deadline
            </p>
          </div>
        </div>

        {/* Document Fee and EMD Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Fee (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('documentFee')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1000.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              EMD Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('emdAmount')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 10000.00"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Tender'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/manager/tenders')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTenderPage
