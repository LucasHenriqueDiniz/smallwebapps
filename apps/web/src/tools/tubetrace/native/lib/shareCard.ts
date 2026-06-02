import type { AnalyticsData } from "./types";

const PERSONALITY_LABELS: Record<string, string> = {
  "The Night Owl": "Coruja Noturna",
  "The Early Bird": "Madrugador",
  "The Binge Watcher": "Maratonador",
  "The Loyal Fan": "Fã Leal",
  "The Variety Seeker": "Explorador",
  "The Weekend Warrior": "Guerreiro de Fim de Semana",
  "The Balanced Viewer": "Espectador Equilibrado",
};

/** Draws a 1080×1080 share card and returns it as a PNG blob. */
export async function buildShareCard(data: AnalyticsData): Promise<Blob> {
  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // background
  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#0b0710");
  grad.addColorStop(1, "#1a0a12");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // glow blob
  const blob = ctx.createRadialGradient(S * 0.5, 220, 0, S * 0.5, 220, 520);
  blob.addColorStop(0, "rgba(232,69,69,0.35)");
  blob.addColorStop(1, "rgba(232,69,69,0)");
  ctx.fillStyle = blob;
  ctx.fillRect(0, 0, S, 700);

  const cx = S / 2;

  // brand
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 46px Inter, sans-serif";
  ctx.fillText("TubeTrace", cx, 130);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 24px Inter, sans-serif";
  ctx.fillText("meu histórico do YouTube", cx, 168);

  // personality
  const persona = PERSONALITY_LABELS[data.personalities[0]] || data.personalities[0] || "Espectador";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "700 22px Inter, sans-serif";
  ctx.fillText("MINHA PERSONALIDADE", cx, 290);
  ctx.fillStyle = "#ff5a5a";
  ctx.font = "800 84px Inter, sans-serif";
  ctx.fillText(persona, cx, 380);

  // stat cards
  const stats: [string, string][] = [
    [data.totalVideos.toLocaleString("pt-BR"), "vídeos assistidos"],
    [data.uniqueChannels.toLocaleString("pt-BR"), "canais diferentes"],
    [`${Math.round(data.estimatedTotalHours).toLocaleString("pt-BR")}h`, "tempo estimado"],
    [data.topChannels[0]?.channel ?? "—", "canal favorito"],
  ];

  const cardW = 440, cardH = 180, gap = 40;
  const startX = cx - cardW - gap / 2;
  const startY = 470;
  stats.forEach((stat, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    roundRect(ctx, x, y, cardW, cardH, 28);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 56px Inter, sans-serif";
    ctx.fillText(fit(ctx, stat[0], cardW - 56, 56), x + cardW / 2, y + 92);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "500 24px Inter, sans-serif";
    ctx.fillText(stat[1], x + cardW / 2, y + 138);
  });

  // footer
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "600 28px Inter, sans-serif";
  ctx.fillText("tubetrace.pages.dev", cx, S - 70);

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png", 0.95)
  );
}

/** Shares the card via Web Share API, falling back to a download. */
export async function shareCard(data: AnalyticsData): Promise<"shared" | "downloaded"> {
  const blob = await buildShareCard(data);
  const file = new File([blob], "tubetrace.png", { type: "image/png" });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: "TubeTrace",
        text: "Meu histórico do YouTube analisado no TubeTrace",
      });
      return "shared";
    } catch {
      /* user cancelled — fall through to download */
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tubetrace.png";
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Shrinks the font until the text fits the given width, returns the (possibly truncated) string. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number): string {
  ctx.font = `800 ${size}px Inter, sans-serif`;
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 3 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}
