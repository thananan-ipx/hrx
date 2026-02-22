import Link from "next/link"
import { getPendingApprovals, getApprovalHistory } from "@/services/leave-request.action"
import { LeaveApprovalActions } from "@/features/leave-requests/components/leave-approval-actions"
import { DataTable } from "@/components/shared/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { th } from "date-fns/locale"

function formatShortDate(dateString: string) {
  if (!dateString) return "-"
  return format(new Date(dateString), "d MMM yyyy", { locale: th })
}

function formatDateTime(dateString: string) {
  if (!dateString) return "-"
  return format(new Date(dateString), "d MMM yyyy HH:mm", { locale: th })
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved': return <Badge className="bg-green-500 hover:bg-green-600">อนุมัติแล้ว</Badge>
    case 'rejected': return <Badge variant="destructive">ไม่อนุมัติ</Badge>
    case 'cancelled': return <Badge variant="secondary">ยกเลิก</Badge>
    case 'pending_cancellation': return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">รอหัวหน้าอนุมัติยกเลิก</Badge>
    case 'pending_cancellation_hr': return <Badge className="bg-purple-500 hover:bg-purple-600 text-white">รอ HR อนุมัติยกเลิก</Badge>
    case 'pending_manager': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">รอหัวหน้าตรวจสอบ</Badge>
    case 'pending_hr': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">รอ HR อนุมัติ</Badge>
    case 'pending': return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">รอตรวจสอบ</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function LeaveApprovalsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const tab = (searchParams?.tab as string) || "pending"
  const currentPage = Number(searchParams?.page) || 1

  const [
    { data: pendingLeaves, totalPages: pendingTotal },
    { data: historyLeaves, totalPages: historyTotal }
  ] = await Promise.all([
    getPendingApprovals(tab === 'pending' ? currentPage : 1, 10),
    getApprovalHistory(tab === 'history' ? currentPage : 1, 10)
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">อนุมัติการลา (Leave Approvals)</h2>
          <p className="text-muted-foreground">รายการรออนุมัติและประวัติการอนุมัติของคุณ</p>
        </div>
      </div>

      <Tabs defaultValue={tab} className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="pending" asChild>
            <Link href="?tab=pending">รอตรวจสอบ {pendingLeaves.length > 0 && `(${pendingLeaves.length})`}</Link>
          </TabsTrigger>
          <TabsTrigger value="history" asChild>
            <Link href="?tab=history">ประวัติการอนุมัติ</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="m-0">
          <DataTable
            headers={["ชื่อพนักงาน", "ประเภทการลา", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "จำนวนวัน", "เหตุผล", "จัดการ"]}
            isEmpty={pendingLeaves.length === 0}
            emptyMessage='ไม่มีรายการขออนุมัติการลาในขณะนี้'
            currentPage={tab === 'pending' ? currentPage : 1}
            totalPages={pendingTotal}
            basePath="/leave-approvals?tab=pending&"
          >
            {pendingLeaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">
                  {leave.employee ? `${leave.employee.first_name} ${leave.employee.last_name}` : "ไม่ทราบชื่อ"}
                </TableCell>
                <TableCell>
                  {leave.leave_type?.name}
                  {leave.status === 'pending_cancellation' && (
                    <span className="block text-[11px] font-bold text-orange-500 mt-1">ขอยกเลิกการลา</span>
                  )}
                </TableCell>
                <TableCell>{formatShortDate(leave.start_date)}</TableCell>
                <TableCell>{formatShortDate(leave.end_date)}</TableCell>
                <TableCell>{leave.total_days} วัน</TableCell>
                <TableCell className="max-w-50 truncate" title={leave.reason || ""}>
                  {leave.reason || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <LeaveApprovalActions requestId={leave.id} />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <DataTable
            headers={["ชื่อพนักงาน", "ประเภทการลา", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "จำนวนวัน", "สถานะ", "วันที่ทำรายการ"]}
            isEmpty={historyLeaves.length === 0}
            emptyMessage='ยังไม่มีประวัติการทำรายการ'
            currentPage={tab === 'history' ? currentPage : 1}
            totalPages={historyTotal}
            basePath="/leave-approvals?tab=history&"
          >
            {historyLeaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">
                  {leave.employee ? `${leave.employee.first_name} ${leave.employee.last_name}` : "ไม่ทราบชื่อ"}
                </TableCell>
                <TableCell>
                  {leave.leave_type?.name}
                </TableCell>
                <TableCell>{formatShortDate(leave.start_date)}</TableCell>
                <TableCell>{formatShortDate(leave.end_date)}</TableCell>
                <TableCell>{leave.total_days} วัน</TableCell>
                <TableCell>
                  <StatusBadge status={leave.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDateTime(leave.updated_at || leave.created_at || "")}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </TabsContent>
      </Tabs>
    </div>
  )
}