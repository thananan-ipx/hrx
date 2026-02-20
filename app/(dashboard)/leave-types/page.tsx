import { getLeaveTypes } from "@/services/leave-type.action"
import { LeaveTypeDialog } from "@/features/leave-types/components/leave-type-dialog"
import { DeleteLeaveTypeButton } from "@/features/leave-types/components/delete-leave-type-button"
import { DataTable } from "@/components/shared/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from "lucide-react"

export default async function LeaveTypesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1
  
  const { data: leaveTypes, totalPages } = await getLeaveTypes(currentPage, 10)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการประเภทวันลา (Leave Types)</h2>
          <p className="text-muted-foreground">ตั้งค่าประเภทการลา โควตาพื้นฐาน และเงื่อนไขการหักเงิน</p>
        </div>
        <LeaveTypeDialog />
      </div>

      <DataTable
        headers={["ID", "ชื่อประเภทวันลา", "โควตาตั้งต้น (วัน)", "การจ่ายเงิน (Paid/Unpaid)", "สถานะ", "จัดการ"]}
        isEmpty={leaveTypes.length === 0}
        emptyMessage='ยังไม่มีข้อมูล กดปุ่ม "เพิ่มประเภทวันลา" เพื่อเริ่มต้น'
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/leave-types?"
      >
        {leaveTypes.map((type) => (
          <TableRow key={type.id}>
            <TableCell className="font-medium">{type.id}</TableCell>
            <TableCell>
              <div>{type.name}</div>
              {type.description && <div className="text-xs text-muted-foreground">{type.description}</div>}
            </TableCell>
            <TableCell>{type.default_quota} วัน</TableCell>
            <TableCell>
              {type.is_paid ? (
                <Badge variant="default" className="bg-green-600/10 text-green-600 hover:bg-green-600/20 shadow-none border-0">Paid Leave</Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-600/10 text-orange-600 hover:bg-orange-600/20 shadow-none border-0">Unpaid Leave</Badge>
              )}
            </TableCell>
            <TableCell>
              {type.is_active ? (
                 <Badge variant="outline">ใช้งาน</Badge>
              ) : (
                 <Badge variant="outline" className="text-muted-foreground">ปิดใช้งาน</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">เปิดเมนู</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  
                  <LeaveTypeDialog initialData={type} />
                  
                  <DropdownMenuSeparator />
                  
                  <DeleteLeaveTypeButton id={type.id} name={type.name} />
                  
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  )
}