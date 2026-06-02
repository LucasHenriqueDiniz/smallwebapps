import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCode,
  FileJson,
  HelpCircle,
  Play,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { useHistoryStore } from "@/lib/store";
import {
  generateDemoData,
  HistoryParseError,
  type HistoryParseErrorCode,
  parseHistoryFile,
} from "@/lib/parser";

const copy = {
  "pt-BR": {
    loading: "Abrindo exportação e analisando seu histórico...",
    parseError:
      "Não consegui ler o arquivo. Envie um ZIP/TGZ do Google Takeout ou um histórico válido do YouTube.",
    errors: {
      UNSUPPORTED_FORMAT:
        "Formato não suportado. Envie .zip, .tgz, .tar.gz, .json ou .html.",
      ARCHIVE_TOO_LARGE:
        "Esse arquivo está grande demais para abrir neste navegador. Gere outro Takeout marcando somente YouTube e YouTube Music.",
      NO_HISTORY_FILE:
        "Não encontrei o histórico do YouTube dentro desse arquivo. Gere outro Takeout selecionando YouTube e YouTube Music.",
      NO_ENTRIES:
        "Encontrei o arquivo, mas ele não parece ter vídeos assistidos. Confira se o histórico do YouTube estava ativado nessa conta.",
    },
    title: "TubeTrace.",
    intro:
      "Envie o ZIP do Google Takeout para descobrir sua personalidade de consumo, maiores maratonas e canais mais vistos.",
    privacy: "100% privado no upload manual. Tudo é processado no seu navegador.",
    uploadIdle: "Toque para escolher o ZIP do Takeout",
    uploadActive: "Solte a exportação aqui",
    formats: "Aceita .zip, .tgz, .tar.gz, .json ou .html",
    tryIt: "Ou teste sem arquivo",
    demo: "Carregar dados demo",
    howTitle: "Como pegar seus dados",
    howSubtitle:
      "Faça uma exportação menor e mais rápida: desmarque tudo e selecione somente YouTube e YouTube Music.",
    guideCta: "Ver passo a passo",
    guideTitle: "Exportar histórico do YouTube",
    guideDescription:
      "O Google pode levar minutos ou horas para preparar o arquivo, dependendo da quantidade de dados na sua conta.",
    steps: [
      "Abra o Google Takeout com a conta usada no YouTube.",
      "Clique em Desmarcar tudo para evitar uma exportação gigante.",
      "Role até YouTube e YouTube Music e marque somente esse produto.",
      "Nas opções do produto, mantenha o histórico e prefira JSON quando o Google oferecer essa escolha.",
      "Crie a exportação e aguarde o e-mail do Google. Pode demorar conforme o volume de dados.",
      "Baixe o arquivo .zip, .tgz ou .tar.gz e envie direto aqui. Não precisa extrair manualmente.",
    ],
    openTakeout: "Abrir Google Takeout",
    safeNote:
      "Depois de escolher o arquivo, ele não é enviado para servidor nenhum.",
    language: "Idioma",
    archiveBadge: "ZIP do Takeout agora funciona",
    waitNote: "Exports grandes podem demorar para ficar prontos no Google.",
  },
  en: {
    loading: "Opening your export and crunching the numbers...",
    parseError:
      "Failed to parse file. Upload a Google Takeout ZIP/TGZ or a valid YouTube watch history file.",
    errors: {
      UNSUPPORTED_FORMAT:
        "Unsupported format. Upload .zip, .tgz, .tar.gz, .json, or .html.",
      ARCHIVE_TOO_LARGE:
        "This file is too large to open in this browser. Create a new Takeout export with only YouTube and YouTube Music selected.",
      NO_HISTORY_FILE:
        "I could not find YouTube watch history inside this file. Create another Takeout export selecting YouTube and YouTube Music.",
      NO_ENTRIES:
        "I found the file, but it does not look like it contains watched videos. Check whether YouTube watch history was enabled for this account.",
    },
    title: "TubeTrace.",
    intro:
      "Upload your Google Takeout ZIP to see your viewing personality, top binges, and most watched channels.",
    privacy: "100% private for manual uploads. Processed entirely in your browser.",
    uploadIdle: "Tap to choose your Takeout ZIP",
    uploadActive: "Drop your export here",
    formats: "Supports .zip, .tgz, .tar.gz, .json, or .html",
    tryIt: "Or try it without a file",
    demo: "Load Demo Data",
    howTitle: "How to get your data",
    howSubtitle:
      "Make the export smaller and faster: deselect everything, then select only YouTube and YouTube Music.",
    guideCta: "View steps",
    guideTitle: "Export YouTube history",
    guideDescription:
      "Google can take minutes or hours to prepare the file depending on how much data your account has.",
    steps: [
      "Open Google Takeout with the account you use for YouTube.",
      "Click Deselect all to avoid a huge export.",
      "Scroll to YouTube and YouTube Music and select only that product.",
      "In product options, keep history included and choose JSON when Google offers that choice.",
      "Create the export and wait for Google's email. Timing depends on your data volume.",
      "Download the .zip, .tgz, or .tar.gz file and upload it here. No manual extraction needed.",
    ],
    openTakeout: "Open Google Takeout",
    safeNote: "After you pick a file, it is not uploaded to any server.",
    language: "Language",
    archiveBadge: "Takeout ZIP now works",
    waitNote: "Large exports can take time before Google makes them available.",
  },
} as const;

