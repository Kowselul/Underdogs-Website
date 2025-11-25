"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminPanel from "./admin-panel"

interface SettingsProps {
    setActiveTab?: (tab: string) => void
    onUserClick?: (username: string) => void
}

interface Profile {
    username: string
    email: string
    is_admin?: boolean
}

export default function Settings({ setActiveTab, onUserClick }: SettingsProps) {
    const supabase = createClient()
    const [activeSettingsTab, setActiveSettingsTab] = useState<"account" | "admin">("account")
    const [profile, setProfile] = useState<Profile>({ username: "", email: "", is_admin: false })
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [showPasswordForm, setShowPasswordForm] = useState(false)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            setLoading(true)
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()
            if (userError || !user) throw new Error("Not authenticated")

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username, email, is_admin")
                .eq("id", user.id)
                .single()

            if (profileError) throw profileError

            setProfile({
                username: profileData.username || "",
                email: profileData.email || "",
                is_admin: profileData.is_admin || false,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value,
        })
    }

    const updatePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwords.newPassword,
            })

            if (updateError) throw updateError

            setSuccessMessage("Password updated successfully!")
            setPasswords({ newPassword: "", confirmPassword: "" })
            setShowPasswordForm(false)

            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update password")
        }
    }

    const updateEmail = async () => {
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                email: profile.email,
            })

            if (updateError) throw updateError

            setSuccessMessage("Email update requested! Please check your new email for confirmation.")

            setTimeout(() => setSuccessMessage(null), 5000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update email")
        }
    }

    if (loading) {
        return (
            <section className="relative min-h-screen bg-background flex items-center justify-center">
                <p className="text-foreground">Loading...</p>
            </section>
        )
    }

    return (
        <section className="relative min-h-screen bg-background py-12 sm:py-24">
            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 animate-fadeInUp">
                <button
                    onClick={() => setActiveTab?.("profile")}
                    className="mb-4 sm:mb-6 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-foreground/70 hover:text-foreground transition-colors font-semibold"
                >
                    ← Back to Profile
                </button>

                <div className="space-y-4 sm:space-y-6">
                    <div
                        className="rounded-xl p-5 sm:p-8"
                        style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                        <p className="text-foreground/60">Manage your account and preferences</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 border-b border-border">
                        <button
                            onClick={() => setActiveSettingsTab("account")}
                            className={`px-6 py-3 font-semibold transition-colors relative ${activeSettingsTab === "account"
                                    ? "text-primary"
                                    : "text-foreground/60 hover:text-foreground"
                                }`}
                        >
                            Account Settings
                            {activeSettingsTab === "account" && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                        {profile.is_admin && (
                            <button
                                onClick={() => setActiveSettingsTab("admin")}
                                className={`px-6 py-3 font-semibold transition-colors relative ${activeSettingsTab === "admin"
                                        ? "text-primary"
                                        : "text-foreground/60 hover:text-foreground"
                                    }`}
                            >
                                Admin Panel
                                {activeSettingsTab === "admin" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* Account Settings Tab */}
                    {activeSettingsTab === "account" && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Email Section */}
                            <div
                                className="rounded-xl p-5 sm:p-8 animate-slideInLeft"
                                style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)", animationDelay: "0.05s" }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Email</h2>
                                        <p className="text-foreground/60 text-sm">Update your email address</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-foreground">Current Email</label>
                                        <p className="px-4 py-3 rounded-lg text-foreground/70" style={{ backgroundColor: "var(--input)" }}>
                                            {profile.email}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-foreground">New Email</label>
                                        <input
                                            type="email"
                                            placeholder="new.email@example.com"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 transition-all"
                                            style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                        />
                                    </div>
                                    <button
                                        onClick={updateEmail}
                                        className="w-full py-3 bg-black text-white font-bold rounded-lg hover:opacity-90 transition-all"
                                    >
                                        Update Email
                                    </button>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div
                                className="rounded-xl p-5 sm:p-8 animate-slideInLeft"
                                style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)", animationDelay: "0.1s" }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Password</h2>
                                        <p className="text-foreground/60 text-sm">Change your password</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="px-4 py-2 text-white font-semibold rounded-lg transition-colors bg-black hover:opacity-90"
                                    >
                                        {showPasswordForm ? "Cancel" : "Change"}
                                    </button>
                                </div>

                                {showPasswordForm && (
                                    <div className="space-y-4 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
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
                                        <button
                                            onClick={updatePassword}
                                            className="w-full py-3 bg-black text-white font-bold rounded-lg hover:opacity-90 transition-all"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin Panel Tab */}
                    {activeSettingsTab === "admin" && profile.is_admin && (
                        <div
                            className="rounded-xl p-5 sm:p-8 animate-slideInLeft"
                            style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
                        >
                            <AdminPanel onUserClick={onUserClick} />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
