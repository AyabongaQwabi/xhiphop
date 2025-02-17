"use client"

import type React from "react"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== undefined) {
        fetch("/auth/callback", {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({ event, session }),
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return children
}

