"use client"

import * as React from "react"
import {
  Command,
  SquareTerminal,
  LayoutDashboard,
  type LucideIcon,
  User,
  ClipboardList,
  CalendarDays,
  CheckSquare,
  ShieldAlert
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"
import { usePermissions } from "@/components/providers/permission-provider"
import Link from "next/link"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  permission?: string
  items?: {
    title: string
    url: string
  }[]
}

const data: {
  user: {
    id: string
    name: string
    email: string
    avatar: string
  }
  navMain: NavItem[]
} = {
  user: {
    id: "user-1",
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "แดชบอร์ด", url: "/dashboard", icon: LayoutDashboard, isActive: true },
    { title: "จัดการแผนก", url: "/departments", icon: SquareTerminal, isActive: true, permission: "manage:settings" },
    { title: "จัดการระดับตำแหน่ง", url: "/job-levels", icon: SquareTerminal, isActive: true, permission: "manage:settings" },
    { title: "จัดการพนักงาน", url: "/employees", icon: User, isActive: true, permission: "view:employees" },
    { title: "จัดการประเภทวันลา", url: "/leave-types", icon: ClipboardList, isActive: true, permission: "manage:settings" },
    { title: "การลาของฉัน", url: "/my-leaves", icon: CalendarDays, isActive: true },
    { title: "อนุมัติการลา", url: "/leave-approvals", icon: CheckSquare, isActive: true, permission: "approve:leave" },
    { title: "จัดการสิทธิ์ (Roles)", url: "/roles", icon: ShieldAlert, isActive: true, permission: "manage:settings" },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { hasPermission, isLoading } = usePermissions()

  const allowedNavMain = data.navMain.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  }).map((item) => {
    const isChildActive = item.items?.some((subItem) => 
      subItem.url !== "#" && pathname.startsWith(subItem.url)
    )
    return { ...item, isActive: isChildActive || item.isActive }
  })

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">HRX</span>
                  <span className="truncate text-xs">I Progress X</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <NavMain items={allowedNavMain} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}