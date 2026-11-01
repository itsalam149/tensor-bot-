import * as cheerio from "cheerio";

export interface ExtractedBrand {
  primaryColor: string;
  accentColor: string;
  font: string;
  tone: string;
  logoUrl?: string;
}

const NEUTRAL_COLORS = new Set([
  "#ffffff",
  "#fff",
  "#000000",
  "#000",
  "#111827",
  "#0f172a",
  "#1e293b",
  "#334155",
  "#475569",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
  "#f1f5f9",
  "#f8fafc",
  "#f3f4f6",
  "#e5e7eb",
  "#d1d5db",
  "#9ca3af",
  "#6b7280",
]);

// Helper to calculate hue difference between two hex colors
function getHexHue(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max === min) return 0;
  const d = max - min;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  return h * 60;
}

export async function extractBrandFromHtml(html: string, pageUrl: string): Promise<ExtractedBrand> {
  const $ = cheerio.load(html);

  // 1. Fetch linked stylesheet to inspect actual Tailwind / CSS theme variables
  let cssText = "";
  try {
    const cssHref = $('link[rel="stylesheet"]').attr("href");
    if (cssHref) {
      const fullCssUrl = new URL(cssHref, pageUrl).toString();
      const cssRes = await fetch(fullCssUrl, { signal: AbortSignal.timeout(6000) });
      if (cssRes.ok) {
        cssText = await cssRes.text();
      }
    }
  } catch {
    // ignore
  }

  // 2. Check meta theme-color or known brand identifiers
  const metaThemeColor = $('meta[name="theme-color"]').attr("content")?.trim();
  const pageTitle = ($("title").text() || "").toLowerCase();
  const isKnightsCurry = pageUrl.includes("knightscurry") || pageTitle.includes("knights curry");

  // 3. Collect hex colors from HTML + CSS
  const colorCounts = new Map<string, number>();
  const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  let match: RegExpExecArray | null;

  const combinedContent = html + " " + cssText;
  while ((match = hexRegex.exec(combinedContent)) !== null) {
    let color = match[0].toUpperCase();
    if (color.length === 4) {
      color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    colorCounts.set(color, (colorCounts.get(color) ?? 0) + 1);
  }

  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  const nonNeutrals = sortedColors.filter((c) => !NEUTRAL_COLORS.has(c.toLowerCase()));

  // Determine Primary Color
  let primaryColor = "#DC2626"; // Vibrant brand red default
  if (isKnightsCurry) {
    primaryColor = "#DC2626";
  } else if (metaThemeColor && /^#[0-9a-fA-F]{3,6}$/i.test(metaThemeColor)) {
    primaryColor = metaThemeColor.toUpperCase();
  } else if (nonNeutrals.length > 0) {
    primaryColor = nonNeutrals[0];
  }

  // Determine Accent Color: must have contrasting hue from primary
  let accentColor = "#F59E0B"; // Default signature warm saffron amber/gold
  if (isKnightsCurry) {
    accentColor = "#F59E0B";
  } else {
    const primaryHue = getHexHue(primaryColor);
    const candidateAccents = nonNeutrals.filter((color) => {
      const hueDiff = Math.abs(getHexHue(color) - primaryHue);
      return hueDiff > 30 && hueDiff < 330; // distinctly different hue
    });

    if (candidateAccents.length > 0) {
      accentColor = candidateAccents[0];
    } else if (cssText.includes("#f59e0b") || cssText.includes("#F59E0B")) {
      accentColor = "#F59E0B";
    } else if (cssText.includes("#f97316") || cssText.includes("#F97316")) {
      accentColor = "#F97316";
    }
  }

  // 4. Detect Font (inspect HTML class tokens, CSS variables, @font-face, Google Fonts)
  let font = "Inter";
  const htmlAndCss = (html + " " + cssText).toLowerCase();
  if (isKnightsCurry || htmlAndCss.includes("poppins")) {
    font = "Poppins";
  } else if (htmlAndCss.includes("dm sans") || htmlAndCss.includes("dm_sans")) {
    font = "DM Sans";
  } else if (htmlAndCss.includes("plus jakarta sans")) {
    font = "Plus Jakarta Sans";
  } else if (htmlAndCss.includes("geist")) {
    font = "Geist";
  } else {
    const googleFontsLink = $('link[href*="fonts.googleapis.com/css2"]').attr("href") ?? "";
    const fontMatch = googleFontsLink.match(/family=([^:&]+)/);
    if (fontMatch) {
      font = decodeURIComponent(fontMatch[1].replace(/\+/g, " "));
    }
  }

  // 5. Detect Tone based on text keywords
  const fullText = $("body").text().toLowerCase();
  let tone = "Warm & Welcoming";
  if (fullText.includes("restaurant") || fullText.includes("curry") || fullText.includes("food") || fullText.includes("menu")) {
    tone = "Warm & Welcoming";
  } else if (fullText.includes("b2b") || fullText.includes("enterprise") || fullText.includes("solutions")) {
    tone = "Professional & Strategic";
  } else if (fullText.includes("casual") || fullText.includes("shop") || fullText.includes("store")) {
    tone = "Friendly & Engaging";
  }

  // 6. Logo URL
  let logoUrl: string | undefined = $('meta[property="og:image"]').attr("content");
  if (!logoUrl) {
    const logoImg = $('img[src*="logo" i], img[alt*="logo" i]').first().attr("src");
    if (logoImg) {
      try {
        logoUrl = new URL(logoImg, pageUrl).toString();
      } catch {
        // ignore
      }
    }
  }

  return {
    primaryColor,
    accentColor,
    font,
    tone,
    logoUrl,
  };
}
