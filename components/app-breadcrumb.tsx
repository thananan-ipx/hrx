"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeMapping: Record<string, { label: string; parent?: string }> = {
  "/": { label: "Dashboard" },
  "/dashboard": { label: "แดชบอร์ด" },
  "/job-levels": { label: "จัดการระดับตำแหน่ง", parent: "ตั้งค่า" },
  "/departments": { label: "จัดการแผนก", parent: "ตั้งค่า" },
  "/employees": { label: "จัดการพนักงาน", parent: "บุคลากร" },
  "/leave-types": { label: "จัดการประเภทวันลา", parent: "ตั้งค่า" },
  "/my-leaves": { label: "การลาของฉัน", parent: "บริการพนักงาน" },
  "/leave-approvals": { label: "อนุมัติการลา", parent: "บริการหัวหน้างาน" },
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  
  let currentPathConfig = routeMapping[pathname]
  
  if (!currentPathConfig) {
     const mainPath = Object.keys(routeMapping).find(k => k !== "/" && pathname.startsWith(k))
     if (mainPath) {
        currentPathConfig = routeMapping[mainPath]
     }
  }

  if (!currentPathConfig) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {currentPathConfig.parent && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#" className="cursor-default">
                {currentPathConfig.parent}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}
        
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPathConfig.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}