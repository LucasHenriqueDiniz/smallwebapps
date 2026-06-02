import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SectionHeader } from "./SectionHeader";

const COLORS = [
  "hsl(346,87%,55%)",
  "hsl(262,83%,58%)",
  "hsl(199,89%,48%)",
  "hsl(47,95%,57%)",
  "hsl(142,71%,45%)",
];

// deterministic avatar color from the channel name
const AVATAR_COLORS = [
  "#e84545", "#a855f7", "#06b6d4", "#f59e0b", "#22c55e",
  "#ec4899", "#3b82f6", "#f97316", "#14b8a6", "#8b5cf6",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const tooltipStyle = {
  contentStyle: {
    background: "hsl(240,10%,6%)",
    border: "1px solid hsl(240,10%,16%)",
    borderRadius: "10px",
    fontSize: "12px",
  },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

export function TopChannels() {
  const data = useHistoryStore((s) => s.data);
  if (!data) return null;

  const top10 = data.topChannels.slice(0, 10);
  const top5  = data.topChannels.slice(0, 5);
  const maxCount = top10[0]?.count ?? 1;

  if (top10.length === 0) return null;

  return (
    <section>
      <SectionHeader
        label="Canais"
        title="Seus canais favoritos"
        description="Os criadores que dominam o seu histórico."
      />

      <div className="grid md:grid-cols-5 gap-6">
        {/* ── Lista top 10 ── */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
          className="md:col-span-3 bg-card border border-border/60 rounded-2xl p-6"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">
            Top 10 — por vídeos assistidos
          </p>
          <div className="space-y-4">
            {top10.map((ch, i) => (
              <div key={ch.channel} className="flex items-center gap-3 group">
                <span
                  className="text-xs font-bold tabular-nums w-4 text-right shrink-0"
                  style={{ color: i < 3 ? COLORS[i] : undefined }}
                >
                  {i + 1}
                </span>

                {/* avatar */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: avatarColor(ch.channel) }}
                  aria-hidden
                >
                  {initials(ch.channel)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold truncate pr-2 text-foreground/90">
                      {ch.channel}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {ch.count.toLocaleString("pt-BR")}
                      <span className="text-muted-foreground/50 ml-1">({ch.percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ch.count / maxCount) * 100}%` }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Gráfico top 5 ── */}
        <motion.div
          variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
          className="md:col-span-2 bg-card border border-border/60 rounded-2xl p-6"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">
            Top 5 — gráfico
          </p>
          {/* fixed height via inline style (arbitrary tailwind heights are not in the safelist) */}
          <div style={{ height: 240, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top5} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="channel"
                  width={110}
                  tick={{ fill: "hsl(240,5%,60%)", fontSize: 11 }}
                  tickFormatter={(v: string) => v.length > 15 ? v.slice(0, 13) + "…" : v}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: number) => [v.toLocaleString("pt-BR"), "vídeos"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {top5.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
