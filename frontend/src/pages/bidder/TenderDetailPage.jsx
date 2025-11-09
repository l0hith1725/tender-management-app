import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import api from '../../services/api'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TenderDetailPage(){
  const { id } = useParams()
  const qc = useQueryClient()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [showBidModal, setShowBidModal] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [emdSubmitted, setEmdSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data, isLoading, error } = useQuery(['tender', id], async ()=>{
    const res = await api.get(`/tenders/${id}`)
    return res.data
  })

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Error loading tender: {error.message}
        </div>
      </div>
    )
  }

  const tender = data?.tender

  const handleRegister = async () => {
    if (!window.confirm('Register for this tender?')) return
    setLoading(true)
    try{
      await api.post(`/bids/${id}/register`)
      qc.invalidateQueries(['tender', id])
      alert('Successfully registered for this tender!')
    }catch(err){
      alert(err.message || 'Registration failed')
    }finally{
      setLoading(false)
    }
  }

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    if (!bidAmount || Number(bidAmount) <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    setLoading(true)
    try{
      await api.post(`/bids/${id}/bid`, { 
        bidAmount: Number(bidAmount), 
        emdSubmitted, 
        documentsAttached: false 
      })
      qc.invalidateQueries(['tender', id])
      qc.invalidateQueries(['me', 'bids'])
      alert('Bid submitted successfully!')
      setShowBidModal(false)
      setBidAmount('')
      setEmdSubmitted(false)
    }catch(err){
      alert(err.message || 'Bid submission failed')
    }finally{
      setLoading(false)
    }
  }

  const isDeadlinePassed = tender?.Submission_Deadline && new Date(tender.Submission_Deadline) < new Date()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link to="/tenders" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Tenders
      </Link>

      {/* Tender Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{tender?.Tender_Title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {tender?.Organization_Name || 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tender?.Estimated_Value || 0)}
          </span>
          <span className={`flex items-center gap-1 ${isDeadlinePassed ? 'text-red-600 font-semibold' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Deadline: {tender?.Submission_Deadline ? new Date(tender.Submission_Deadline).toLocaleString() : 'N/A'}
          </span>
        </div>

        {isDeadlinePassed && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            ⚠️ Submission deadline has passed
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{tender?.Description || 'No description available'}</p>
        </div>
      </div>

      {/* Tender Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Tender Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tender ID</dt>
            <dd className="text-base text-gray-900">{tender?.Tender_ID}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-base text-gray-900">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tender?.Status)}`}>
                {tender?.Status || 'Open'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Published Date</dt>
            <dd className="text-base text-gray-900">
              {tender?.Published_Date ? new Date(tender.Published_Date).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="text-base text-gray-900">{tender?.Category_Name || 'N/A'}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="mb-2">Please login to register or submit a bid</p>
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Go to Login →
          </Link>
        </div>
      )}

      {user && user.role === 'bidder' && !isDeadlinePassed && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="flex gap-3">
            <button 
              onClick={handleRegister} 
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg shadow transition font-semibold"
            >
              {loading ? 'Processing...' : 'Register for Tender'}
            </button>
            <button 
              onClick={() => setShowBidModal(true)} 
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg shadow transition font-semibold"
            >
              Submit Bid
            </button>
            <Link
              to="/bidder/my-bids"
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg transition font-semibold text-center"
            >
              View My Bids
            </Link>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Submit Your Bid</h3>
            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bid Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your bid amount"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Estimated Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tender?.Estimated_Value || 0)}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emd"
                  checked={emdSubmitted}
                  onChange={(e) => setEmdSubmitted(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="emd" className="text-sm">
                  EMD (Earnest Money Deposit) Submitted
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowBidModal(false)
                    setBidAmount('')
                    setEmdSubmitted(false)
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded"
                >
                  {loading ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusBadge(status) {
  const badges = {
    Open: 'bg-green-100 text-green-700',
    Closed: 'bg-red-100 text-red-700',
    Awarded: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-gray-100 text-gray-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}
