'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { LeaveRequest } from '@/types/leave-request'

export async function getCurrentEmployee() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('employees')
    .select('id, department_id, first_name, last_name')
    .eq('auth_user_id', user.id)
    .single()
    
  return data
}

export async function submitLeaveRequest(payload: {
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
}) {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()
  
  if (!employee) return { error: "ไม่พบข้อมูลพนักงาน" }

  const { error } = await supabase
    .from('leave_requests')
    .insert([{
      employee_id: employee.id,
      ...payload
    }])

  if (error) return { error: error.message }

  if (employee.department_id) {
    const { data: dept } = await supabase
      .from('departments')
      .select('manager_id')
      .eq('id', employee.department_id)
      .single()

    if (dept && dept.manager_id) {
      await supabase.from('notifications').insert([{
        employee_id: dept.manager_id,
        title: 'คำขออนุมัติการลาใหม่',
        message: `${employee.first_name} ${employee.last_name} ได้ยื่นคำขออนุมัติการลา โปรดตรวจสอบ`,
        link: '/leave-approvals'
      }])
    }
  }
  
  revalidatePath('/my-leaves')
  return { success: true }
}

export async function getMyLeaveRequests(page: number = 1, limit: number = 10) {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()
  
  if (!employee) throw new Error("Unauthorized")

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      leave_type:leave_types!leave_requests_leave_type_id_fkey(id, name, is_paid),
      approver:employees!leave_requests_approver_id_fkey(id, first_name, last_name)
    `, { count: 'exact' })
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)

  return { 
    data: (data || []) as unknown as LeaveRequest[], 
    totalPages: count ? Math.ceil(count / limit) : 1, 
    currentPage: page 
  }
}

export async function getPendingApprovals(page: number = 1, limit: number = 10) {
  const supabase = await createClient()
  const manager = await getCurrentEmployee()
  
  if (!manager) throw new Error("Unauthorized")

  const { data: managedDepts } = await supabase
    .from('departments')
    .select('id')
    .eq('manager_id', manager.id)

  if (!managedDepts || managedDepts.length === 0) {
     return { data: [], totalPages: 1, currentPage: page }
  }

  const deptIds = managedDepts.map(d => d.id)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      employee:employees!leave_requests_employee_id_fkey!inner(id, first_name, last_name, department_id),
      leave_type:leave_types!leave_requests_leave_type_id_fkey(id, name, is_paid)
    `, { count: 'exact' })
    .in('employees.department_id', deptIds)
    .in('status', ['pending', 'pending_cancellation'])
    .order('created_at', { ascending: true })
    .range(from, to)

  if (error) throw new Error(error.message)

  return { 
    data: (data || []) as unknown as LeaveRequest[], 
    totalPages: count ? Math.ceil(count / limit) : 1, 
    currentPage: page 
  }
}

