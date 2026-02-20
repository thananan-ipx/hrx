// app/(dashboard)/roles/page.tsx
import { getRolesAndPermissions } from "@/services/role.action"
import { PermissionMatrix } from "@/features/roles/components/permission-matrix"
import { Protect } from "@/components/shared/protect"
import { AlertTriangleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function RolesPage() {
  const { roles, permissions, rolePermissions } = await getRolesAndPermissions()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการสิทธิ์ผู้ใช้งาน (Roles & Permissions)</h2>
          <p className="text-muted-foreground">กำหนดสิทธิ์การเข้าถึงเมนูและการดำเนินการต่างๆ แยกตามตำแหน่ง</p>
        </div>
      </div>

      <Protect 
        permission="manage:settings" 
        fallback={
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertTitle>ไม่มีสิทธิ์เข้าถึง</AlertTitle>
            <AlertDescription>คุณไม่มีสิทธิ์ในการจัดการตั้งค่าระบบ (ต้องการสิทธิ์ manage:settings)</AlertDescription>
          </Alert>
        }
      >
        <PermissionMatrix 
          roles={roles} 
          permissions={permissions} 
          rolePermissions={rolePermissions} 
        />
      </Protect>
    </div>
  )
}