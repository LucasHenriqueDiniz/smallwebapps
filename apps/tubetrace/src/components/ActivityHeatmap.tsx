import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SectionHeader } from "./SectionHeader";

const CELL_SIZE = 11;
const CELL_GAP  = 2;
const WEEKS     = 53;

const MONTH_LABELS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DAY_LABELS_PT   = ["D", "S", "T", "Q", "Q", "S", "S"];

function intensity(count: number, max: number): number {
  if (count === 0) return 0;
  const p = count / max;
  if (p < 0.15) return 1;
  if (p < 0.35) return 2;
  if (p < 0.65) return 3;
  return 4;
}

const intensityClasses = [
  "bg-white/5",
  "bg-primary/20",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

export function ActivityHeatmap() {
  const data = useHistoryStore((s) => s.data);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; date: string; count: number;
  } | null>(null);

  const { grid, monthPositions, maxCount } = useMemo(() => {
    if (!data || data.dailyActivity.length === 0)
      return { grid: [], monthPositions: [], maxCount: 0 };

    const activityMap = new Map(data.dailyActivity.map((d) => [d.date, d.count]));
    const max = Math.max(...data.dailyActivity.map((d) => d.count), 1);
    const endDate = new Date(data.dateRange.end);
    endDate.setHours(23, 59, 59);
    const startDate = addDays(startOfWeek(endDate, { weekStartsOn: 0 }), -(WEEKS - 1) * 7);

    const weeks: { date: Date; count: number; key: string }[][] = [];
    let cursor = new Date(startDate);
    const monthPos: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let col = 0; col < WEEKS; col++) {
      const week: { date: Date; count: number; key: string }[] = [];
      for (let row = 0; row < 7; row++) {
        const key = format(cursor, "yyyy-MM-dd");
        const count = activityMap.get(key) || 0;
        const month = cursor.getMonth();
        if (month !== lastMonth && row === 0) {
          monthPos.push({ label: MONTH_LABELS_PT[month], col });
          lastMonth = month;
        }
        week.push({ date: new Date(cursor), count, key });
        cursor = addDays(cursor, 1);
      }
      weeks.push(week);
    }

    return { grid: weeks, monthPositions: monthPos, maxCount: max };
  }, [data]);

  if (!data || grid.length === 0) return null;

  return (
    <section>
      <SectionHeader
        label="Calendário"
        title="Atividade diária"
        description="Cada quadrado é um dia. Quanto mais escuro, mais vídeos."
      />

      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className="bg-card border border-border/60 rounded-2xl p-6"
      >
        <div className="overflow-x-auto">
          <div className="relative min-w-max">
            {/* Meses */}
            <div className="flex mb-1 ml-7">
              {monthPositions.map((mp, i) => (
                <div
                  key={i}
                  className="text-[10px] text-muted-foreground absolute font-medium"
                  style={{ left: 28 + mp.col * (CELL_SIZE + CELL_GAP) }}
                >
                  {mp.label}
                </div>
              ))}
            </div>

            <div className="flex mt-4">
              {/* Dias da semana */}
              <div className="flex flex-col mr-1.5" style={{ gap: CELL_GAP }}>
                {DAY_LABELS_PT.map((d, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-muted-foreground flex items-center justify-end font-medium"
                    style={{ height: CELL_SIZE, width: 18 }}
                  >
                    {i % 2 === 1 ? d : ""}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex" style={{ gap: CELL_GAP }}>
                {grid.map((week, col) => (
                  <div key={col} className="flex flex-col" style={{ gap: CELL_GAP }}>
                    {week.map((cell, row) => {
                      const lvl = intensity(cell.count, maxCount);
                      return (
                        <div
                          key={row}
                          className={`rounded-sm cursor-pointer transition-opacity hover:opacity-75 ${intensityClasses[lvl]}`}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          onMouseEnter={(e) => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setTooltip({ x: rect.left, y: rect.top, date: cell.key, count: cell.count });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="text-[10px] text-muted-foreground">Menos</span>
              {intensityClasses.map((cls, i) => (
                <div
                  key={i}
                  className={`rounded-sm ${cls}`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground">Mais</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-popover border border-border text-popover-foreground text-xs rounded-xl px-3 py-2 shadow-xl"
            style={{ left: tooltip.x + 14, top: tooltip.y - 44 }}
          >
            <span className="font-bold">
              {tooltip.count} vídeo{tooltip.count !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground ml-1.5">
              {format(new Date(tooltip.date + "T12:00:00"), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}
      </motion.div>
    </section>
  );
}
