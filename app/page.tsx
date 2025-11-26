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
import Settings from "@/components/settings"
import EditProfile from "@/components/edit-profile"
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

  // Check URL parameters on mount and restore state from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname
      const params = new URLSearchParams(window.location.search)
      const userParam = params.get('user')

      // Restore activeTab from URL pathname
      if (pathname === '/profile') {
        setActiveTab('profile')
        if (userParam) {
          setViewingUsername(userParam)
        }
      } else if (pathname === '/members') {
        setActiveTab('members')
      } else if (pathname === '/education') {
        setActiveTab('education')
      } else if (pathname === '/search') {
        setActiveTab('search')
      } else if (pathname === '/settings') {
        setActiveTab('settings')
      } else if (pathname === '/edit-profile') {
        setActiveTab('edit-profile')
      } else if (pathname === '/login') {
        setActiveTab('login')
      } else if (pathname === '/register') {
        setActiveTab('register')
      } else if (pathname === '/') {
        setActiveTab('home')
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

      // Update URL based on active tab
      const url = new URL(window.location.href)

      if (activeTab === "profile" && viewingUsername) {
        // Keep user parameter for viewing other profiles
        url.searchParams.set('user', viewingUsername)
        url.pathname = '/profile'
      } else if (activeTab === "profile" && !viewingUsername) {
        // Own profile
        url.searchParams.delete('user')
        url.pathname = '/profile'
      } else if (activeTab === "home") {
        // Clear everything for home
        url.searchParams.delete('user')
        url.pathname = '/'
      } else if (activeTab === "login") {
        // Show login in URL
        url.searchParams.delete('user')
        url.pathname = '/login'
      } else if (activeTab === "register") {
        // Show register in URL
        url.searchParams.delete('user')
        url.pathname = '/register'
      } else {
        // Other tabs (members, education, search, settings, edit-profile)
        url.searchParams.delete('user')
        url.pathname = `/${activeTab}`
      }

      window.history.replaceState({}, '', url)

      // Clear viewingUsername when navigating away from profile
      if (activeTab !== "profile" && viewingUsername) {
        setViewingUsername(null)
      }
    }
  }, [activeTab, viewingUsername])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let mounted = true

    const checkAuth = async () => {
      try {
        console.log("Checking auth...")

        // First check if there's a session in storage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        console.log("Session:", session, "Error:", sessionError)

        if (!mounted) return

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          setIsLoggedIn(false)
          setUsername("")
          setLoading(false)
          return
        }

        if (session?.user) {
          // Fetch username from profiles table
          console.log("Fetching profile for user:", session.user.id)
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", session.user.id)
              .single()

            console.log("Profile data:", profile, "Error:", profileError)

            if (!mounted) return

            if (profile && profile.username) {
              setUsername(profile.username)
              setIsLoggedIn(true)
            } else {
              console.error("Profile not found or missing username")
              setIsLoggedIn(false)
              setUsername("")
            }
          } catch (profileErr) {
            console.error("Profile fetch error:", profileErr)
            if (mounted) {
              setIsLoggedIn(false)
              setUsername("")
            }
          }
        } else {
          setIsLoggedIn(false)
          setUsername("")
        }

        if (mounted) {
          console.log("Setting loading to false")
          setLoading(false)
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        if (mounted) {
          setIsLoggedIn(false)
          setUsername("")
          setLoading(false)
        }
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user)

      if (!mounted) return

      // Clear any pending timeout when auth state changes
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single()

        if (!mounted) return

        if (profile && profile.username) {
          setUsername(profile.username)
          setIsLoggedIn(true)
        } else {
          console.error("Profile not found in auth state change")
          setIsLoggedIn(false)
          setUsername("")
        }
        setLoading(false)
      } else {
        setIsLoggedIn(false)
        setUsername("")
        setLoading(false)
      }
    })

    // Set a backup timeout only if loading takes too long
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log("Auth check timed out - forcing loading to false")
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => {
      mounted = false
      subscription?.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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
      {activeTab === "profile" && isLoggedIn && <Profile viewingUsername={viewingUsername} onUserClick={handleUserClick} setActiveTab={setActiveTab} />}
      {activeTab === "settings" && isLoggedIn && <Settings setActiveTab={setActiveTab} onUserClick={handleUserClick} />}
      {activeTab === "edit-profile" && isLoggedIn && <EditProfile setActiveTab={setActiveTab} />}

      {(activeTab === "profile" || activeTab === "settings" || activeTab === "edit-profile") && !isLoggedIn && (
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
