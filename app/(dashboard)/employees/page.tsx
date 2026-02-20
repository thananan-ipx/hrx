import { getEmployees } from "@/services/employee.action"
import { getDepartments } from "@/services/department.action"
import { getJobLevels } from "@/services/job-level.action"
import { EmployeeDialog } from "@/features/employees/components/employee-dialog"
import { DeleteEmployeeButton } from "@/features/employees/components/delete-employee-button"
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
import { Protect } from "@/components/shared/protect"

export default async function EmployeesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1

  const [
    { data: employees, totalPages },
    { data: departments },
    { data: jobLevels }
  ] = await Promise.all([
    getEmployees(currentPage, 10),
    getDepartments(1, 1000),
    getJobLevels(1, 1000)
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการพนักงาน (Employees)</h2>
          <p className="text-muted-foreground">รายชื่อพนักงานทั้งหมดในระบบ</p>
        </div>
        <Protect permission="create:employees">
          <EmployeeDialog departments={departments} jobLevels={jobLevels} />
        </Protect>
      </div>

      <DataTable
        headers={["ID", "ชื่อ-นามสกุล", "อีเมล", "แผนก", "ระดับตำแหน่ง", "จัดการ"]}
        isEmpty={employees.length === 0}
        emptyMessage='ยังไม่มีข้อมูลพนักงาน กดปุ่ม "เพิ่มพนักงาน" เพื่อเริ่มต้น'
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/employees?"
      >
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell className="font-medium">{emp.id}</TableCell>
            <TableCell>{emp.first_name} {emp.last_name}</TableCell>
            <TableCell>{emp.email}</TableCell>
            <TableCell className="text-muted-foreground">
              {emp.department ? emp.department.name : "-"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {emp.job_level ? emp.job_level.level_name : "-"}
            </TableCell>
            
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  
                  <EmployeeDialog 
                    departments={departments} 
                    jobLevels={jobLevels} 
                    initialData={emp} 
                  />
                  
                  <DropdownMenuSeparator />
                  
                  <DeleteEmployeeButton 
                    id={emp.id} 
                    name={`${emp.first_name} ${emp.last_name}`} 
                  />

                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  )
}