import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, Clock, Play, Trophy } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

function formatDuration(ms: number) {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function BingeSessions() {
  const data = useHistoryStore((s) => s.data);
  if (!data || data.bingeSessions.length === 0) return null;

  return (
    <section>
      <SectionHeader
        label="Maratonas"
        title="Sessões de binge"
        description={`${data.bingeSessions.length} sessão${data.bingeSessions.length > 1 ? "ões" : ""} de maratona detectada${data.bingeSessions.length > 1 ? "s" : ""} no seu histórico.`}
      />

      <div className="grid gap-4">
        {data.bingeSessions.map((session, i) => {
          const channels = Array.from(session.channels).slice(0, 4);
          const more = session.channels.size - channels.length;
          const isBiggest = i === 0;

          return (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
              className={`relative overflow-hidden bg-card border rounded-2xl p-5 transition-colors ${
                isBiggest
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/60 hover:border-border"
              }`}
            >
              {/* Biggest binge badge */}
              {isBiggest && (
                <div className="flex items-center gap-1.5 mb-4">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Maior maratona
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6">
                {/* Duração */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isBiggest ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    <Flame className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tabular-nums leading-none">
                      {formatDuration(session.durationMs)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">duração</p>
                  </div>
                </div>

                {/* Vídeos */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                    <Play className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tabular-nums leading-none">{session.videoCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">vídeos</p>
                  </div>
                </div>

                {/* Data e hora */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none">
                      {format(session.startDate, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(session.startDate, "HH:mm")} – {format(session.endDate, "HH:mm")}
                    </p>
                  </div>
                </div>

                {/* Canais */}
                {channels.length > 0 && (
                  <div className="flex flex-wrap gap-2 md:ml-auto">
                    {channels.map((ch) => (
                      <span
                        key={ch}
                        className="text-xs bg-secondary/80 px-2.5 py-1 rounded-full text-muted-foreground"
                      >
                        {ch}
                      </span>
                    ))}
                    {more > 0 && (
                      <span className="text-xs bg-secondary/80 px-2.5 py-1 rounded-full text-muted-foreground">
                        +{more}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
