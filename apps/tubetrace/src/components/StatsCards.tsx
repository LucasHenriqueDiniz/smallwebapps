import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tv, Users, Clock, TrendingUp } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  detail,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  detail?: string;
  colorClass: string;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {detail && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">
            {detail}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-extrabold tracking-tight tabular-nums leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function StatsCards() {
  const data = useHistoryStore((s) => s.data);
  if (!data) return null;

  const {
    totalVideos, uniqueChannels, estimatedTotalHours,
    estimatedTotalDays, dateRange, avgVideosPerActiveDay, activeDays,
  } = data;

  const yearSpan = dateRange.end.getFullYear() - dateRange.start.getFullYear() + 1;

  return (
    <section>
      <SectionHeader
        label="Visão geral"
        title="Seus números"
        description="Um resumo de tudo que você assistiu desde o primeiro registro."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Tv}
          label="Vídeos assistidos"
          value={totalVideos.toLocaleString("pt-BR")}
          sub={`~${avgVideosPerActiveDay.toFixed(1)} por dia ativo`}
          colorClass="bg-primary/15 text-primary"
          detail={`${activeDays.toLocaleString("pt-BR")} dias`}
        />
        <StatCard
          icon={Users}
          label="Canais únicos"
          value={uniqueChannels.toLocaleString("pt-BR")}
          sub={`de ${format(dateRange.start, "yyyy", { locale: ptBR })} a ${format(dateRange.end, "yyyy", { locale: ptBR })}`}
          colorClass="bg-violet-500/15 text-violet-400"
          detail={`${yearSpan} ${yearSpan === 1 ? "ano" : "anos"}`}
        />
        <StatCard
          icon={Clock}
          label="Tempo estimado"
          value={`${Math.round(estimatedTotalHours).toLocaleString("pt-BR")}h`}
          sub={`≈ ${estimatedTotalDays.toFixed(1)} dias corridos`}
          colorClass="bg-sky-500/15 text-sky-400"
          detail="5 min/vídeo"
        />
        <StatCard
          icon={TrendingUp}
          label="Média por dia ativo"
          value={avgVideosPerActiveDay.toFixed(1)}
          sub="vídeos nos dias que assistiu"
          colorClass="bg-amber-500/15 text-amber-400"
          detail="dias ativos"
        />
      </div>
    </section>
  );
}
