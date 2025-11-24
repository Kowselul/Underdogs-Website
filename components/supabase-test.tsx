"use client"

// Test component to verify Supabase connection
// Add this to any page to test: import SupabaseTest from '@/components/supabase-test'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SupabaseTest() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [message, setMessage] = useState("Checking connection...")
  const supabase = createClient()

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch from a table (will fail if tables don't exist, but connection works)
        const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

        if (error) {
          // Check if it's a "table doesn't exist" error (connection works, but setup not done)
          if (error.message.includes("does not exist")) {
            setStatus("error")
            setMessage("⚠️ Connected to Supabase, but tables not set up. Run the SQL script!")
          } else {
            setStatus("error")
            setMessage(`❌ Error: ${error.message}`)
          }
        } else {
          setStatus("connected")
          setMessage("✅ Supabase connected and tables exist!")
        }
      } catch (err) {
        setStatus("error")
        setMessage(`❌ Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    testConnection()
  }, [supabase])

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "12px 20px",
        borderRadius: "8px",
        backgroundColor: status === "connected" ? "#10b981" : status === "error" ? "#ef4444" : "#3b82f6",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  )
}
