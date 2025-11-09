import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'bidder' });

  // Fetch all users
  const { data: users, isLoading, isError, error } = useQuery(
    ['admin', 'users'], 
    async () => {
      console.log('Fetching users from /admin/users...');
      const res = await api.get('/admin/users');
      console.log('Users response:', res.data);
      return res.data.users;
    },
    {
      onError: (err) => {
        console.error('Failed to fetch users:', err);
      }
    }
  );

  // Mutation for creating/updating a user
  const saveUser = useMutation(
    async (payload) => {
      if (editingUser) {
        const res = await api.put(`/admin/users/${editingUser.User_ID}`, payload);
        return res.data;
      } else {
        const res = await api.post('/admin/users', payload);
        return res.data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
        setShowModal(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'bidder' });
      },
      onError: (err) => {
        alert(err.message || 'Operation failed');
      }
    }
  );

  // Mutation for deleting a user
  const deleteUser = useMutation(
    async (userId) => {
      await api.delete(`/admin/users/${userId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'users']);
      },
      onError: (err) => {
        alert(err.message || 'Delete failed');
      }
    }
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Users</h2>
          <p className="text-red-600 mb-4">{error?.message || 'Failed to load users'}</p>
          <div className="text-sm text-gray-600 mb-4">
            <p><strong>Possible reasons:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You are not logged in - <a href="/login" className="text-blue-600 underline">Go to Login</a></li>
              <li>Your session expired</li>
              <li>You don't have admin permissions</li>
              <li>Backend server is not running</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'bidder' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.Username, password: '', role: user.Role });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Delete user "${user.Username}"?`)) {
      deleteUser.mutate(user.User_ID);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.role) {
      alert('Username and role are required');
      return;
    }
    if (!editingUser && !formData.password) {
      alert('Password is required for new users');
      return;
    }
    saveUser.mutate(formData);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition"
        >
          + Create User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Username</th>
              <th className="p-3 text-left font-semibold">Role</th>
              <th className="p-3 text-left font-semibold">Created</th>
              <th className="p-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.User_ID} className="border-b hover:bg-gray-50 transition">
                <td className="p-3">{u.User_ID}</td>
                <td className="p-3 font-medium">{u.Username}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadge(u.Role)}`}>
                    {u.Role}
                  </span>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {u.Created_Date ? new Date(u.Created_Date).toLocaleDateString() : '-'}
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
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

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border rounded"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="tender_manager">Tender Manager</option>
                  <option value="bidder">Bidder</option>
                  <option value="evaluator">Evaluator</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getRoleBadge(role) {
  const badges = {
    admin: 'bg-purple-100 text-purple-700',
    tender_manager: 'bg-blue-100 text-blue-700',
    bidder: 'bg-green-100 text-green-700',
    evaluator: 'bg-orange-100 text-orange-700'
  };
  return badges[role] || 'bg-gray-100 text-gray-700';
}
