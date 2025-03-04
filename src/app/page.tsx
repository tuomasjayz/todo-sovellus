'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import TodoList from '@/components/TodoList'
import Auth from '@/components/Auth'
import { Session } from '@supabase/supabase-js'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Todo-sovellus</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Kirjaudu ulos
          </button>
        </div>
        <TodoList />
      </div>
    </main>
  )
}
