"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { loginAction } from "@/services/auth.action";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await loginAction(email, password);
      
      if (data?.error) {
        setError(data.error);
        toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }
      
      toast.success('เข้าสู่ระบบสำเร็จ');
      
      router.push("/dashboard"); 
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่";
      setError(errorMessage);
      toast.error('เกิดข้อผิดพลาดของระบบ');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">เข้าสู่ระบบ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="text-sm font-medium text-center text-red-500">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2" /> กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
// ❌ ลบ function isTokenExpired() ทิ้งได้เลย เพราะเราเปลี่ยนมาใช้ Cookie-based session แทน