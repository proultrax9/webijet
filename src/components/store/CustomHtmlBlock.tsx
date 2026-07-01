import type { SiteSettingsData } from "@/lib/settings";

export function CustomHtmlBlock({
  components,
}: {
  components: SiteSettingsData["customComponents"];
}) {
  const active = [...components]
    .filter((c) => c.isActive && c.html?.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (active.length === 0) return null;

  return (
    <>
      {active.map((c, i) => (
        <section
          key={i}
          className="rounded-2xl border border-white/70 bg-card p-4 shadow-soft"
          dangerouslySetInnerHTML={{ __html: c.html }}
        />
      ))}
    </>
  );
}