type Locale = keyof typeof copy;

export function UploadSection() {
  const { setLoading, setData, setError, error, isLoading } = useHistoryStore();
  const [locale, setLocale] = useState<Locale>(() =>
    navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en",
  );
  const t = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await new Promise(r => setTimeout(r, 100));

      const data = await parseHistoryFile(file);
      setData(data);
    } catch (err) {
      console.error(err);
      if (err instanceof HistoryParseError) {
        setError(t.errors[err.code as HistoryParseErrorCode]);
      } else {
        setError(t.parseError);
      }
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setError, t.errors, t.parseError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/html": [".html"],
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
      "application/gzip": [".tgz", ".tar.gz"],
      "application/x-gzip": [".tgz", ".tar.gz"],
      "application/octet-stream": [".tgz", ".tar.gz"],
    },
    multiple: false,
  });

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateDemoData());
      setLoading(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 px-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
        <h2 className="text-xl font-medium tracking-tight animate-pulse text-muted-foreground">
          {t.loading}
        </h2>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1">
      {/* header */}
      <Header locale={locale} onLocaleChange={setLocale} />

      <div className="relative z-10 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 md:mb-12 flex flex-col items-center"
      >
        {/* logo mark */}
        <img src="/favicon.svg" alt="TubeTrace" className="mb-6 h-16 w-16 rounded-2xl shadow-xl" />

        {/* badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary mb-6">
          <Archive className="w-4 h-4" />
          {t.archiveBadge}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
          {t.title}
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-5">
          {t.intro}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          {t.privacy}
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 bg-destructive/10 text-destructive px-6 py-4 rounded-xl flex items-center gap-3 w-full"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <div
          {...getRootProps()}
          className={`
            border-3 border-dashed rounded-3xl p-6 md:p-12 text-center cursor-pointer transition-all duration-300
            flex flex-col items-center justify-center gap-4 md:gap-6 min-h-[220px] md:min-h-[300px]
            ${isDragActive
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-card/50"
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="p-5 md:p-6 bg-background rounded-full shadow-xl">
            <UploadCloud className={`w-10 h-10 md:w-12 md:h-12 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              {isDragActive ? t.uploadActive : t.uploadIdle}
            </h3>
            <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-3 text-sm md:text-base">
              <span className="flex items-center gap-1"><Archive className="w-4 h-4" /> .zip/.tgz</span>
              <span className="flex items-center gap-1"><FileJson className="w-4 h-4" /> .json</span>
              <span className="flex items-center gap-1"><FileCode className="w-4 h-4" /> .html</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">{t.formats}</p>
          </div>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 w-full rounded-2xl border border-border/60 bg-card/60 p-5 md:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold">{t.howTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {t.howSubtitle}
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="min-h-11 rounded-full gap-2">
                <HelpCircle className="w-4 h-4" />
                {t.guideCta}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.guideTitle}</DialogTitle>
                <DialogDescription>{t.guideDescription}</DialogDescription>
              </DialogHeader>
              <ol className="mt-2 grid gap-3">
                {t.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-xl bg-muted/50 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/90">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-xl border border-border bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">{t.waitNote}</p>
                </div>
              </div>
              <a
                href="https://takeout.google.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                {t.openTakeout}
                <ExternalLink className="w-4 h-4" />
              </a>
            </DialogContent>
          </Dialog>

          <a
            href="https://takeout.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            {t.openTakeout}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-background/70 p-3">
          <CheckCircle2 className="mt-0.5 w-5 h-5 text-primary shrink-0" />
          <p className="text-xs leading-relaxed text-muted-foreground">{t.safeNote}</p>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 md:mt-12 flex flex-col items-center gap-4"
      >
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">{t.tryIt}</p>
        <Button onClick={handleDemo} variant="secondary" size="lg" className="rounded-full px-8 gap-2 font-semibold">
          <Play className="w-4 h-4" />
          {t.demo}
        </Button>
      </motion.div>
      </div>
    </div>
  );
}
