"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { loginAction } from "@/services/auth.action";
import { toast } from "sonner";
import { KeyRoundIcon, MailIcon, CommandIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginAction(email, password);
      
      if (data?.error) {
        toast.error(data.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }
      
      toast.success('เข้าสู่ระบบสำเร็จ');
      router.push("/dashboard"); 
      
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <CommandIcon className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mt-2">HRX System</h1>
        <p className="text-sm text-muted-foreground">ระบบบริหารทรัพยากรบุคคล I Progress X</p>
      </div>

      <form onSubmit={handleLogin}>
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-semibold">ยินดีต้อนรับ</CardTitle>
            <CardDescription className="text-sm">
              กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">รหัสผ่าน</Label>
              </div>
              <div className="relative">
                <KeyRoundIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full text-md h-10" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> กำลังตรวจสอบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}