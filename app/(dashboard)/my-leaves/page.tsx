import { getMyLeaveRequests, getMyLeaveQuotas } from "@/services/leave-request.action"
import { getLeaveTypes } from "@/services/leave-type.action"
import { LeaveRequestDialog } from "@/features/leave-requests/components/leave-request-dialog"
import { DataTable } from "@/components/shared/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CancelLeaveButton } from "@/features/leave-requests/components/cancel-leave-button"

function formatDate(dateString: string) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('th-TH', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  }).format(date)
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved': return <Badge className="bg-green-500 hover:bg-green-600">อนุมัติแล้ว</Badge>
    case 'rejected': return <Badge variant="destructive">ไม่อนุมัติ</Badge>
    case 'cancelled': return <Badge variant="secondary">ยกเลิก</Badge>
    case 'pending_cancellation': return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">รออนุมัติยกเลิก</Badge>
    case 'pending':
    default:
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">รอตรวจสอบ</Badge>
  }
}

export default async function MyLeavesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1

  const [
    { data: myLeaves, totalPages },
    { data: leaveTypes },
    quotas
  ] = await Promise.all([
    getMyLeaveRequests(currentPage, 10),
    getLeaveTypes(1, 100),
    getMyLeaveQuotas() 
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">การลาของฉัน (My Leaves)</h2>
          <p className="text-muted-foreground">ประวัติการลาและยื่นขอลาหยุด</p>
        </div>
        
        <LeaveRequestDialog leaveTypes={leaveTypes} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {quotas.map((quota) => {
          const percentUsed = quota.total_quota > 0 ? (quota.used_days / quota.total_quota) * 100 : 0;
          const isWarning = percentUsed >= 80;
          const type = leaveTypes.find(t => t.id === quota.id);

          return (
            <Card key={quota.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {quota.name}{" "}
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    {type?.is_paid ? "(แบบได้เงินเดือน)" : "(แบบไม่ได้เงินเดือน)"}
                  </span>
                </CardTitle>
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-1 rounded-md">
                  เหลือ {quota.remaining_days} วัน
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quota.used_days} / {quota.total_quota}</div>
                <p className="text-xs text-muted-foreground mb-3 mt-1">
                  ใช้งานแล้ว (รวมรออนุมัติ {quota.pending_days} วัน)
                </p>
                <Progress 
                  value={percentUsed} 
                  className={`h-2 ${isWarning ? "[&>div]:bg-red-500" : "[&>div]:bg-primary"}`} 
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <DataTable
        headers={["ประเภทการลา", "วันที่เริ่มต้น", "วันที่สิ้นสุด", "จำนวนวัน", "เหตุผล", "สถานะ", "ผู้อนุมัติ"]}
        isEmpty={myLeaves.length === 0}
        emptyMessage='คุณยังไม่มีประวัติการลา กดปุ่ม "ยื่นใบลา" เพื่อเริ่มต้น'
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/my-leaves?"
      >
        {myLeaves.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell className="font-medium">
              {leave.leave_type?.name}
              {!leave.leave_type?.is_paid && <span className="block text-[10px] text-muted-foreground">Unpaid</span>}
            </TableCell>
            <TableCell>{formatDate(leave.start_date)}</TableCell>
            <TableCell>{formatDate(leave.end_date)}</TableCell>
            <TableCell>{leave.total_days} วัน</TableCell>
            <TableCell className="max-w-[200px] truncate" title={leave.reason || ""}>
              {leave.reason || "-"}
            </TableCell>
            <TableCell>
              <StatusBadge status={leave.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {leave.approver ? `${leave.approver.first_name} ${leave.approver.last_name}` : "-"}
            </TableCell>
            <TableCell className="text-right">
                <CancelLeaveButton requestId={leave.id} currentStatus={leave.status} />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  )
}