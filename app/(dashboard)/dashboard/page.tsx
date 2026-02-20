"use client"

import { 
  Clock, 
  User, 
  Briefcase,
  PieChart
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function DashboardPage() {

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          ยินดีต้อนรับกลับ
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานค้างทั้งหมด</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใกล้ครบกำหนด (7 วัน)</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              งานที่ต้องรีบดำเนินการ
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">งานค้างของฉัน</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
        </Card>

      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-muted-foreground"/> 
                Status Overview
            </CardTitle>
            <CardDescription>
                จำนวนงานแยกตามสถานะการดำเนินงานปัจจุบัน
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground"/> 
                Due Soon
            </CardTitle>
            <CardDescription>
              รายการงานที่ใกล้ถึงกำหนดส่ง (All Users)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}