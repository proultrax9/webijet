import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div>
      <PageHeader icon={<Star className="size-6" />} title="จัดการรีวิว" subtitle="รีวิวสินค้าจากลูกค้า" />
      <EmptyState title="ยังไม่มีรีวิว" description="เปิดระบบรีวิวได้ที่ การตั้งค่า → รายละเอียดเว็บ" />
    </div>
  );
}
