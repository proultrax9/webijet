import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { MessagesSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div>
      <PageHeader icon={<MessagesSquare className="size-6" />} title="จัดการแชท" subtitle="ระบบแชทสนับสนุน" />
      <EmptyState title="ยังไม่มีข้อความแชท" description="เปิดระบบแชทได้ที่ การตั้งค่า → รายละเอียดเว็บ" />
    </div>
  );
}
