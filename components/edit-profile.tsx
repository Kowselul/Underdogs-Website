"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface EditProfileProps {
    setActiveTab?: (tab: string) => void
}

interface Profile {
    username: string
    bio: string
    avatar_url: string
    involio_profile_url: string
    twitter_url: string
    instagram_url: string
    linkedin_url: string
    youtube_url: string
    discord_tag: string
    tiktok_url: string
}

export default function EditProfile({ setActiveTab }: EditProfileProps) {
    const supabase = createClient()
    const [profile, setProfile] = useState<Profile>({
        username: "",
        bio: "",
        avatar_url: "",
        involio_profile_url: "",
        twitter_url: "",
        instagram_url: "",
        linkedin_url: "",
        youtube_url: "",
        discord_tag: "",
        tiktok_url: "",
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
                .select("*")
                .eq("id", user.id)
                .single()

            if (profileError) throw profileError

            setProfile({
                username: profileData.username || "",
                bio: profileData.bio || "",
                avatar_url: profileData.avatar_url || "",
                involio_profile_url: profileData.involio_profile_url || "",
                twitter_url: profileData.twitter_url || "",
                instagram_url: profileData.instagram_url || "",
                linkedin_url: profileData.linkedin_url || "",
                youtube_url: profileData.youtube_url || "",
                discord_tag: profileData.discord_tag || "",
                tiktok_url: profileData.tiktok_url || "",
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load profile")
        } finally {
            setLoading(false)
        }
    }

    const saveProfile = async () => {
        try {
            setError(null)
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    bio: profile.bio,
                    involio_profile_url: profile.involio_profile_url,
                    twitter_url: profile.twitter_url,
                    instagram_url: profile.instagram_url,
                    linkedin_url: profile.linkedin_url,
                    youtube_url: profile.youtube_url,
                    discord_tag: profile.discord_tag,
                    tiktok_url: profile.tiktok_url,
                })
                .eq("id", user.id)

            if (updateError) throw updateError

            setSuccessMessage("Profile updated successfully!")
            setTimeout(() => {
                setSuccessMessage(null)
                setActiveTab?.("profile")
            }, 1500)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile")
        }
    }

    const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingAvatar(true)
            setError(null)

            if (!e.target.files || e.target.files.length === 0) {
                return
            }

            const file = e.target.files[0]
            const fileExt = file.name.split(".").pop()
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath)

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", user.id)

            if (updateError) throw updateError

            setProfile({ ...profile, avatar_url: publicUrl })
            setSuccessMessage("Avatar updated successfully!")
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload avatar")
        } finally {
            setUploadingAvatar(false)
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
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 animate-fadeInUp">
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
                        <h1 className="text-3xl font-bold text-foreground mb-2">Edit Profile</h1>
                        <p className="text-foreground/60">Update your profile information</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">
                            {successMessage}
                        </div>
                    )}

                    {/* Avatar Section */}
                    <div
                        className="rounded-xl p-5 sm:p-8"
                        style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
                    >
                        <h2 className="text-xl font-bold text-foreground mb-4">Profile Picture</h2>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-primary-foreground">
                                            {profile.username.slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <div className="text-white text-center">
                                        {uploadingAvatar ? (
                                            <div className="text-sm font-semibold">Uploading...</div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                                    />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <div className="text-xs font-semibold">Upload</div>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={uploadAvatar}
                                    disabled={uploadingAvatar}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-foreground font-medium mb-1">@{profile.username}</p>
                                <p className="text-foreground/60 text-sm">Click on the avatar to upload a new picture</p>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div
                        className="rounded-xl p-5 sm:p-8"
                        style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
                    >
                        <h2 className="text-xl font-bold text-foreground mb-4">Bio</h2>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all resize-none"
                            style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                        />
                    </div>

                    {/* Social Links Section */}
                    <div
                        className="rounded-xl p-5 sm:p-8"
                        style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
                    >
                        <h2 className="text-xl font-bold text-foreground mb-4">Social Links</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Involio Profile URL</label>
                                <input
                                    type="url"
                                    value={profile.involio_profile_url}
                                    onChange={(e) => setProfile({ ...profile, involio_profile_url: e.target.value })}
                                    placeholder="https://involio.com/profile/username"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Twitter URL</label>
                                <input
                                    type="url"
                                    value={profile.twitter_url}
                                    onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                                    placeholder="https://twitter.com/username"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Instagram URL</label>
                                <input
                                    type="url"
                                    value={profile.instagram_url}
                                    onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                                    placeholder="https://instagram.com/username"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={profile.linkedin_url}
                                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                    placeholder="https://linkedin.com/in/username"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">YouTube URL</label>
                                <input
                                    type="url"
                                    value={profile.youtube_url}
                                    onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
                                    placeholder="https://youtube.com/@username"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">TikTok URL</label>
                                <input
                                    type="url"
                                    value={profile.tiktok_url}
                                    onChange={(e) => setProfile({ ...profile, tiktok_url: e.target.value })}
                                    placeholder="https://tiktok.com/@username"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Discord Tag</label>
                                <input
                                    type="text"
                                    value={profile.discord_tag}
                                    onChange={(e) => setProfile({ ...profile, discord_tag: e.target.value })}
                                    placeholder="username#1234"
                                    className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab?.("profile")}
                            className="flex-1 py-3 border border-border text-foreground font-bold rounded-lg hover:bg-secondary transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveProfile}
                            className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
