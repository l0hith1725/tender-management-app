import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'

export default function OrganizationsPage(){
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    registrationNumber: '',
    type: ''
  })

  const { data, isLoading, isError, error } = useQuery(['admin','organizations'], async ()=>{
    const res = await api.get('/admin/organizations')
    return res.data.organizations
  })

  const saveOrg = useMutation(
    async (payload) => {
      if (editingOrg) {
        return await api.put(`/admin/organizations/${editingOrg.Organization_ID}`, payload)
      } else {
        return await api.post('/admin/organizations', payload)
      }
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['admin','organizations'])
        setShowModal(false)
        setEditingOrg(null)
        resetForm()
      },
      onError: (err) => alert(err.message || 'Operation failed')
    }
  )

  const deleteOrg = useMutation(
    async (id) => await api.delete(`/admin/organizations/${id}`),
    {
      onSuccess: () => qc.invalidateQueries(['admin','organizations']),
      onError: (err) => alert(err.message || 'Delete failed')
    }
  )

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', email: '', registrationNumber: '', type: '' })
  }

  const handleCreate = () => {
    setEditingOrg(null)
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (org) => {
    setEditingOrg(org)
    setFormData({
      name: org.Organization_Name || '',
      address: org.Address || '',
      phone: org.Phone || '',
      email: org.Email || '',
      registrationNumber: org.Registration_Number || '',
      type: org.Organization_Type || ''
    })
    setShowModal(true)
  }

  const handleDelete = (org) => {
    if (window.confirm(`Delete organization "${org.Organization_Name}"?`)) {
      deleteOrg.mutate(org.Organization_ID)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Organization name is required')
      return
    }
    saveOrg.mutate(formData)
  }

  if (isLoading) return <div className="p-4">Loading…</div>
  if (isError) return <div className="p-4 text-red-600">Error: {error.message}</div>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Organizations</h2>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
        >
          + Create Organization
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Type</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map(o => (
              <tr key={o.Organization_ID} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{o.Organization_ID}</td>
                <td className="p-3 font-medium">{o.Organization_Name}</td>
                <td className="p-3 text-sm">{o.Email || '-'}</td>
                <td className="p-3 text-sm">{o.Phone || '-'}</td>
                <td className="p-3 text-sm">{o.Organization_Type || '-'}</td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(o)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(o)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingOrg ? 'Edit Organization' : 'Create New Organization'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select type</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="NGO">NGO</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingOrg(null)
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {editingOrg ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
