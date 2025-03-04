'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
          }
        })
        if (signUpError) throw signUpError

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error during authentication:', error.message || error);
    } finally {
      setLoading(false)
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? 'Luo uusi tili' : 'Kirjaudu sisään'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sähköposti</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Salasana</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Ladataan...' : isSignUp ? 'Rekisteröidy' : 'Kirjaudu'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-sm text-gray-400 hover:text-white"
        >
          {isSignUp ? 'Onko sinulla jo tili? Kirjaudu sisään' : 'Eikö sinulla ole tiliä? Rekisteröidy'}
        </button>
      </div>
    </div>
  )
} 