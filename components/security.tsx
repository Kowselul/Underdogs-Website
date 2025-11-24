"use client"

import type React from "react"

import { useState } from "react"

export default function Security() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section className="relative min-h-screen bg-background py-24">
      <div className="relative mx-auto max-w-2xl px-6 animate-fadeInUp">
        <div className="space-y-6">
          <div className="rounded-xl p-8" style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Security Settings</h1>
            <p className="text-foreground/60">Manage your account security and privacy</p>
          </div>

          <div
            className="rounded-xl p-8 animate-slideInLeft"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)", animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Password</h2>
                <p className="text-foreground/60 text-sm">Change your password</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="px-4 py-2 text-primary font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: "var(--primary)", opacity: 0.1 }}
              >
                {showPasswordForm ? "Cancel" : "Change"}
              </button>
            </div>

            {showPasswordForm && (
              <div className="space-y-4 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                  />
                </div>
                <button className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover-lift transition-all">
                  Update Password
                </button>
              </div>
            )}
          </div>

          <div
            className="rounded-xl p-8 animate-slideInLeft"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)", animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Two-Factor Authentication</h2>
                <p className="text-foreground/60 text-sm">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover-lift">
                Enable
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-8 animate-slideInLeft"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)", animationDelay: "0.3s" }}
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Active Sessions</h2>
            <div className="space-y-4">
              {["Current Session - Chrome on MacOS", "Mobile App - iPhone", "Web App - Firefox on Windows"].map(
                (session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: "var(--secondary)", opacity: 0.3, border: "1px solid var(--border)" }}
                  >
                    <p className="text-foreground/80 font-medium">{session}</p>
                    <button className="text-sm text-destructive hover:text-destructive/80 font-semibold transition-colors">
                      Revoke
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
