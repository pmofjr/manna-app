import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://eeetgtjyrijykejerxab.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZXRndGp5cmlqeWtlamVyeGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMzczMTksImV4cCI6MjA5NTYxMzMxOX0.1bSCP6_L5iPBgoSg_kqeq3zMfisIck49lYDNjK6t1dw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
