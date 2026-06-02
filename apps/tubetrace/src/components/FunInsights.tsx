import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lightbulb, Moon, Sun, Trophy, Clock, Zap, CalendarCheck, Tv2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

function InsightCard({
  icon: Icon,
  title,
  value,
  sub,
  colorClass,
  wide,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  sub?: string;
  colorClass: string;
  wide?: boolean;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } }}
      className={`bg-card border border-border/60 rounded-2xl p-5 flex gap-4 hover:border-border transition-colors ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">{title}</p>
        <p className="text-base font-bold leading-snug truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function FunInsights() {
  const data = useHistoryStore((s) => s.data);
  if (!data) return null;

  const insights: React.ComponentProps<typeof InsightCard>[] = [];

  if (data.mostActiveDayEver) {
    insights.push({
      icon: Trophy,
      title: "Dia mais ativo",
      value: `${data.mostActiveDayEver.count.toLocaleString("pt-BR")} vídeos`,
      sub: format(data.mostActiveDayEver.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }),
      colorClass: "bg-primary/15 text-primary",
    });
  }

  if (data.longestStreak > 0) {
    insights.push({
      icon: Zap,
      title: "Maior sequência",
      value: `${data.longestStreak} dias seguidos`,
      sub: "sem parar de assistir ao YouTube",
      colorClass: "bg-amber-500/15 text-amber-400",
    });
  }

  if (data.earliestMorningWatch) {
    insights.push({
      icon: Sun,
      title: "Mais cedo assistido",
      value: format(data.earliestMorningWatch.date, "HH:mm"),
      sub: data.earliestMorningWatch.title.slice(0, 46) +
        (data.earliestMorningWatch.title.length > 46 ? "…" : ""),
      colorClass: "bg-amber-500/15 text-amber-400",
    });
  }

  if (data.latestNightWatch) {
    insights.push({
      icon: Moon,
      title: "Mais tarde assistido",
      value: format(data.latestNightWatch.date, "HH:mm"),
      sub: data.latestNightWatch.title.slice(0, 46) +
        (data.latestNightWatch.title.length > 46 ? "…" : ""),
      colorClass: "bg-violet-500/15 text-violet-400",
    });
  }

  insights.push({
    icon: Clock,
    title: "Tempo total estimado",
    value: `${Math.round(data.estimatedTotalHours).toLocaleString("pt-BR")} horas`,
    sub: `${data.estimatedTotalDays.toFixed(1)} dias assistindo sem dormir`,
    colorClass: "bg-sky-500/15 text-sky-400",
  });

  const most = data.timeSlotPercentages.reduce((a, b) =>
    a.percentage > b.percentage ? a : b
  );
  insights.push({
    icon: CalendarCheck,
    title: "Período favorito",
    value: most.slot,
    sub: `${most.percentage.toFixed(0)}% de todos os vídeos`,
    colorClass: "bg-emerald-500/15 text-emerald-400",
  });

  if (data.topChannels[0]) {
    const ch = data.topChannels[0];
    insights.push({
      icon: Tv2,
      title: "Canal número 1",
      value: ch.channel,
      sub: `${ch.count.toLocaleString("pt-BR")} vídeos · ${ch.percentage.toFixed(1)}% do histórico`,
      colorClass: "bg-primary/15 text-primary",
    });
  }

  if (data.peakMonth) {
    const monthData = data.activityByMonth.find((m) => m.month === data.peakMonth);
    insights.push({
      icon: Lightbulb,
      title: "Mês mais ativo",
      value: data.peakMonth,
      sub: monthData ? `${monthData.count.toLocaleString("pt-BR")} vídeos nesse mês` : undefined,
      colorClass: "bg-violet-500/15 text-violet-400",
    });
  }

  return (
    <section>
      <SectionHeader
        label="Destaques"
        title="Curiosidades"
        description="Recordes e curiosidades sobre seu histórico."
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {insights.map((insight, i) => (
          <InsightCard key={i} {...insight} />
        ))}
      </div>

      {/* Radial por período */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="mt-4 bg-card border border-border/60 rounded-2xl p-6"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
          Distribuição por período do dia
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.timeSlotPercentages.map((slot, i) => {
            const colors = [
              "hsl(47,95%,57%)", "hsl(346,87%,55%)",
              "hsl(262,83%,58%)", "hsl(199,89%,48%)",
            ];
            const bgClasses = [
              "bg-amber-500/10", "bg-primary/10",
              "bg-violet-500/10", "bg-sky-500/10",
            ];
            const textClasses = [
              "text-amber-400", "text-primary",
              "text-violet-400", "text-sky-400",
            ];
            const r = 28;
            const circ = 2 * Math.PI * r;
            return (
              <div
                key={slot.slot}
                className={`${bgClasses[i]} border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2`}
              >
                <div className="relative w-16 h-16">
                  <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                    <circle
                      cx="32" cy="32" r={r}
                      fill="none"
                      stroke="hsl(240,10%,16%)"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="32" cy="32" r={r}
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: circ - (slot.percentage / 100) * circ }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${textClasses[i]}`}>
                      {slot.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-center text-foreground/80">{slot.slot}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
