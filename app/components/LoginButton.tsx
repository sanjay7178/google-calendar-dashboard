"use client"

import { useState } from "react"
import { supabase } from "@/utils/supabase"

export default function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar.readonly",
        },
      })
      if (error) throw error
    } catch (error) {
      alert("Error logging in to Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      disabled={loading}
    >
      {loading ? "Loading..." : "Sign in with Google"}
    </button>
  )
}

