"use client"

import { useState } from "react"

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isLoggedIn: boolean
  isDarkMode: boolean
  toggleDarkMode: () => void
  onLogout: () => void
  username?: string
  onSearch?: (query: string) => void
  onProfileClick?: () => void
}

export default function Navigation({
  activeTab,
  setActiveTab,
  isLoggedIn,
  isDarkMode,
  toggleDarkMode,
  onLogout,
  username = "User",
  onSearch,
  onProfileClick,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim())
      setShowSearchDropdown(false)
      setSearchQuery("")
    }
  }

  const tabs = [
    { id: "home", label: "Home" },
    { id: "members", label: "Members" },
    { id: "education", label: "Education" },
  ]

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md animate-fadeIn transition-colors duration-300"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => setActiveTab("home")} 
            className="group flex items-center gap-3 hover-lift"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary">
              UNDERDOGS
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          {isLoggedIn && (
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="px-4 py-2 pr-10 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: "var(--input)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          )}

          {/* Right Side: Dark Mode Toggle + Auth */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Auth Section */}
            <div className="hidden md:flex gap-2">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 sm:gap-2 hover:bg-secondary/50 rounded-lg"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="max-w-[80px] sm:max-w-none truncate">@{username}</span>
                    <svg
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 1 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 sm:w-48 rounded-lg shadow-xl animate-slideInDown z-50"
                      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                    >
                      <button
                        onClick={() => {
                          onProfileClick?.()
                          setActiveTab("profile")
                          setIsUserDropdownOpen(false)
                        }}
                        className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-foreground hover:bg-secondary/50 rounded-t-lg transition-colors text-xs sm:text-sm font-medium"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("settings")
                          setIsUserDropdownOpen(false)
                        }}
                        className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-foreground hover:bg-secondary/50 transition-colors text-xs sm:text-sm font-medium border-t"
                        style={{ borderColor: "var(--border)" }}
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          onLogout()
                          setIsUserDropdownOpen(false)
                        }}
                        className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-destructive hover:bg-secondary/50 rounded-b-lg transition-colors text-xs sm:text-sm font-medium border-t"
                        style={{ borderColor: "var(--border)" }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab("login")}
                    className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover-lift"
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`h-0.5 w-full bg-foreground transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`}
                />
                <span className={`h-0.5 w-full bg-foreground transition-all ${isOpen ? "opacity-0" : ""}`} />
                <span
                  className={`h-0.5 w-full bg-foreground transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-slideInDown">
            {isLoggedIn && (
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none transition-all"
                    style={{
                      backgroundColor: "var(--input)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </form>
              </div>
            )}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    onProfileClick?.()
                    setActiveTab("profile")
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-foreground/70 hover:bg-secondary/50 rounded-lg"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab("settings")
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-foreground/70 hover:bg-secondary/50 rounded-lg"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    onLogout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-destructive hover:bg-secondary/50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab("login")
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-foreground/70 hover:bg-secondary/50 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setActiveTab("register")
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
