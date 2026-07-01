import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { SectionHeading } from "@/components/store/SectionHeading";
import { FaqAccordion } from "@/components/store/FaqAccordion";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { getActiveFaqs } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [settings, faqs] = await Promise.all([getSettings(), getActiveFaqs()]);

  return (
    <div className="container space-y-8 py-8">
      <SectionHeading title="ติดต่อเรา" subtitle="ช่องทางติดต่อและคำถามที่พบบ่อย" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-card p-6 shadow-soft">
          <MessageCircle className="mb-3 size-8 text-primary" />
          <h3 className="font-bold">Discord Community</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            เข้าร่วมเซิร์ฟเวอร์ Discord เพื่อสอบถามและรับความช่วยเหลือ
          </p>
          <Link
            href={settings.discord.inviteLink}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary-gradient px-5 text-sm font-medium text-white shadow-kawaii"
          >
            เข้าร่วม Discord
          </Link>
        </div>

        <div className="rounded-2xl border border-white/70 bg-card p-6 shadow-soft">
          <Mail className="mb-3 size-8 text-primary" />
          <h3 className="font-bold">ติดต่อเจ้าของร้าน</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            โทร {settings.general.ownerPhone} · {settings.general.siteName}
          </p>
          <Link
            href="/topup"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border-2 border-primary/30 bg-white px-5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            เติมเงิน
          </Link>
        </div>
      </div>

      {faqs.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">คำถามที่พบบ่อย (FAQ)</h2>
          <FaqAccordion
            items={faqs.map((f) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
            }))}
          />
        </section>
      )}
    </div>
  );
}
