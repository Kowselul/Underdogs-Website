"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LoginProps {
  onSwitchToRegister: () => void
  onLoginSuccess: () => void
}

export default function Login({ onSwitchToRegister, onLoginSuccess }: LoginProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let email = emailOrUsername

      // Check if input is a username (doesn't contain @)
      if (!emailOrUsername.includes('@')) {
        // Fetch email from username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .single()

        if (profileError || !profileData) {
          throw new Error('Username not found')
        }

        email = profileData.email
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
      
      if (data.user) {
        console.log("Login successful, user:", data.user.id)
        // Call the success callback
        onLoginSuccess()
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-background py-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-md px-6 animate-fadeInUp">
        <div className="rounded-xl p-8" style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-foreground/60">Sign in to your Underdogs account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 animate-slideInLeft">
              <label className="block text-sm font-semibold text-foreground">Email or Username</label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="you@example.com or username"
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--input)",
                }}
                required
              />
            </div>

            <div className="space-y-2 animate-slideInLeft" style={{ animationDelay: "0.1s" }}>
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--input)",
                }}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div
              className="flex items-center justify-between text-sm animate-slideInLeft"
              style={{ animationDelay: "0.2s" }}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" style={{ borderColor: "var(--border)" }} />
                <span className="text-foreground/60">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover-lift disabled:opacity-50 transition-all animate-slideInLeft"
              style={{ animationDelay: "0.3s" }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div
            className="mt-6 pt-6 text-center animate-slideInLeft"
            style={{ borderTop: "1px solid var(--border)", animationDelay: "0.4s" }}
          >
            <p className="text-foreground/60">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
