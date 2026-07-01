import type { SiteSettingsData } from "@/lib/settings";
import { buildThemeCss } from "@/lib/theme-utils";

/** Server component — inject theme CSS โดยไม่เกิด hydration mismatch */
export function ThemeStyles({ settings }: { settings: SiteSettingsData }) {
  return (
    <style
      id="site-theme-vars"
      dangerouslySetInnerHTML={{ __html: buildThemeCss(settings) }}
    />
  );
}
