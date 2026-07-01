import { Ticket } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatBaht, formatThaiDate } from "@/lib/utils";
import { DeleteCodeButton } from "@/components/admin/AdminActions";
import { CreateCodeForm } from "@/components/admin/CreateCodeForm";

export const dynamic = "force-dynamic";

export default async function AdminCodesPage() {
  const codes = await prisma.redeemCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        icon={<Ticket className="size-6" />}
        title="จัดการโค้ด"
        subtitle="จัดการโค้ดสำหรับแลกแต้ม"
      />

      <CreateCodeForm />

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสโค้ด</TableHead>
              <TableHead>จำนวนเงิน</TableHead>
              <TableHead>จำนวนครั้งที่ใช้</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>หมดอายุ</TableHead>
              <TableHead>จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  ยังไม่มีโค้ด
                </TableCell>
              </TableRow>
            ) : (
              codes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold">{c.code}</TableCell>
                  <TableCell className="font-bold text-primary">{formatBaht(c.amount)}</TableCell>
                  <TableCell>
                    {c.usedCount} / {c.maxUses}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "successSoft" : "muted"}>
                      {c.isActive ? "ใช้งานได้" : "ปิด"}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.expiresAt ? formatThaiDate(c.expiresAt) : "-"}</TableCell>
                  <TableCell>
                    <DeleteCodeButton id={c.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
