import { createClient } from '@supabase/supabase-js'

// O Next.js só expõe ao navegador as variáveis que começam com NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Se não encontra as variáveis, lança um erro claro no console do navegador
if (!supabaseUrl) {
  console.error('❌ ERRO FATAL: NEXT_PUBLIC_SUPABASE_URL não foi encontrada no navegador.')
}
if (!supabaseAnonKey) {
  console.error('❌ ERRO FATAL: NEXT_PUBLIC_SUPABASE_ANON_KEY não foi encontrada no navegador.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { createClient }
