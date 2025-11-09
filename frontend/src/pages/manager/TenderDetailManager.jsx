import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import api from '../../services/api'
import { useParams, Link } from 'react-router-dom'

export default function TenderDetailManager(){
  const { id } = useParams()
  const qc = useQueryClient()
  const [selectedBidId, setSelectedBidId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch tender details
  const { data: tenderData, isLoading: tenderLoading } = useQuery(['tender', id], async ()=>{
    const res = await api.get(`/tenders/${id}`)
    return res.data
  })

  // Fetch bids for this tender
  const { data: bidsData, isLoading: bidsLoading } = useQuery(['tender', id, 'bids'], async ()=>{
    try {
      const res = await api.get(`/tenders/${id}/bids`)
      return res.data.bids || []
    } catch (err) {
      // If endpoint doesn't exist, return empty array
      return []
    }
  })

  if (tenderLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    )
  }

  const tender = tenderData?.tender

  const handleAward = async (bidId) => {
    if (!window.confirm('Award this tender to the selected bidder?')) return
    
    setLoading(true)
    try{
      const res = await api.post(`/tenders/${id}/award`, { bidId })
      alert(res.data.message || 'Tender awarded successfully!')
      qc.invalidateQueries(['tender', id])
      qc.invalidateQueries(['tender', id, 'bids'])
    }catch(err){
      alert(err.message || 'Award failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link to="/manager/tenders" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to My Tenders
      </Link>

      {/* Tender Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{tender?.Tender_Title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Est. Value: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tender?.Estimated_Value || 0)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Deadline: {tender?.Submission_Deadline ? new Date(tender.Submission_Deadline).toLocaleString() : 'N/A'}
          </span>
          <span>
            Status: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(tender?.Status)}`}>
              {tender?.Status || 'Open'}
            </span>
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{tender?.Description || 'No description available'}</p>
        </div>
      </div>

      {/* Bids Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Submitted Bids</h2>

        {bidsLoading ? (
          <div className="text-gray-500">Loading bids...</div>
        ) : bidsData && bidsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold">Select</th>
                  <th className="p-3 text-left font-semibold">Bid ID</th>
                  <th className="p-3 text-left font-semibold">Bidder</th>
                  <th className="p-3 text-left font-semibold">Amount</th>
                  <th className="p-3 text-left font-semibold">Tech Score</th>
                  <th className="p-3 text-left font-semibold">Fin Score</th>
                  <th className="p-3 text-left font-semibold">Total Score</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3 text-left font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {bidsData.map((bid) => (
                  <tr key={bid.Bid_ID} className={`border-b hover:bg-gray-50 transition ${selectedBidId === bid.Bid_ID ? 'bg-blue-50' : ''}`}>
                    <td className="p-3">
                      <input
                        type="radio"
                        name="selectedBid"
                        value={bid.Bid_ID}
                        checked={selectedBidId === bid.Bid_ID}
                        onChange={() => setSelectedBidId(bid.Bid_ID)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3">{bid.Bid_ID}</td>
                    <td className="p-3">{bid.Bidder_Name || bid.Company_Name || `Bidder #${bid.Bidder_ID}`}</td>
                    <td className="p-3 font-semibold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bid.Bid_Amount || 0)}
                    </td>
                    <td className="p-3">{bid.Technical_Score || '-'}</td>
                    <td className="p-3">{bid.Financial_Score || '-'}</td>
                    <td className="p-3 font-semibold">{bid.Total_Score || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getBidStatusBadge(bid.Bid_Status)}`}>
                        {bid.Bid_Status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {bid.Submission_Date ? new Date(bid.Submission_Date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => selectedBidId && handleAward(selectedBidId)}
                disabled={!selectedBidId || loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg shadow transition font-semibold"
              >
                {loading ? 'Processing...' : 'Award to Selected Bidder'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No bids submitted yet for this tender.
          </div>
        )}
      </div>

      {/* Tender Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">Tender Details</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Tender ID</dt>
            <dd className="text-base text-gray-900">{tender?.Tender_ID}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Organization</dt>
            <dd className="text-base text-gray-900">{tender?.Organization_Name || 'N/A'}</dd>
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

function getBidStatusBadge(status) {
  const badges = {
    Pending: 'bg-yellow-100 text-yellow-700',
    'Under Review': 'bg-blue-100 text-blue-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700'
  }
  return badges[status] || 'bg-gray-100 text-gray-700'
}
