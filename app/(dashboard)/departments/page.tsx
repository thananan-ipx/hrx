import { getDepartments, getEmployeesForDropdown } from "@/services/department.action"
import { DepartmentDialog } from "@/features/departments/components/department-dialog"
import { DataTable } from "@/components/shared/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon } from "lucide-react"
import { DepartmentOrgChart } from "@/features/departments/components/department-org-chart"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DeleteDepartmentButton } from "@/features/departments/components/delete-department-button"

export default async function DepartmentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const currentPage = Number(searchParams?.page) || 1

  const { data: departments, totalPages } = await getDepartments(currentPage, 10)
  const employees = await getEmployeesForDropdown()
  
  const { data: allDepartments } = await getDepartments(1, 1000)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">จัดการแผนก (Departments)</h2>
          <p className="text-muted-foreground">โครงสร้างองค์กร แผนกย่อย และสายบังคับบัญชา</p>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="table">มุมมองตาราง</TabsTrigger>
            <TabsTrigger value="chart">แผนผังองค์กร (Org Chart)</TabsTrigger>
          </TabsList>
          
          <DepartmentDialog departments={allDepartments} employees={employees} />
        </div>

        <TabsContent value="table" className="m-0 space-y-4">
          <DataTable
            headers={["ID", "ชื่อแผนก", "แผนกแม่ (Parent)", "หัวหน้าแผนก", "จัดการ"]}
            isEmpty={departments.length === 0}
            emptyMessage='ยังไม่มีข้อมูลแผนก กดปุ่ม "เพิ่มแผนก" เพื่อเริ่มต้น'
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/departments?"
          >
            {departments.map((dept) => {
              const parentNode = Array.isArray(dept.parent) ? dept.parent[0] : dept.parent;
              const managerNode = Array.isArray(dept.manager) ? dept.manager[0] : dept.manager;

              return (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.id}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  
                  <TableCell className="text-muted-foreground">
                    {parentNode ? parentNode.name : "-"}
                  </TableCell>
                  
                  <TableCell>
                    {managerNode ? `${managerNode.first_name} ${managerNode.last_name}` : <span className="italic text-muted-foreground">ยังไม่มีหัวหน้า</span>}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DepartmentDialog 
                          departments={allDepartments} 
                          employees={employees} 
                          initialData={dept} 
                        />
                        <DropdownMenuSeparator />
                        <DeleteDepartmentButton id={dept.id} name={dept.name} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </DataTable>
        </TabsContent>

        <TabsContent value="chart" className="m-0">
          <DepartmentOrgChart departments={allDepartments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}