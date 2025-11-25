"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Members from "@/components/members"
import Education from "@/components/education"
import Login from "@/components/login"
import Register from "@/components/register"
import Profile from "@/components/profile"
import SearchResults from "@/components/search-results"
import Footer from "@/components/footer"

export default function Home() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeTab")
      // Don't restore login/register from localStorage - always start at home if not logged in
      if (saved === "login" || saved === "register") {
        return "home"
      }
      return saved || "home"
    }
    return "home"
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true"
    }
    return false
  })
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewingUsername, setViewingUsername] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Check URL parameters on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const userParam = params.get('user')
      if (userParam) {
        setViewingUsername(userParam)
        setActiveTab("profile")
      }
    }
  }, [])

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeTab", activeTab)
    }
  }, [activeTab])

  useEffect(() => {
    const checkAuth = async () => {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("Auth check timed out")
        setLoading(false)
        setIsLoggedIn(false)
      }, 5000) // 5 second timeout

      try {
        console.log("Checking auth...")

        // First check if there's a session in storage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        console.log("Session:", session, "Error:", sessionError)

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          clearTimeout(timeoutId)
          setIsLoggedIn(false)
          setLoading(false)
          return
        }

        if (session?.user) {
          setIsLoggedIn(true)

          // Fetch username from profiles table
          console.log("Fetching profile for user:", session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", session.user.id)
            .single()

          console.log("Profile data:", profile, "Error:", profileError)

          if (profile) {
            setUsername(profile.username)
          }
        } else {
          setIsLoggedIn(false)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        setIsLoggedIn(false)
      } finally {
        clearTimeout(timeoutId)
        console.log("Setting loading to false")
        setLoading(false)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user)
      if (session?.user) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", session.user.id).single()

        if (profile) {
          setUsername(profile.username)
        }
      } else {
        setIsLoggedIn(false)
        setUsername("")
      }
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  // Handle successful login
  const handleLogin = async () => {
    try {
      console.log("handleLogin called")
      // Wait a bit for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500))

      // Re-check auth to get latest user data
      const { data: { user }, error } = await supabase.auth.getUser()

      console.log("After login - User:", user, "Error:", error)

      if (error) {
        console.error("Error getting user after login:", error)
        return
      }

      if (user) {
        console.log("User found, fetching profile...")
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()

        console.log("Profile:", profile, "Error:", profileError)

        if (profile) {
          setUsername(profile.username)
        }
        setIsLoggedIn(true)
      }
      setActiveTab("home")
      localStorage.setItem("activeTab", "home")
    } catch (err) {
      console.error("handleLogin error:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsLoggedIn(false)
      setUsername("")
      setViewingUsername(null)
      setActiveTab("home")
      localStorage.setItem("activeTab", "home")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  // Apply dark mode to document
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setActiveTab("search")
  }

  const handleUserClick = (username: string) => {
    setViewingUsername(username)
    setActiveTab("profile")
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Update URL with the username parameter
    const url = new URL(window.location.href)
    url.searchParams.set('user', username)
    window.history.pushState({}, '', url)
  }

  const handleProfileClick = () => {
    setViewingUsername(null)
    setActiveTab("profile")
    // Remove user parameter from URL when viewing own profile
    const url = new URL(window.location.href)
    url.searchParams.delete('user')
    window.history.pushState({}, '', url)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        username={username}
        onSearch={handleSearch}
        onProfileClick={handleProfileClick}
      />

      {activeTab === "home" && <Hero setActiveTab={setActiveTab} isLoggedIn={isLoggedIn} />}
      {activeTab === "members" && <Members />}
      {activeTab === "education" && <Education />}
      {activeTab === "search" && <SearchResults searchQuery={searchQuery} onUserClick={handleUserClick} />}
      {activeTab === "login" && (
        <Login onSwitchToRegister={() => setActiveTab("register")} onLoginSuccess={handleLogin} />
      )}
      {activeTab === "register" && (
        <Register onSwitchToLogin={() => setActiveTab("login")} onRegisterSuccess={handleLogin} />
      )}
      {activeTab === "profile" && isLoggedIn && <Profile key="profile" activeTab={activeTab} setActiveTab={setActiveTab} viewingUsername={viewingUsername} onUserClick={handleUserClick} />}
      {activeTab === "settings" && isLoggedIn && <Profile key="settings" activeTab={activeTab} setActiveTab={setActiveTab} onUserClick={handleUserClick} />}

      {(activeTab === "profile" || activeTab === "settings") && !isLoggedIn && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-foreground/60 mb-6">Please log in to access this page</p>
            <button
              onClick={() => setActiveTab("login")}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover-lift"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
