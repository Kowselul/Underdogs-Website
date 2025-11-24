"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface ProfileProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
  viewingUsername?: string | null
}

interface Post {
  id: string
  content: string
  image_url?: string
  created_at: string
  updated_at?: string
  likes_count: number
  comments_count: number
  user_liked: boolean
}

interface Profile {
  username: string
  email: string
  bio: string
  avatar_url: string
  involio_profile_url: string
  twitter_url: string
  instagram_url: string
  linkedin_url: string
  youtube_url: string
  discord_tag: string
  tiktok_url: string
  website_url: string
}

export default function Profile({ activeTab = "profile", setActiveTab, viewingUsername }: ProfileProps) {
  const supabase = createClient()

  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [postComments, setPostComments] = useState<{ [key: string]: any[] }>({})
  const [isOwnProfile, setIsOwnProfile] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profile, setProfile] = useState<Profile>({
    username: "",
    email: "",
    bio: "",
    avatar_url: "",
    involio_profile_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    discord_tag: "",
    tiktok_url: "",
    website_url: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) throw new Error("Not authenticated")

        let targetUserId = user.id
        
        // If viewing another user's profile
        if (viewingUsername) {
          const { data: targetProfile, error: targetError } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", viewingUsername)
            .single()

          if (targetError || !targetProfile) {
            throw new Error("User not found")
          }

          targetUserId = targetProfile.id
          setIsOwnProfile(false)
        } else {
          setIsOwnProfile(true)
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", targetUserId)
          .single()

        if (profileError) throw profileError

        setProfile({
          username: profileData.username || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          avatar_url: profileData.avatar_url || "",
          involio_profile_url: profileData.involio_profile_url || "",
          twitter_url: profileData.twitter_url || "",
          instagram_url: profileData.instagram_url || "",
          linkedin_url: profileData.linkedin_url || "",
          youtube_url: profileData.youtube_url || "",
          discord_tag: profileData.discord_tag || "",
          tiktok_url: profileData.tiktok_url || "",
          website_url: profileData.website_url || "",
        })

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false })

        if (postsError) throw postsError

        // Check which posts the current user has liked
        const { data: likesData } = await supabase
          .from("posts_likes")
          .select("post_id")
          .eq("user_id", user.id)

        const likedPostIds = new Set(likesData?.map(like => like.post_id) || [])

        setPosts((postsData || []).map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id),
          comments_count: post.comments_count || 0
        })))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, activeTab, viewingUsername])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) throw new Error("Not authenticated")

      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: urlData.publicUrl })
      setSuccessMessage('Avatar updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const addPost = async (imageFile?: File) => {
    if (!newPost.trim() && !imageFile) return

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Not authenticated")

      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        setUploadingImage(true)
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `post-images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath)
        
        imageUrl = urlData.publicUrl
        setUploadingImage(false)
      }

      const { data, error: postError } = await supabase
        .from("posts")
        .insert({
          content: newPost,
          image_url: imageUrl,
          user_id: user.id,
        })
        .select()
        .single()

      if (postError) throw postError

      setPosts([{ ...data, user_liked: false }, ...posts])
      setNewPost("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post")
      setUploadingImage(false)
    }
  }

  const updatePost = async (postId: string) => {
    if (!editPostContent.trim()) return

    try {
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          content: editPostContent,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)

      if (updateError) throw updateError

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, content: editPostContent, updated_at: new Date().toISOString() }
          : p
      ))
      setEditingPostId(null)
      setEditPostContent("")
      setSuccessMessage("Post updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post")
    }
  }

  const deletePost = async (postId: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      // Delete image from storage if exists
      if (imageUrl) {
        const filePath = imageUrl.split('/posts/')[1]
        if (filePath) {
          await supabase.storage.from('posts').remove([filePath])
        }
      }

      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)

      if (deleteError) throw deleteError

      setPosts(posts.filter(p => p.id !== postId))
      setSuccessMessage("Post deleted successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post")
    }
  }

  const toggleLike = async (postId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const post = posts.find(p => p.id === postId)
      if (!post) return

      if (post.user_liked) {
        // Unlike
        const { error } = await supabase
          .from("posts_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id)

        if (error) throw error

        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count - 1, user_liked: false }
            : p
        ))
      } else {
        // Like
        const { error } = await supabase
          .from("posts_likes")
          .insert({ post_id: postId, user_id: user.id })

        if (error) throw error

        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, likes_count: p.likes_count + 1, user_liked: true }
            : p
        ))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle like")
    }
  }

  const loadComments = async (postId: string) => {
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (commentsError) throw commentsError

      // Fetch user profiles for comments
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))]
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds)

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || [])
        
        const enrichedComments = commentsData.map(comment => ({
          ...comment,
          profiles: profilesMap.get(comment.user_id)
        }))

        setPostComments({ ...postComments, [postId]: enrichedComments })
      } else {
        setPostComments({ ...postComments, [postId]: [] })
      }
    } catch (err) {
      console.error("Failed to load comments:", err)
      setPostComments({ ...postComments, [postId]: [] })
    }
  }

  const toggleComments = async (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
      if (!postComments[postId]) {
        await loadComments(postId)
      }
    }
  }

  const addComment = async (postId: string) => {
    if (!newComment.trim()) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment,
        })
        .select("*")
        .single()

      if (error) throw error

      // Fetch the user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()

      const enrichedComment = {
        ...data,
        profiles: profileData
      }

      setPostComments({
        ...postComments,
        [postId]: [...(postComments[postId] || []), enrichedComment]
      })

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ))

      setNewComment("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment")
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
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
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

      setSuccessMessage("Email update confirmation sent to your new email!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update email")
    }
  }

  const saveProfile = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("Not authenticated")

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
          website_url: profile.website_url,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setIsEditing(false)
      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  if (loading) {
    return (
      <section className="relative min-h-screen bg-background py-24 flex items-center justify-center">
        <div className="text-foreground text-center">
          <p>Loading profile...</p>
        </div>
      </section>
    )
  }

  if (activeTab === "settings") {
    return (
      <section className="relative min-h-screen bg-background py-24">
        <div className="relative mx-auto max-w-2xl px-6 animate-fadeInUp">
          <button
            onClick={() => setActiveTab?.("profile")}
            className="mb-6 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors font-semibold"
          >
            ← Back to Profile
          </button>

          <div className="space-y-6">
            <div
              className="rounded-xl p-8"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
              <p className="text-foreground/60">Manage your account details and security</p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            {/* Email Section */}
            <div
              className="rounded-xl p-8 animate-slideInLeft"
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
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen py-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Profile Header */}
        <div
          className="rounded-2xl p-8 mb-8 animate-fadeInUp"
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            background: `linear-gradient(135deg, var(--secondary) 0%, var(--card) 100%)`,
          }}
        >
          <div className="flex items-start justify-between gap-8 mb-8">
            <div className="flex gap-6 items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 hover-lift overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl font-bold text-primary-foreground">
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
                <h1 className="text-4xl font-bold text-foreground mb-2">@{profile.username}</h1>
                <p className="text-lg text-foreground/70 mb-4">{profile.bio}</p>

                {/* Social Links */}
                <div className="flex gap-4 mb-4 flex-wrap">
                  {profile.twitter_url && (
                    <a
                      href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://${profile.twitter_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }}
                    >
                      Twitter
                    </a>
                  )}
                  {profile.involio_profile_url && (
                    <a
                      href={profile.involio_profile_url.startsWith('http') ? profile.involio_profile_url : `https://${profile.involio_profile_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      Involio
                    </a>
                  )}
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://${profile.instagram_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      Instagram
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.youtube_url && (
                    <a
                      href={profile.youtube_url.startsWith('http') ? profile.youtube_url : `https://${profile.youtube_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      YouTube
                    </a>
                  )}
                  {profile.discord_tag && (
                    <div
                      className="px-4 py-2 rounded-lg font-semibold transition-all"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      Discord: {profile.discord_tag}
                    </div>
                  )}
                  {profile.tiktok_url && (
                    <a
                      href={profile.tiktok_url.startsWith('http') ? profile.tiktok_url : `https://${profile.tiktok_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      TikTok
                    </a>
                  )}
                  {profile.website_url && (
                    <a
                      href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                      style={{
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => (isEditing ? saveProfile() : setIsEditing(true))}
                className="px-6 py-3 rounded-lg font-semibold transition-all hover-lift flex-shrink-0"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>
            )}
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[{ label: "Posts", value: posts.length }].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-lg text-center animate-slideInUp"
                style={{
                  backgroundColor: "var(--background)",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 sticky top-24 animate-fadeInUp space-y-4"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
            >
              <h3 className="text-lg font-bold text-foreground">About</h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell us about yourself"
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all resize-none"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">Twitter URL</label>
                      <input
                        type="text"
                        value={profile.twitter_url}
                        onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                        placeholder="https://twitter.com/..."
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">Involio Profile</label>
                      <input
                        type="text"
                        value={profile.involio_profile_url}
                        onChange={(e) => setProfile({ ...profile, involio_profile_url: e.target.value })}
                        placeholder="https://involio.com/your-profile"
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">Instagram URL</label>
                      <input
                        type="text"
                        value={profile.instagram_url}
                        onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">LinkedIn URL</label>
                      <input
                        type="text"
                        value={profile.linkedin_url}
                        onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">YouTube URL</label>
                      <input
                        type="text"
                        value={profile.youtube_url}
                        onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">Discord Tag</label>
                      <input
                        type="text"
                        value={profile.discord_tag}
                        onChange={(e) => setProfile({ ...profile, discord_tag: e.target.value })}
                        placeholder="username#1234"
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">TikTok URL</label>
                      <input
                        type="text"
                        value={profile.tiktok_url}
                        onChange={(e) => setProfile({ ...profile, tiktok_url: e.target.value })}
                        placeholder="https://tiktok.com/@..."
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-foreground/60 mb-2 block">Website URL</label>
                      <input
                        type="text"
                        value={profile.website_url}
                        onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--input)",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profile.bio && (
                      <div>
                        <p className="text-sm text-foreground/60 mb-2">Bio</p>
                        <p className="text-foreground text-sm">{profile.bio}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post - Only show on own profile */}
            {isOwnProfile && (
              <div
                className="rounded-2xl p-6 animate-fadeInUp"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-primary-foreground text-sm">
                        {profile.username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your thoughts or market insights..."
                    className="flex-1 px-4 py-3 rounded-lg resize-none focus:outline-none transition-all"
                    style={{
                      backgroundColor: "var(--input)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                    rows={3}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                    <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-foreground/70">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          addPost(e.target.files[0])
                          e.target.value = ''
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>
                  <button
                    onClick={() => addPost()}
                    disabled={uploadingImage}
                    className="px-6 py-2 rounded-lg font-semibold transition-all hover-lift disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {uploadingImage ? "Uploading..." : "Post"}
                  </button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
              >
                <p className="text-foreground/60">
                  {isOwnProfile ? "No posts yet. Share your first thought!" : "It's quite quiet in here."}
                </p>
              </div>
            ) : (
              posts.map((post, index) => (
                <div
                  key={post.id}
                  className="rounded-2xl p-6 animate-slideInUp"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-primary-foreground text-sm">
                          {profile.username.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground">@{profile.username}</p>
                          <p className="text-sm text-foreground/60">
                            {new Date(post.created_at).toLocaleDateString()}
                            {post.updated_at && post.updated_at !== post.created_at && (
                              <span className="ml-2 text-xs">(edited)</span>
                            )}
                          </p>
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPostId(post.id)
                                setEditPostContent(post.content)
                              }}
                              className="p-2 text-foreground/60 hover:text-primary transition-colors"
                              title="Edit post"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deletePost(post.id, post.image_url)}
                              className="p-2 text-foreground/60 hover:text-red-500 transition-colors"
                              title="Delete post"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {editingPostId === post.id ? (
                    <div className="mb-4 space-y-3">
                      <textarea
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg resize-none focus:outline-none transition-all"
                        style={{
                          backgroundColor: "var(--input)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePost(post.id)}
                          className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                          style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--primary-foreground)",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPostId(null)
                            setEditPostContent("")
                          }}
                          className="px-4 py-2 rounded-lg font-semibold transition-all hover:bg-secondary/50"
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--foreground)",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-foreground/80 mb-4">{post.content}</p>
                      {post.image_url && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt="Post image" 
                            className="w-full h-auto object-cover max-h-96"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Post Actions */}
                  <div className="flex gap-6 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        post.user_liked ? 'text-red-500' : 'text-foreground/60 hover:text-red-500'
                      }`}
                    >
                      <span>{post.user_liked ? '❤️' : '🤍'}</span>
                      <span className="text-sm">{post.likes_count}</span>
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors"
                    >
                      <span>💬</span>
                      <span className="text-sm">{post.comments_count}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedPost === post.id && (
                    <div className="mt-4 pt-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
                      {/* Comment Input */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-primary-foreground text-xs">
                              {profile.username.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 rounded-lg text-foreground focus:outline-none transition-all"
                            style={{
                              backgroundColor: "var(--input)",
                              border: "1px solid var(--border)",
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addComment(post.id)
                              }
                            }}
                          />
                          <button
                            onClick={() => addComment(post.id)}
                            className="px-4 py-2 rounded-lg font-semibold transition-all hover-lift"
                            style={{
                              backgroundColor: "var(--primary)",
                              color: "var(--primary-foreground)",
                            }}
                          >
                            Post
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {postComments[post.id]?.map((comment: any) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                              {comment.profiles?.avatar_url ? (
                                <img
                                  src={comment.profiles.avatar_url}
                                  alt={comment.profiles.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-primary-foreground text-xs">
                                  {comment.profiles?.username?.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div
                              className="flex-1 px-4 py-2 rounded-lg"
                              style={{ backgroundColor: "var(--secondary)" }}
                            >
                              <p className="font-semibold text-sm text-foreground">
                                @{comment.profiles?.username}
                              </p>
                              <p className="text-foreground/80 text-sm">{comment.content}</p>
                              <p className="text-xs text-foreground/40 mt-1">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {postComments[post.id]?.length === 0 && (
                          <p className="text-center text-foreground/60 text-sm py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
