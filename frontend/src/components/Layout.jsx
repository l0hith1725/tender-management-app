import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getNavItems = () => {
    if (!user) {
      return [
        { label: 'Tenders', path: '/tenders' },
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' }
      ]
    }

    const role = user.role
    const items = [{ label: 'Dashboard', path: '/dashboard' }]

    if (role === 'admin') {
      items.push(
        { label: 'Users', path: '/admin/users' },
        { label: 'Organizations', path: '/admin/organizations' }
      )
    } else if (role === 'bidder') {
      items.push(
        { label: 'Browse Tenders', path: '/tenders' },
        { label: 'My Bids', path: '/bidder/my-bids' }
      )
    } else if (role === 'tender_manager') {
      items.push(
        { label: 'My Tenders', path: '/manager/tenders' }
      )
    } else if (role === 'evaluator') {
      items.push(
        { label: 'My Assignments', path: '/evaluator/assignments' }
      )
    }

    items.push({ label: 'Profile', path: '/profile' })

    return items
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xl font-bold text-gray-800">TenderMS</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user && (
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* User Info Bar (if logged in) */}
      {user && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    {user.username}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Tender Management System © 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function getRoleBadge(role) {
  const badges = {
    admin: 'bg-purple-100 text-purple-700',
    tender_manager: 'bg-blue-100 text-blue-700',
    bidder: 'bg-green-100 text-green-700',
    evaluator: 'bg-orange-100 text-orange-700'
  }
  return badges[role] || 'bg-gray-100 text-gray-700'
}

function getRoleLabel(role) {
  const labels = {
    admin: 'Administrator',
    tender_manager: 'Tender Manager',
    bidder: 'Bidder',
    evaluator: 'Evaluator'
  }
  return labels[role] || role
}
