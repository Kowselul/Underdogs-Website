"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: string
  username: string
  email: string
  role: string
  avatar_url: string
  is_admin: boolean
}

interface AdminPanelProps {
  onUserClick?: (username: string) => void
}

export default function AdminPanel({ onUserClick }: AdminPanelProps) {
  const supabase = createClient()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const isOwner = currentUsername?.toLowerCase() === 'kowse'
  const [managingUserId, setManagingUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Get current user's username
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", authUser.id)
          .single()

        if (profileData) {
          setCurrentUsername(profileData.username)
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, role, avatar_url, is_admin")
        .order("username", { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId)
      setError(null)
      setSuccessMessage(null)

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId)

      if (error) throw error

      setSuccessMessage("Role updated successfully!")
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const updateUserAdmin = async (userId: string, isAdmin: boolean) => {
    // Only owner can modify admin permissions
    if (!isOwner) {
      setError("Only the owner can modify admin permissions")
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setUpdatingUserId(userId)
      setError(null)
      setSuccessMessage(null)

      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", userId)

      if (error) throw error

      setSuccessMessage("Admin status updated successfully!")
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: isAdmin } : u))

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update admin status")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const changeUserPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setUpdatingUserId(userId)
      setError(null)
      setSuccessMessage(null)

      // Get the current user's session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("Not authenticated")
      }

      // Call our API route to change the password
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccessMessage("Password changed successfully!")
      setNewPassword("")

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-foreground/60">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">User Role Management</h2>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500">
          {successMessage}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className="bg-card hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-primary-foreground">
                              {user.username.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => onUserClick?.(user.username)}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          @{user.username}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/70">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${user.role === 'head'
                          ? 'bg-primary text-primary-foreground'
                          : user.role === 'member'
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                          }`}
                      >
                        {user.role === 'head' ? 'Head' : user.role === 'member' ? 'Member' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.is_admin ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                        {user.is_admin ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setManagingUserId(managingUserId === user.id ? null : user.id)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                      >
                        {managingUserId === user.id ? 'Close' : 'Manage User'}
                      </button>
                    </td>
                  </tr>
                  {managingUserId === user.id && (
                    <tr className="bg-secondary/30">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Manage {user.username}</h3>
                          
                          {/* Change Role */}
                          <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-foreground w-32">Change Role:</label>
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              disabled={updatingUserId === user.id}
                              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="user">User</option>
                              <option value="member">Member</option>
                              <option value="head">Head</option>
                            </select>
                          </div>

                          {/* Admin Toggle */}
                          <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-foreground w-32">Admin Status:</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={user.is_admin}
                                onChange={(e) => updateUserAdmin(user.id, e.target.checked)}
                                disabled={!isOwner || updatingUserId === user.id}
                                className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <span className="text-sm text-foreground/70">
                                {user.is_admin ? 'Admin' : 'Not Admin'}
                                {!isOwner && ' (Owner only)'}
                              </span>
                            </label>
                          </div>

                          {/* Change Password */}
                          {isOwner && (
                            <div className="flex items-center gap-4">
                              <label className="text-sm font-semibold text-foreground w-32">Change Password:</label>
                              <div className="flex gap-2 flex-1 items-center">
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="New password (min 6 characters)"
                                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                  disabled={updatingUserId === user.id}
                                />
                                <button
                                  onClick={() => changeUserPassword(user.id)}
                                  disabled={updatingUserId === user.id || !newPassword}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Update Password
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No users found matching your search.</p>
        </div>
      )}
    </div>
  )
}
