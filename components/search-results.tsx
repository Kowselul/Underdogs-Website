"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SearchResultsProps {
  searchQuery: string
  onUserClick: (username: string) => void
}

interface UserResult {
  id: string
  username: string
  bio: string
  avatar_url: string
}

export default function SearchResults({ searchQuery, onUserClick }: SearchResultsProps) {
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const searchUsers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, bio, avatar_url")
          .ilike("username", `%${searchQuery}%`)
          .limit(20)

        if (error) throw error
        setResults(data || [])
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    if (searchQuery) {
      searchUsers()
    }
  }, [searchQuery, supabase])

  if (loading) {
    return (
      <section className="min-h-screen bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="text-foreground text-center">Searching...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-foreground mb-2">Search Results</h2>
          <p className="text-foreground/60">
            Found {results.length} {results.length === 1 ? "user" : "users"} matching "{searchQuery}"
          </p>
        </div>

        {results.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
          >
            <p className="text-foreground/60">No users found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserClick(user.username)}
                className="text-left rounded-xl p-6 transition-all duration-300 hover-lift"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-primary-foreground text-xl">
                        {user.username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">@{user.username}</h3>
                    {user.bio && (
                      <p className="text-sm text-foreground/60 line-clamp-2 mt-1">{user.bio}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">View Profile →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
