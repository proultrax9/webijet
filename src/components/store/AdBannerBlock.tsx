export function AdBannerBlock({
  imageOrHtml,
  dropShadow,
}: {
  imageOrHtml: string;
  dropShadow: number;
}) {
  const content = imageOrHtml?.trim();
  if (!content) return null;

  const isHtml = content.startsWith("<");

  return (
    <section
      className="overflow-hidden rounded-2xl border border-white/70 bg-card"
      style={{ boxShadow: `0 12px 40px -12px rgba(0,0,0,${dropShadow})` }}
    >
      {isHtml ? (
        <div className="p-4" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <img src={content} alt="โฆษณา" className="w-full object-cover" />
      )}
    </section>
  );
}
