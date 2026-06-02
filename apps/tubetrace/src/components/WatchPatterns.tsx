import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart,
} from "recharts";
import { SectionHeader } from "./SectionHeader";

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(240,10%,6%)",
    border: "1px solid hsl(240,10%,16%)",
    borderRadius: "10px",
    fontSize: "12px",
  },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="bg-card border border-border/60 rounded-2xl p-6"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">{title}</p>
      {children}
    </motion.div>
  );
}

export function WatchPatterns() {
  const data = useHistoryStore((s) => s.data);
  if (!data) return null;

  const hasMultiYear = data.activityByYear.length > 1;

  // Transliterate day labels
  const dayData = data.activityByDay.map((d, i) => ({ ...d, day: DAYS_PT[i] ?? d.day }));

  return (
    <section>
      <SectionHeader
        label="Padrões"
        title="Como você consome"
        description="Horários, dias e meses — quando o YouTube te prendeu mais."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hora do dia */}
        <ChartCard title="Hora do dia">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.activityByHour} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <XAxis
                dataKey="hour"
                tick={{ fill: "hsl(240,5%,55%)", fontSize: 10 }}
                tickFormatter={(v: string) => v.replace(":00", "h")}
                interval={3}
              />
              <YAxis hide />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [v.toLocaleString("pt-BR"), "vídeos"]}
                labelFormatter={(l) => `${l}`}
              />
              <Bar dataKey="count" fill="hsl(346,87%,55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Dia da semana */}
        <ChartCard title="Dia da semana">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [v.toLocaleString("pt-BR"), "vídeos"]}
              />
              <Bar dataKey="count" fill="hsl(262,83%,58%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Atividade por mês */}
        <ChartCard title="Atividade por mês">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.activityByMonth} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199,89%,48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199,89%,48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,10%,13%)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "hsl(240,5%,55%)", fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(v: string) => v.split(" ")[0]}
              />
              <YAxis hide />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [v.toLocaleString("pt-BR"), "vídeos"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(199,89%,48%)"
                strokeWidth={2}
                fill="url(#monthGrad)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Ano ou horário do dia */}
        {hasMultiYear ? (
          <ChartCard title="Atividade por ano">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.activityByYear} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fill: "hsl(240,5%,55%)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: number) => [v.toLocaleString("pt-BR"), "vídeos"]}
                />
                <Bar dataKey="count" fill="hsl(47,95%,57%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : (
          <ChartCard title="Distribuição por período">
            <div className="space-y-4 mt-1">
              {data.timeSlotPercentages.map((slot, i) => {
                const colors = [
                  "hsl(47,95%,57%)", "hsl(346,87%,55%)",
                  "hsl(262,83%,58%)", "hsl(199,89%,48%)",
                ];
                return (
                  <div key={slot.slot} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-24 shrink-0">{slot.slot}</span>
                    <div className="flex-1 h-2 bg-secondary/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${slot.percentage}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: colors[i] }}
                      />
                    </div>
                    <span className="text-sm font-bold tabular-nums w-12 text-right">
                      {slot.percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}
      </div>
    </section>
  );
}
