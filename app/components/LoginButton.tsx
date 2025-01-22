"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import {signOut} from "../../utils/supabase/signout"

export default function LoginButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // const signOut = async () => {
  //   await supabase.auth.signOut()
  //   router.refresh()
  // }

  const handleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly",
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      console.log("Successfully initiated Google OAuth login")
    } catch (error) {
      console.error("Error logging in to Google", error)
      alert("Error logging in to Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Sign in with Google"}
      </button>
      {/* logout */}
      <br />
      <br />
      <button
        onClick={() => signOut(router)}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Sign out"}
      </button>
    </div>
  )
}
