import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/store";
import { StatsCards } from "./StatsCards";
import { PersonalityCard } from "./PersonalityCard";
import { TopChannels } from "./TopChannels";
import { WatchPatterns } from "./WatchPatterns";
import { BingeSessions } from "./BingeSessions";
import { FunInsights } from "./FunInsights";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { DataTimeline } from "./DataTimeline";
import { Button } from "@/components/ui/button";
import { UploadCloud, Share2 } from "lucide-react";
import { useState } from "react";
import { shareCard } from "@/lib/shareCard";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export function Dashboard() {
  const { data, reset } = useHistoryStore();
  const [sharing, setSharing] = useState(false);
  if (!data) return null;

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareCard(data);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── sticky header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <span className="text-base font-extrabold tracking-tight shrink-0">
            Tube<span className="text-primary">Trace</span>
          </span>

          {/* data range pill */}
          <span className="hidden sm:block text-xs text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full font-medium truncate max-w-xs">
            {data.totalVideos.toLocaleString("pt-BR")} vídeos · {data.uniqueChannels.toLocaleString("pt-BR")} canais
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleShare}
              disabled={sharing}
              className="gap-2 text-xs rounded-full"
            >
              <Share2 className="w-3.5 h-3.5" />
              {sharing ? "Gerando…" : "Compartilhar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="gap-2 text-xs rounded-full"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo arquivo</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── content ── */}
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-16"
      >
        <PersonalityCard />
        <StatsCards />
        <DataTimeline />
        <ActivityHeatmap />
        <TopChannels />
        <WatchPatterns />
        <BingeSessions />
        <FunInsights />
      </motion.main>
    </div>
  );
}
