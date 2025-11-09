import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ children, role }){
  const { user, loading } = useAuth()
  if (loading) return <div>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  // role stored in DB as Role or role
  const userRole = user?.Role || user?.role
  if (!userRole) return <Navigate to="/unauthorized" replace />
  if (role && userRole !== role) return <Navigate to="/unauthorized" replace />
  return children
}
