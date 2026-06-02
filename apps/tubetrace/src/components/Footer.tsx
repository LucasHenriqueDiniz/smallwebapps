import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/40">
      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground/80">
            Tube<span className="text-primary">Trace</span>
          </span>
          <span className="text-muted-foreground/50">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex items-center gap-5">
          <a href="/privacy.html" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">
            Privacidade
          </a>
          <a href="/terms.html" target="_blank" rel="noopener" className="hover:text-foreground transition-colors">
            Termos
          </a>
          <a
            href="https://github.com/LucasHenriqueDiniz/tubetrace"
            target="_blank" rel="noopener"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
