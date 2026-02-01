import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/db/supabase'

/**
 * 服务端 Supabase Admin 客户端
 * 用于访问 auth.users 等需要 service role 权限的操作
 * 仅可在服务端使用，切勿暴露到客户端
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