export async function updateLeaveStatusAction(requestId: number, action: 'approve' | 'reject') {
  const supabase = await createClient()
  const manager = await getCurrentEmployee()
  if (!manager) return { error: "Unauthorized" }

  const { data: targetRequest } = await supabase
    .from('leave_requests')
    .select('employee_id, leave_type:leave_types(name)')
    .eq('id', requestId)
    .single()

  const { data: request } = await supabase
    .from('leave_requests')
    .select('status')
    .eq('id', requestId)
    .single()

  if (!request) return { error: "ไม่พบข้อมูลใบลา" }

  let newStatus = ''
  if (request.status === 'pending') {
    newStatus = action === 'approve' ? 'approved' : 'rejected'
  } else if (request.status === 'pending_cancellation') {
    newStatus = action === 'approve' ? 'cancelled' : 'approved' 
  } else {
    return { error: "สถานะใบลาไม่ถูกต้อง" }
  }

  const { error } = await supabase
    .from('leave_requests')
    .update({ 
      status: newStatus, 
      approver_id: manager.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (error) return { error: error.message }

  if (targetRequest) {
    let title = '';
    let message = '';
    // @ts-ignore
    const leaveName = targetRequest.leave_type?.name || 'การลา';

    if (newStatus === 'approved') {
      title = 'อนุมัติการลาแล้ว';
      message = `คำขอ${leaveName} ของคุณได้รับการอนุมัติแล้ว`;
    } else if (newStatus === 'rejected') {
      title = 'ปฏิเสธการลา';
      message = `คำขอ${leaveName} ของคุณถูกปฏิเสธ`;
    } else if (newStatus === 'cancelled') {
      title = 'อนุมัติการยกเลิกการลา';
      message = `คำขอยกเลิก${leaveName} ของคุณได้รับการอนุมัติแล้ว`;
    }

    if (title) {
      await supabase.from('notifications').insert([{
        employee_id: targetRequest.employee_id,
        title: title,
        message: message,
        link: '/my-leaves'
      }])
    }
  }
  
  revalidatePath('/leave-approvals')
  revalidatePath('/my-leaves')
  return { success: true }
}

export async function getMyLeaveQuotas() {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()
  
  if (!employee) throw new Error("Unauthorized")

  const { data: leaveTypes } = await supabase
    .from('leave_types')
    .select('*')
    .eq('is_active', true)
    
  const { data: empData } = await supabase
    .from('employees')
    .select('job_level:job_levels(annual_leave_quota)')
    .eq('id', employee.id)
    .single()

  // @ts-ignore
  const annualLeaveQuota = empData?.job_level?.annual_leave_quota || 0

  const currentYear = new Date().getFullYear()
  const { data: requests } = await supabase
    .from('leave_requests')
    .select('leave_type_id, total_days, status')
    .eq('employee_id', employee.id)
    .gte('start_date', `${currentYear}-01-01`)
    .lte('end_date', `${currentYear}-12-31`)
    .in('status', ['approved', 'pending'])

  const quotas = leaveTypes?.map(type => {
    let totalQuota = type.default_quota;
    if (type.name.includes('พักร้อน') && annualLeaveQuota > 0) {
       totalQuota = annualLeaveQuota;
    }

    const typeRequests = requests?.filter(r => r.leave_type_id === type.id) || [];
    
    const approvedDays = typeRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + Number(r.total_days), 0);
    const pendingDays = typeRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + Number(r.total_days), 0);
    
    const usedDays = approvedDays + pendingDays;
    const remainingDays = totalQuota - usedDays;

    return {
      id: type.id,
      name: type.name,
      total_quota: totalQuota,
      approved_days: approvedDays,
      pending_days: pendingDays,
      used_days: usedDays,
      remaining_days: remainingDays
    }
  }) || []

  return quotas
}

export async function cancelLeaveRequestAction(requestId: number, currentStatus: string) {
  const supabase = await createClient()
  const employee = await getCurrentEmployee()
  if (!employee) return { error: "Unauthorized" }

  let newStatus = 'cancelled'
  if (currentStatus === 'approved') {
    newStatus = 'pending_cancellation'
  }

  const { error } = await supabase
    .from('leave_requests')
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', requestId)
    .eq('employee_id', employee.id)

  if (error) return { error: error.message }
  
  revalidatePath('/my-leaves')
  revalidatePath('/leave-approvals')
  return { success: true }
}

export async function getApprovalHistory(page: number = 1, limit: number = 10) {
  const supabase = await createClient()
  const manager = await getCurrentEmployee()
  
  if (!manager) throw new Error("Unauthorized")

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await supabase
    .from('leave_requests')
    .select(`
      *,
      employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name, department_id),
      leave_type:leave_types!leave_requests_leave_type_id_fkey(id, name, is_paid)
    `, { count: 'exact' })
    .eq('approver_id', manager.id)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)

  return { 
    data: (data || []) as unknown as LeaveRequest[], 
    totalPages: count ? Math.ceil(count / limit) : 1, 
    currentPage: page 
  }
}