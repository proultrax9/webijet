import { TopupForms } from "@/components/store/TopupForms";
import { SectionHeading } from "@/components/store/SectionHeading";
import { getCurrentUser } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TopupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await getSettings();
  const history = await prisma.topup.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="container space-y-6 py-8">
      <SectionHeading
        title="เติมเงิน"
        subtitle="เติมเงินเข้ากระเป๋าเพื่อซื้อสินค้าได้สะดวกและรวดเร็ว"
      />
      <TopupForms
        balance={user.balance}
        payment={{
          promptpayNumber: settings.payment.promptpayNumber,
          bankAccountName: settings.payment.bankAccountName,
          bankName: settings.payment.bankName,
          bankAccountNumber: settings.payment.bankAccountNumber,
          enablePromptpay: settings.payment.enablePromptpay,
          enableSlipUpload: settings.payment.enableSlipUpload,
          enableAngpao: settings.payment.enableAngpao,
        }}
        history={history.map((h) => ({
          id: h.id,
          method: h.method,
          amount: h.amount,
          status: h.status,
          createdAt: h.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
