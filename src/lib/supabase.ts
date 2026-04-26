import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazily instantiated so `next build` does not fail when env vars are not set
// (they're only needed at request time, not at build time).
let _client: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis')
  }

  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _client
}

// Keep the named export so existing imports don't change,
// but make it a getter proxy so initialisation is deferred.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
