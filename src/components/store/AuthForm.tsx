"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { email, username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setLoading(false);
        return;
      }

      const dest = data.role === "ADMIN" ? "/admin" : "/";
      router.push(dest);
      router.refresh();
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-kawaii md:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-primary">
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? "ยินดีต้อนรับกลับมา 🎀" : "สร้างบัญชีใหม่เพื่อเริ่มช้อป 🎀"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground/80">อีเมล</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-4 text-sm shadow-sm transition-colors focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-foreground/80">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ชื่อที่ใช้แสดง"
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-4 text-sm shadow-sm transition-colors focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-foreground/80">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-4 text-sm shadow-sm transition-colors focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <>
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
