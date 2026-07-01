import Link from "next/link";

const LABELS = ["สินค้าทั้งหมด", "เติมเงิน", "มินิเกม", "ติดต่อเรา"];

export function NavButtonRow({
  buttons,
}: {
  buttons: { imageUrl: string; link: string }[];
}) {
  const active = buttons.filter((b) => b.imageUrl?.trim() && b.link?.trim());
  if (active.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {active.map((btn, i) => (
        <Link
          key={i}
          href={btn.link}
          className="group block overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-kawaii"
        >
          <div className="relative aspect-[280/96] w-full">
            <img
              src={btn.imageUrl}
              alt={LABELS[i] ?? `ปุ่มนำทาง ${i + 1}`}
              width={280}
              height={96}
              className="h-full w-full object-contain p-0.5 transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </Link>
      ))}
    </section>
  );
}
