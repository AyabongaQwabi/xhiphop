"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Facebook } from "lucide-react"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-[#1877F2] text-white text-xl font-bold py-4 px-8 rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center justify-center disabled:opacity-50"
      >
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            <Facebook className="w-6 h-6 mr-2" />
            Login with Facebook
          </>
        )}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

