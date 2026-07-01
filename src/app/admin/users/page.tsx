import { Users } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/UserActions";
import { prisma } from "@/lib/prisma";
import { getAdminUser, isBanned } from "@/lib/session";
import { formatBaht, formatThaiDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PERMANENT_BAN_YEAR = 9000;

function banLabel(bannedUntil: Date): string {
  if (bannedUntil.getUTCFullYear() >= PERMANENT_BAN_YEAR) return "แบนถาวร";
  return `แบนถึง ${formatThaiDate(bannedUntil)}`;
}

export default async function AdminUsersPage() {
  const [users, admin] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    getAdminUser(),
  ]);

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const bannedCount = users.filter((u) => isBanned(u.bannedUntil)).length;

  return (
    <div>
      <PageHeader
        icon={<Users className="size-6" />}
        title="จัดการผู้ใช้"
        subtitle="รายชื่อผู้ใช้ ยอดเงิน สิทธิ์ และการเลื่อน/ลดระดับผู้ดูแล"
      />

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
          ผู้ใช้ทั้งหมด {users.length} คน
        </span>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          ผู้ดูแลระบบ {adminCount} คน
        </span>
        <span className="rounded-full bg-danger/10 px-3 py-1 font-medium text-danger">
          ถูกแบน {bannedCount} คน
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อผู้ใช้</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>ยอดเงิน</TableHead>
              <TableHead>แต้ม</TableHead>
              <TableHead>สมัครเมื่อ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const banned = isBanned(u.bannedUntil);
              return (
              <TableRow key={u.id}>
                <TableCell className="font-semibold">{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "pink" : "muted"}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  {banned ? (
                    <Badge variant="dangerSoft">{banLabel(u.bannedUntil!)}</Badge>
                  ) : (
                    <Badge variant="successSoft">ปกติ</Badge>
                  )}
                </TableCell>
                <TableCell className="font-bold text-primary">{formatBaht(u.balance)}</TableCell>
                <TableCell>{u.points}</TableCell>
                <TableCell className="text-sm">{formatThaiDate(u.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <UserActions
                    userId={u.id}
                    role={u.role}
                    isSelf={admin?.id === u.id}
                    banned={banned}
                  />
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
