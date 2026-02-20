'use server'

import { createClient } from '@/lib/supabase/server'

export async function loginAction(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: employeeData } = await supabase
    .from('employees')
    .select('id, deleted_at, is_active')
    .eq('auth_user_id', data.user.id)
    .single()

  if (employeeData?.deleted_at !== null || employeeData?.is_active === false) {
    await supabase.auth.signOut()
    return { error: "บัญชีผู้ใช้นี้ถูกระงับหรือถูกลบออกจากระบบแล้ว" }
  }

  return { success: true, employeeId: employeeData?.id }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}