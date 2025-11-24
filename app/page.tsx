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
      return localStorage.getItem("activeTab") || "home"
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

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth...")
        const {
          data: { user },
        } = await supabase.auth.getUser()

        console.log("User:", user)

        if (user) {
          setIsLoggedIn(true)

          // Fetch username from profiles table
          console.log("Fetching profile for user:", user.id)
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
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
    // Re-check auth to get latest user data
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()
      if (profile) {
        setUsername(profile.username)
      }
      setIsLoggedIn(true)
    }
    setActiveTab("home")
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsLoggedIn(false)
      setUsername("")
      setActiveTab("home")
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
  }

  const handleProfileClick = () => {
    setViewingUsername(null)
    setActiveTab("profile")
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
      {activeTab === "profile" && isLoggedIn && <Profile key="profile" activeTab={activeTab} setActiveTab={setActiveTab} viewingUsername={viewingUsername} />}
      {activeTab === "settings" && isLoggedIn && <Profile key="settings" activeTab={activeTab} setActiveTab={setActiveTab} />}

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
