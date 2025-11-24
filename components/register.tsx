"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RegisterProps {
  onSwitchToLogin: () => void
  onRegisterSuccess: () => void
}

export default function Register({ onSwitchToLogin, onRegisterSuccess }: RegisterProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            username: formData.username,
          },
        },
      })

      if (signUpError) throw signUpError
      
      if (data.user) {
        // Wait for profile to be created by trigger
        await new Promise(resolve => setTimeout(resolve, 500))
        router.refresh()
        onRegisterSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-background py-24">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-md px-6 animate-fadeInUp">
        <div className="rounded-xl p-8" style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)" }}>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Join Underdogs</h1>
            <p className="text-foreground/60">Create your trading collective account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-slideInLeft">
              <label className="block text-sm font-semibold text-foreground">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose your username"
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                required
              />
            </div>

            <div className="space-y-2 animate-slideInLeft" style={{ animationDelay: "0.1s" }}>
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                required
              />
            </div>

            <div className="space-y-2 animate-slideInLeft" style={{ animationDelay: "0.2s" }}>
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                required
              />
            </div>

            <div className="space-y-2 animate-slideInLeft" style={{ animationDelay: "0.3s" }}>
              <label className="block text-sm font-semibold text-foreground">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 transition-all"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--input)" }}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div className="flex items-center gap-2 text-sm animate-slideInLeft" style={{ animationDelay: "0.4s" }}>
              <input type="checkbox" className="w-4 h-4 rounded" style={{ borderColor: "var(--border)" }} required />
              <span className="text-foreground/60">I agree to the Terms of Service</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover-lift disabled:opacity-50 transition-all animate-slideInLeft"
              style={{ animationDelay: "0.5s" }}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div
            className="mt-6 pt-6 text-center animate-slideInLeft"
            style={{ borderTop: "1px solid var(--border)", animationDelay: "0.6s" }}
          >
            <p className="text-foreground/60">
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
