import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Cliente principal (para browsers e actions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Exportação nomeada com o mesmo nome para compatibilidade
export { createClient }

// Função auxiliar para Server Actions (não usa cookies, apenas chaves de ambiente)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
