import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { format, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import { Calendar, Flame, Zap, BarChart2 } from "lucide-react";

function formatSpan(start: Date, end: Date) {
  const years = differenceInYears(end, start);
  const months = differenceInMonths(end, start) % 12;
  const days = differenceInDays(end, start);
  if (years > 0) return `${years}a ${months}m de dados`;
  if (months > 0) return `${months} meses de dados`;
  return `${days} dias de dados`;
}

function Ring({ pct, color, label, value }: { pct: number; color: string; label: string; value: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="hsl(240,10%,16%)" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-tight">{value}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center leading-tight">{label}</p>
    </div>
  );
}

export function DataTimeline() {
  const data = useHistoryStore((s) => s.data);
  if (!data) return null;

  const { dateRange, totalDays, activeDays, inactiveDays, longestStreak, currentStreak, avgVideosPerActiveDay } = data;
  const activePercent = (activeDays / totalDays) * 100;

  return (
    <section>
      <motion.h2
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        className="text-xl font-bold mb-4"
      >
        Intervalo de Dados
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline bar */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {formatSpan(dateRange.start, dateRange.end)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{format(dateRange.start, "d MMM yyyy")}</span>
            <span className="font-medium text-foreground">{format(dateRange.end, "d MMM yyyy")}</span>
          </div>
          <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>

          {/* Active vs Inactive */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{activeDays.toLocaleString()} dias com vídeos</span>
              <span>{inactiveDays.toLocaleString()} dias sem vídeos</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
              <motion.div
                className="h-full bg-primary rounded-l-full"
                initial={{ width: 0 }}
                animate={{ width: `${activePercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <motion.div
                className="h-full bg-muted-foreground/20 rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${100 - activePercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Ativo em <span className="text-foreground font-semibold">{activePercent.toFixed(0)}%</span> dos dias
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-secondary/50 rounded-xl px-4 py-3">
              <p className="text-lg font-bold">{totalDays.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">dias no total</p>
            </div>
            <div className="bg-secondary/50 rounded-xl px-4 py-3">
              <p className="text-lg font-bold">{avgVideosPerActiveDay.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">vídeos/dia ativo</p>
            </div>
          </div>
        </motion.div>

        {/* Rings + streaks */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-6"
        >
          <div className="flex justify-around">
            <Ring
              pct={activePercent}
              color="hsl(346,87%,55%)"
              label="Dias ativos"
              value={`${activePercent.toFixed(0)}%`}
            />
            <Ring
              pct={Math.min((longestStreak / totalDays) * 100 * 5, 100)}
              color="hsl(262,83%,58%)"
              label="Maior streak"
              value={`${longestStreak}d`}
            />
            <Ring
              pct={Math.min((data.estimatedTotalHours / (totalDays * 3)) * 100, 100)}
              color="hsl(199,89%,48%)"
              label="Horas assistidas"
              value={`${Math.round(data.estimatedTotalHours).toLocaleString()}h`}
            />
          </div>

          {/* Streak cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <p className="text-lg font-bold">{longestStreak} <span className="text-sm font-normal">dias</span></p>
                <p className="text-xs text-muted-foreground">maior sequência</p>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
              <div>
                <p className="text-lg font-bold">{currentStreak} <span className="text-sm font-normal">dias</span></p>
                <p className="text-xs text-muted-foreground">sequência atual</p>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl px-4 py-3 flex items-center gap-3 col-span-2">
              <BarChart2 className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold">Pico: <span className="text-primary">{data.peakMonth}</span></p>
                <p className="text-xs text-muted-foreground">
                  Hora favorita: <span className="text-foreground">{data.peakHour}h</span> &middot; Dia favorito: <span className="text-foreground">{data.peakDay}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
