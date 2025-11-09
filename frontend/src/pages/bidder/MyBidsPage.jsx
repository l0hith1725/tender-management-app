import React from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function MyBidsPage() {
  const { user } = useAuth()
  const bidderId = user?.id

  const { data, isLoading, error, refetch } = useQuery(
    ['me', 'bids'],
    async () => {
      const res = await api.get('/bids/my-bids')
      return res.data.bids
    },
    { enabled: !!bidderId }
  )

  if (isLoading)
    return <div className="p-4 text-gray-600 italic">Loading your bids…</div>

  if (error)
    return (
      <div className="p-4 text-red-600">
        Failed to load bids: {error.message}
      </div>
    )

  if (!data?.length)
    return (
      <div className="p-4">
        <h2 className="text-2xl mb-4">My Bids</h2>
        <p className="text-gray-600">You haven’t placed any bids yet.</p>
      </div>
    )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">My Bids</h2>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse bg-white shadow-sm rounded">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">Tender</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Tech</th>
              <th className="p-2 text-left">Fin</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Submitted</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.Bid_ID} className="border-t hover:bg-gray-50">
                <td className="p-2">{b.Tender_Title}</td>
                <td className="p-2">₹{Number(b.Bid_Amount).toLocaleString()}</td>
                <td className="p-2">{b.Technical_Score ?? '-'}</td>
                <td className="p-2">{b.Financial_Score ?? '-'}</td>
                <td className="p-2">{b.Total_Score ?? '-'}</td>
                <td className="p-2">
                  <StatusBadge status={b.Bid_Status} />
                </td>
                <td className="p-2">
                  {b.Submission_Date
                    ? new Date(b.Submission_Date).toLocaleDateString()
                    : '-'}
                </td>
                <td className="p-2 text-blue-600">
                  <Link
                    to={`/bids/${b.Bid_ID}`}
                    className="hover:underline text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    Approved: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        colors[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  )
}
