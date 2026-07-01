import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { CreditCard } from "lucide-react";

export default function InstallmentsPage() {
  return (
    <div>
      <PageHeader icon={<CreditCard className="size-6" />} title="จัดการการผ่อน" subtitle="ระบบผ่อนชำระ (กำลังพัฒนา)" />
      <EmptyState title="ยังไม่มีข้อมูลการผ่อน" description="ฟีเจอร์นี้จะเพิ่มใน Phase ถัดไป" />
    </div>
  );
}
