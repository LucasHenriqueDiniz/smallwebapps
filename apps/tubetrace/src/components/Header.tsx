import { Github } from "lucide-react";

type Locale = "pt-BR" | "en";

interface HeaderProps {
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
}

export function Header({ locale, onLocaleChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 md:p-6 h-16 flex items-center justify-between">

        {/* logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="/favicon.svg" alt="TubeTrace" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-extrabold tracking-tight">
            Tube<span className="text-primary">Trace</span>
          </span>
        </a>

        {/* right */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/LucasHenriqueDiniz/tubetrace"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 text-xs">
            {(["pt-BR", "en"] as Locale[]).map((opt) => (
              <button
                key={opt}
                onClick={() => onLocaleChange(opt)}
                className={`rounded-full px-3 py-1 font-bold transition-colors ${
                  locale === opt
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt === "pt-BR" ? "PT" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
