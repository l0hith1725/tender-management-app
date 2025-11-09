import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import TendersPage from './pages/bidder/TendersPage'
import TenderDetailPage from './pages/bidder/TenderDetailPage'
import MyBidsPage from './pages/bidder/MyBidsPage'
import ManagerTendersPage from './pages/manager/TendersPage'
import ManagerTenderDetail from './pages/manager/TenderDetailManager'
import EvaluatorAssignments from './pages/evaluator/AssignmentsPage'
import EvaluatorReviewForm from './pages/evaluator/ReviewForm'
import AdminUsers from './pages/admin/UsersPage'
import AdminOrgs from './pages/admin/OrganizationsPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

export default function App(){
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>} />
          <Route path="/tenders" element={<TendersPage/>} />
          <Route path="/tenders/:id" element={<TenderDetailPage/>} />
          <Route path="/bidder/my-bids" element={<ProtectedRoute><MyBidsPage/></ProtectedRoute>} />
          <Route path="/manager/tenders" element={<ProtectedRoute><ManagerTendersPage/></ProtectedRoute>} />
          <Route path="/manager/tenders/:id" element={<ProtectedRoute><ManagerTenderDetail/></ProtectedRoute>} />
          <Route path="/evaluator/assignments" element={<ProtectedRoute><EvaluatorAssignments/></ProtectedRoute>} />
          <Route path="/evaluator/reviews/:reviewId" element={<ProtectedRoute><EvaluatorReviewForm/></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers/></ProtectedRoute>} />
          <Route path="/admin/organizations" element={<ProtectedRoute><AdminOrgs/></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/tenders" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
