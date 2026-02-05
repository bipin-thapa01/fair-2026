import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import api from '../../lib/api'

function Toast({ msg, type }) {
  if (!msg) return null
  const bg = type === 'success' 
    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))'
  const color = type === 'success' ? '#059669' : '#DC2626'
  
  return (
    <div style={{
      position: 'fixed',
      right: '24px',
      top: '100px',
      background: bg,
      color: color,
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
      border: '1px solid ' + (type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'),
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: type === 'success' 
          ? 'linear-gradient(135deg, #10B981, #059669)' 
          : 'linear-gradient(135deg, #EF4444, #DC2626)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '14px'
      }}>
        {type === 'success' ? '✓' : '✗'}
      </div>
      {msg}
    </div>
  )
}

const sampleUsers = [
  { id: 'u1', name: 'Asha Gurung', email: 'asha@example.com', role: 'user', status: 'active', joined: '2025-11-15', lastLogin: '2026-01-30 09:45', avatar: 'https://ui-avatars.com/api/?name=Asha+Gurung&background=0F766E&color=fff' },
  { id: 'u2', name: 'Binod Shrestha', email: 'binod@example.com', role: 'user', status: 'active', joined: '2025-12-10', lastLogin: '2026-01-30 08:30', avatar: 'https://ui-avatars.com/api/?name=Binod+Shrestha&background=3B82F6&color=fff' },
  { id: 'u3', name: 'Manager Admin', email: 'admin@example.com', role: 'admin', status: 'active', joined: '2025-10-01', lastLogin: '2026-01-30 10:15', avatar: 'https://ui-avatars.com/api/?name=Manager+Admin&background=8B5CF6&color=fff' },
  { id: 'u4', name: 'Sarita Sharma', email: 'sarita@bqi.gov.np', role: 'inspector', status: 'active', joined: '2025-11-20', lastLogin: '2026-01-30 07:45', avatar: 'https://ui-avatars.com/api/?name=Sarita+Sharma&background=EC4899&color=fff' },
  { id: 'u5', name: 'Rajesh Kumar', email: 'rajesh@bqi.gov.np', role: 'government', status: 'active', joined: '2025-10-15', lastLogin: '2026-01-29 16:20', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=F59E0B&color=fff' },
  { id: 'u6', name: 'Anil Gurung', email: 'anil@example.com', role: 'user', status: 'inactive', joined: '2025-12-05', lastLogin: '2026-01-25 14:30', avatar: 'https://ui-avatars.com/api/?name=Anil+Gurung&background=10B981&color=fff' },
  { id: 'u7', name: 'Sunita Rai', email: 'sunita@example.com', role: 'user', status: 'pending', joined: '2026-01-20', lastLogin: 'Never', avatar: 'https://ui-avatars.com/api/?name=Sunita+Rai&background=64748B&color=fff' },
  { id: 'u8', name: 'Technical Support', email: 'support@bqi.gov.np', role: 'admin', status: 'active', joined: '2025-09-01', lastLogin: '2026-01-30 11:30', avatar: 'https://ui-avatars.com/api/?name=Tech+Support&background=DC2626&color=fff' },
]

export default function Users() {
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [toast, setToast] = useState(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    password: ''
  })
  const [asideOpen, setAsideOpen] = useState(false)

  useEffect(() => {
    const handler = () => setAsideOpen(v => !v)
    window.addEventListener('bqi-toggle-sidebar', handler)
    return () => window.removeEventListener('bqi-toggle-sidebar', handler)
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers()
        setUsers(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching users:', error)
        // fallback to sample data
        setUsers(sampleUsers)
      }
    }

    fetchUsers()
  }, [])

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredUsers = users.filter(user => {
    const roleLowerVal = (user.role || '').toString().toLowerCase()
    const matchesRole = roleFilter === 'all' || roleLowerVal === roleFilter
    const matchesSearch = searchTerm === '' || 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })

  const getRoleColor = (role) => {
    switch(role.toLowerCase()) {
      case 'admin': return '#8B5CF6'
      case 'government': return '#3B82F6'
      case 'inspector': return '#EC4899'
      case 'user': return '#10B981'
      default: return '#64748B'
    }
  }

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return '#10B981'
      case 'inactive': return '#64748B'
      case 'pending': return '#F59E0B'
      case 'suspended': return '#DC2626'
      default: return '#64748B'
    }
  }

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return '🟢'
      case 'inactive': return '⚪'
      case 'pending': return '🟡'
      case 'suspended': return '🔴'
      default: return '⚪'
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditUserModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('bqi_token')
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingUser)
      })

      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u))
        notify('User updated successfully', 'success')
        setShowEditUserModal(false)
      }
    } catch (error) {
      notify('Failed to update user', 'error')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    
    try {
      // Create user via auth signup endpoint (name, email, password)
      const auth = await api.authSignup({ name: newUser.name, email: newUser.email, password: newUser.password })
      // fetch full user
      const created = await api.getUser(auth.userId)

      let finalUser = created

      // If admin provided a different role, attempt to update it via admin PUT (if available)
      try {
        const token = localStorage.getItem('bqi_token')
        if (token && newUser.role && (newUser.role || 'user') !== (created.role || 'user')) {
          const resp = await fetch(`/api/admin/users/${created.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...created, role: newUser.role })
          })
          if (resp.ok) {
            finalUser = await resp.json()
          }
        }
      } catch (err) {
        // non-fatal: role update may not be supported by backend; continue with created user
        console.warn('role update failed or not supported', err)
      }

      setUsers(prev => [...prev, finalUser])
      notify('User added successfully', 'success')
      setShowAddUserModal(false)
      setNewUser({ name: '', email: '', role: 'user', password: '' })
    } catch (error) {
      notify('Failed to add user', 'error')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      notify('Please select users and an action first', 'error')
      return
    }

    try {
      const token = localStorage.getItem('bqi_token')
      const response = await fetch('/api/admin/users/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action: bulkAction
        })
      })

      if (response.ok) {
        if (bulkAction === 'delete') {
          setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)))
        } else {
          setUsers(prev => prev.map(u => 
            selectedUsers.includes(u.id) 
              ? { ...u, status: bulkAction === 'activate' ? 'active' : 'inactive' }
              : u
          ))
        }
        notify(`${selectedUsers.length} users updated successfully`, 'success')
        setSelectedUsers([])
        setBulkAction('')
      }
    } catch (error) {
      notify('Failed to process bulk action', 'error')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    
    try {
      const token = localStorage.getItem('bqi_token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        notify('User deleted successfully', 'success')
      }
    } catch (error) {
      notify('Failed to delete user', 'error')
    }
  }

  return (
    <div className="page-full" style={{
      display: 'flex',
      background: '#F8FAFC',
      minHeight: '100vh'
    }}>
      <Sidebar open={asideOpen} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Topbar onToggle={() => setAsideOpen(v => !v)} />
        
        <div className="container" style={{ padding: '24px' }}>
          <Toast msg={toast?.msg} type={toast?.type} />

          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                color: '#1E293B',
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                User Management
              </h1>
              <p style={{
                margin: '4px 0 0 0',
                color: '#64748B',
                fontSize: '14px'
              }}>
                Manage user accounts, roles, and permissions
              </p>
            </div>
            
            <button
              onClick={() => setShowAddUserModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 118, 110, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>👤</span>
              Add New User
            </button>
          </div>

          {/* Filters and Bulk Actions */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Search Users
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8'
                  }}>
                    🔍
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or role..."
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#F8FAFC',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="government">Government</option>
                  <option value="inspector">Inspector</option>
                  <option value="user">User</option>
                </select>
              </div>

              
            </div>

            {/* Bulk Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>
                  {selectedUsers.length} users selected
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                >
                  <option value="">Bulk Actions</option>
                  <option value="activate">Activate Selected</option>
                  <option value="deactivate">Deactivate Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || selectedUsers.length === 0}
                  style={{
                    padding: '10px 20px',
                    background: bulkAction && selectedUsers.length > 0 
                      ? 'linear-gradient(135deg, #0F766E, #3B82F6)' 
                      : '#CBD5E1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: bulkAction && selectedUsers.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Apply Action
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#1E293B'
              }}>
                User Accounts
              </h3>
              <div style={{ fontSize: '14px', color: '#64748B' }}>
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </div>

            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id))
                          } else {
                            setSelectedUsers([])
                          }
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Password</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(prev => [...prev, user.id])
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id))
                            }
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name||'User')}&background=0F766E&color=fff`} 
                            alt={user.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              border: '2px solid #E2E8F0'
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748B' }}>
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1E293B' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: getRoleColor(user.role) + '20',
                          color: getRoleColor(user.role),
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          <span>👤</span>
                          {user.role}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1E293B' }}>
                        {user.password}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#64748B' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  👤
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  No Users Found
                </h3>
                <p style={{
                  margin: 0,
                  color: '#64748B',
                  fontSize: '14px'
                }}>
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No users in the system yet. Add your first user!'}
                </p>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1E293B'
            }}>
              User Statistics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {[
                { label: 'Total Users', value: users.length, icon: '👥', color: '#3B82F6' },
                { label: 'Admins', value: users.filter(u => (u.role||'').toString().toLowerCase() === 'admin').length, icon: '👑', color: '#8B5CF6' },
                { label: 'Inspectors', value: users.filter(u => (u.role||'').toString().toLowerCase() === 'inspector').length, icon: '🔍', color: '#EC4899' },
                { label: 'Government', value: users.filter(u => (u.role||'').toString().toLowerCase() === 'government').length, icon: '🏛️', color: '#F59E0B' },
                { label: 'Users', value: users.filter(u => (u.role||'').toString().toLowerCase() === 'user').length, icon: '👤', color: '#10B981' }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: stat.color + '10',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${stat.color}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: stat.color + '20',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1E293B'
            }}>
              Add New User
            </h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                  placeholder="Enter full name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  placeholder="Enter email address"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="user">User</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                    onClick={() => {
                    setShowAddUserModal(false)
                    setNewUser({ name: '', email: '', role: 'user', password: '' })
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(100, 116, 139, 0.1)',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{
              margin: '0 0 24px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1E293B'
            }}>
              Edit User
            </h3>
            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="inspector">Inspector</option>
                  <option value="government">Government</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(100, 116, 139, 0.1)',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #0F766E, #3B82F6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #0F766E !important;
          box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed !important;
        }
        
        @media (max-width: 1024px) {
          .container {
            padding: 16px !important;
          }
          
          div[style*="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          table {
            display: block;
            overflow-x: auto;
          }
          
          thead tr {
            display: none;
          }
          
          tbody tr {
            display: block;
            margin-bottom: 16px;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
          }
          
          tbody td {
            display: block;
            text-align: right;
            padding: 12px;
            border-bottom: 1px solid #F1F5F9;
          }
          
          tbody td:before {
            content: attr(data-label);
            float: left;
            font-weight: 600;
            color: #64748B;
            font-size: 12px;
            text-transform: uppercase;
          }
          
          tbody td:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  )
}