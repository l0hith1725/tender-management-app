import React, { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function TendersPage() {
  const { user } = useAuth()
  
  // -----------------------------
  // Local State for Filters
  // -----------------------------
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('')
  const [sortBy, setSortBy] = useState('deadline') // 'deadline' | 'value'
  const [page, setPage] = useState(1)
  const pageSize = 6

  // -----------------------------
  // Fetch Open Tenders
  // -----------------------------
  const { data, isLoading, error, refetch, isFetching } = useQuery(['tenders', 'open'], async () => {
    const res = await api.get('/tenders/open')
    return res.data.tenders
  })

  // -----------------------------
  // Derived Data (Filtering + Sorting + Pagination)
  // -----------------------------
  const filteredData = useMemo(() => {
    if (!data) return []

    let tenders = [...data]

    // Search filter
    if (search.trim()) {
      const s = search.toLowerCase()
      tenders = tenders.filter(t =>
        (t.Tender_Title || '').toLowerCase().includes(s) ||
        (t.Organization_Name || t.Organization || '').toLowerCase().includes(s)
      )
    }

    // Organization filter
    if (orgFilter) {
      tenders = tenders.filter(
        t => (t.Organization_Name || t.Organization) === orgFilter
      )
    }

    // Sorting
    if (sortBy === 'deadline') {
      tenders.sort((a, b) =>
        new Date(a.Submission_Deadline || a.Deadline) - new Date(b.Submission_Deadline || b.Deadline)
      )
    } else if (sortBy === 'value') {
      tenders.sort((a, b) =>
        (b.Estimated_Value || b.EstimatedValue || 0) -
        (a.Estimated_Value || a.EstimatedValue || 0)
      )
    }

    return tenders
  }, [data, search, orgFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const pageData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  const orgOptions = useMemo(() => {
    const orgs = new Set(data?.map(t => t.Organization_Name || t.Organization))
    return Array.from(orgs)
  }, [data])

  // -----------------------------
  // UI Rendering
  // -----------------------------
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl">Loading Tenders…</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 border rounded shadow-sm">
              <div className="h-5 bg-gray-200 mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-100 mb-1 w-1/2"></div>
              <div className="h-4 bg-gray-100 mb-1 w-1/3"></div>
              <div className="h-4 bg-gray-100 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Failed to load tenders: {error.message}
        <button
          onClick={() => refetch()}
          className="ml-2 text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!filteredData.length) {
    return (
      <div className="p-4">
        <h2 className="text-2xl mb-2">Open Tenders</h2>
        <div className="text-gray-500">No tenders found.</div>
      </div>
    )
  }

  // -----------------------------
  // Main Render
  // -----------------------------
  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold">Open Tenders</h2>

        <div className="flex items-center gap-3">
          {/* User Profile Button */}
          {user && (
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">{user?.username || 'Profile'}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search tenders..."
            className="border p-2 rounded w-52"
          />

          {/* Organization Filter */}
          <select
            value={orgFilter}
            onChange={e => { setOrgFilter(e.target.value); setPage(1) }}
            className="border p-2 rounded"
          >
            <option value="">All Organizations</option>
            {orgOptions.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="value">Sort by Value</option>
          </select>
        </div>

      {isFetching && <div className="text-sm text-gray-500">Refreshing data…</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        {pageData.map(t => (
          <div key={t.Tender_ID || t.TenderID} className="p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{t.Tender_Title}</h3>
            <p className="text-sm text-gray-600">{t.Organization_Name || t.Organization}</p>
            <p className="mt-2">
              <span className="font-medium">Estimated Value:</span>{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(t.Estimated_Value || t.EstimatedValue || 0)}
            </p>
            <p>
              <span className="font-medium">Deadline:</span>{' '}
              {new Date(t.Submission_Deadline || t.Deadline).toLocaleDateString()}
            </p>
            <Link
              to={`/tenders/${t.Tender_ID || t.TenderID}`}
              className="inline-block mt-3 text-blue-600 hover:underline"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
