import { getJobLevels } from "@/services/job-level.action"
import { JobLevelDialog } from "@/features/job-levels/components/job-level-dialog"
import { DeleteJobLevelButton } from "@/features/job-levels/components/delete-job-level-button"
import { DataTable } from "@/components/shared/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from "lucide-react"

export default async function JobLevelsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1
  
  const { data: jobLevels, totalPages } = await getJobLevels(currentPage, 10)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการระดับตำแหน่ง (Job Levels)</h2>
          <p className="text-muted-foreground">กำหนดลำดับขั้นของพนักงานและโควตาวันลาเริ่มต้น</p>
        </div>
        <JobLevelDialog />
      </div>

      <DataTable
        headers={["ID", "ชื่อระดับตำแหน่ง", "Tier (ลำดับขั้น)", "โควตาพักร้อน (วัน)", "จัดการ"]}
        isEmpty={jobLevels.length === 0}
        emptyMessage='ยังไม่มีข้อมูล กดปุ่ม "เพิ่มระดับตำแหน่ง" เพื่อเริ่มต้น'
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/job-levels?"
      >
        {jobLevels.map((level) => (
          <TableRow key={level.id}>
            <TableCell className="font-medium">{level.id}</TableCell>
            <TableCell>{level.level_name}</TableCell>
            <TableCell>{level.level_tier}</TableCell>
            <TableCell>{level.annual_leave_quota} วัน</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon className="size-4" />
                    <span className="sr-only">เปิดเมนู</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <JobLevelDialog initialData={level} />
                  
                  <DropdownMenuSeparator />
                  
                  <DeleteJobLevelButton id={level.id} name={level.level_name} />
                  
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  )
}