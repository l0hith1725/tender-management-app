import React from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ManagerTendersPage(){
  const { user } = useAuth()
  
  const { data, isLoading } = useQuery(['manager','tenders'], async ()=>{
    const res = await api.get('/tenders/open')
    // reuse same view for simplicity; in a real app use organization filter
    return res.data.tenders
  })

  if (isLoading) return <div>Loading…</div>
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Tenders</h2>
        
        <div className="flex gap-3">
          {/* Create Tender Button */}
          <Link 
            to="/manager/tenders/create" 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Tender</span>
          </Link>
          
          {/* User Profile Button */}
          <Link 
            to="/profile" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{user?.username || user?.Role || 'Profile'}</span>
          </Link>
        </div>
      </div>
      <ul className="space-y-2">
        {data?.map(t => (
          <li key={t.Tender_ID} className="p-3 border rounded">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{t.Tender_Title}</h3>
                <div className="text-sm text-gray-600">Status: {t.Status || t.Tender_Status}</div>
              </div>
              <Link to={`/manager/tenders/${t.Tender_ID}`} className="text-blue-600">View</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
