"use client"

import { useState } from "react"
import { PlusIcon, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { submitLeaveRequest } from "@/services/leave-request.action"
import { LeaveType } from "@/types/leave-type"

export function LeaveRequestDialog({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [leaveTypeId, setLeaveTypeId] = useState<string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState("")
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    
    if (!leaveTypeId) {
      toast.error("กรุณาเลือกประเภทการลา")
      return
    }

    setIsLoading(true)

    try {
      const res = await submitLeaveRequest({
        leave_type_id: Number(leaveTypeId),
        start_date: startDate,
        end_date: endDate,
        total_days: Number(totalDays),
        reason: reason
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("ยื่นใบลาสำเร็จ รอการอนุมัติจากหัวหน้า")
        setOpen(false)
        // Reset form
        setLeaveTypeId("")
        setStartDate("")
        setEndDate("")
        setTotalDays("")
        setReason("")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดของระบบ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
    if (start && end) {
      const s = new Date(start)
      const e = new Date(end)
      if (e >= s) {
        const diffTime = Math.abs(e.getTime() - s.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        setTotalDays(diffDays.toString())
      } else {
        setTotalDays("0")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusIcon className="mr-2 h-4 w-4" /> ยื่นใบลา</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> ยื่นคำขอลาหยุด
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label>ประเภทการลา <span className="text-red-500">*</span></Label>
              <Select value={leaveTypeId} onValueChange={setLeaveTypeId} disabled={isLoading} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทการลา" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} {type.is_paid ? "(แบบได้เงินเดือน)" : "(แบบไม่ได้เงินเดือน)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">วันที่เริ่มต้น <span className="text-red-500">*</span></Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => handleDateChange(e.target.value, endDate)} 
                  required 
                  disabled={isLoading} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">วันที่สิ้นสุด <span className="text-red-500">*</span></Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => handleDateChange(startDate, e.target.value)} 
                  required 
                  disabled={isLoading} 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="totalDays">จำนวนวันลา <span className="text-red-500">*</span></Label>
              <Input 
                id="totalDays" 
                type="number" 
                step="0.5" 
                min="0.5"
                value={totalDays} 
                onChange={(e) => setTotalDays(e.target.value)} 
                required 
                placeholder="เช่น 1, 1.5, 2"
                disabled={isLoading} 
              />
              <span className="text-xs text-muted-foreground">สามารถแก้ไขให้เป็นทศนิยมได้ (เช่น 0.5 สำหรับลาครึ่งวัน)</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">เหตุผลการลา <span className="text-red-500">*</span></Label>
              <Textarea 
                id="reason" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                required 
                placeholder="ระบุเหตุผลการลาของคุณ..." 
                disabled={isLoading} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>ยกเลิก</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />} ยืนยันการลา
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}