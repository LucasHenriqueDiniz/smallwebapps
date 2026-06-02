import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const personalities: Record<string, { label: string; description: string; emoji: string }> = {
  "The Night Owl": {
    label: "Coruja Noturna",
    emoji: "🦉",
    description: "Madrugada é o seu horário nobre. Enquanto o mundo dorme, você está no décimo quinto vídeo.",
  },
  "The Early Bird": {
    label: "Madrugador",
    emoji: "🌅",
    description: "Café na mão, YouTube na tela. Você começa o dia antes de todo mundo.",
  },
  "The Binge Watcher": {
    label: "Maratonador",
    emoji: "🔥",
    description: "Um vídeo puxa o outro. Parar nunca foi uma opção real.",
  },
  "The Loyal Fan": {
    label: "Fã Leal",
    emoji: "❤️",
    description: "Você encontrou seus canais favoritos e nunca mais largou. Lealdade acima de tudo.",
  },
  "The Variety Seeker": {
    label: "Explorador",
    emoji: "🧭",
    description: "Algoritmo? Nunca ouviu falar. Você vai de culinária a física quântica sem pestanejar.",
  },
  "The Weekend Warrior": {
    label: "Guerreiro de Fim de Semana",
    emoji: "⚡",
    description: "Durante a semana é correria. Mas no sábado e domingo você recupera o tempo perdido.",
  },
  "The Balanced Viewer": {
    label: "Espectador Equilibrado",
    emoji: "⚖️",
    description: "Consistente, criterioso e habitual. Seu consumo é o retrato da disciplina.",
  },
};

const gradients: Record<string, string> = {
  "The Night Owl":        "from-indigo-950 via-purple-950 to-slate-950",
  "The Early Bird":       "from-amber-950 via-orange-950 to-red-950",
  "The Binge Watcher":    "from-rose-950 via-pink-950 to-fuchsia-950",
  "The Loyal Fan":        "from-emerald-950 via-teal-950 to-cyan-950",
  "The Variety Seeker":   "from-cyan-950 via-blue-950 to-indigo-950",
  "The Weekend Warrior":  "from-violet-950 via-purple-950 to-indigo-950",
  "The Balanced Viewer":  "from-slate-950 via-zinc-950 to-neutral-950",
};

const accents: Record<string, string> = {
  "The Night Owl":        "text-indigo-400",
  "The Early Bird":       "text-amber-400",
  "The Binge Watcher":    "text-rose-400",
  "The Loyal Fan":        "text-emerald-400",
  "The Variety Seeker":   "text-cyan-400",
  "The Weekend Warrior":  "text-violet-400",
  "The Balanced Viewer":  "text-slate-400",
};

export function PersonalityCard() {
  const data = useHistoryStore((s) => s.data);
  if (!data) return null;

  const key = data.personalities[0] || "The Balanced Viewer";
  const p = personalities[key] ?? {
    label: key,
    emoji: "🎬",
    description: "Seu jeito de assistir ao YouTube é único.",
  };
  const gradient = gradients[key] ?? "from-slate-950 to-zinc-950";
  const accent = accents[key] ?? "text-primary";
  const others = data.personalities.slice(1).map(
    (k) => personalities[k]?.label ?? k
  );

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} border border-white/8 p-8 md:p-12`}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-white/4 blur-3xl" />
      <div className="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/3 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label={p.label}>{p.emoji}</span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Sua personalidade no YouTube
          </p>
        </div>

        <div>
          <h2 className={`text-4xl md:text-6xl font-extrabold tracking-tight ${accent} leading-none`}>
            {p.label}
          </h2>
          {others.length > 0 && (
            <p className="mt-2 text-sm text-white/40">
              Também: {others.join(" · ")}
            </p>
          )}
        </div>

        <p className="text-base md:text-lg text-white/65 max-w-xl leading-relaxed">
          {p.description}
        </p>

        <p className="text-xs text-white/30">
          Baseado em {data.totalVideos.toLocaleString("pt-BR")} vídeos —{" "}
          {format(data.dateRange.start, "MMM yyyy", { locale: ptBR })} até{" "}
          {format(data.dateRange.end, "MMM yyyy", { locale: ptBR })}
        </p>
      </div>
    </motion.div>
  );
}
