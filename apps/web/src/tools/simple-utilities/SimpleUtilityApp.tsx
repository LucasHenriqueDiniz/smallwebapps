import { useMemo, useState } from "react";

type SimpleTool =
  | "robots-txt-generator"
  | "sitemap-generator"
  | "htaccess-redirect-generator"
  | "csp-generator"
  | "gitignore-generator"
  | "dockerignore-generator"
  | "sql-formatter"
  | "utm-builder"
  | "url-query-builder"
  | "word-frequency-counter"
  | "csv-column-extractor"
  | "json-schema-generator"
  | "json-path-extractor"
  | "csv-to-sql"
  | "csv-to-markdown"
  | "csv-delimiter-converter"
  | "css-clamp-generator"
  | "css-minifier"
  | "html-minifier"
  | "markdown-table-generator"
  | "uuid-validator"
  | "ulid-generator"
  | "luhn-validator"
  | "mime-type-lookup"
  | "user-agent-parser"
  | "chmod-calculator"
  | "email-validator"
  | "youtube-url-parser"
  | "youtube-chapter-generator"
  | "youtube-tag-extractor"
  | "youtube-title-counter"
  | "youtube-description-cleaner"
  | "instagram-hashtag-extractor"
  | "instagram-caption-formatter";

interface Props {
  tool: SimpleTool;
}

const toolLabels: Record<SimpleTool, { title: string; helper: string }> = {
  "robots-txt-generator": {
    title: "Robots.txt Generator",
    helper: "Create a basic robots.txt file with crawl rules and a sitemap reference.",
  },
  "sitemap-generator": {
    title: "Sitemap XML Generator",
    helper: "Turn a list of URLs into a valid sitemap.xml file.",
  },
  "htaccess-redirect-generator": {
    title: ".htaccess Redirect Generator",
    helper: "Generate common Apache redirect rules for migrations and canonical URLs.",
  },
  "csp-generator": {
    title: "Content Security Policy Generator",
    helper: "Build a starter CSP header for static sites and simple apps.",
  },
  "gitignore-generator": {
    title: ".gitignore Generator",
    helper: "Combine common ignore templates for JavaScript, Python, OS files, and editors.",
  },
  "dockerignore-generator": {
    title: ".dockerignore Generator",
    helper: "Keep local dependencies, caches, logs, and secrets out of Docker build contexts.",
  },
  "sql-formatter": {
    title: "SQL Formatter",
    helper: "Format common SQL queries with readable line breaks and indentation.",
  },
  "utm-builder": {
    title: "UTM Builder",
    helper: "Create campaign URLs with source, medium, campaign, term, and content parameters.",
  },
  "url-query-builder": {
    title: "URL Query Builder",
    helper: "Build or rewrite a URL query string from key=value pairs.",
  },
  "word-frequency-counter": {
    title: "Word Frequency Counter",
    helper: "Count repeated words and export frequency data from pasted text.",
  },
  "csv-column-extractor": {
    title: "CSV Column Extractor",
    helper: "Extract one CSV column by header name or zero-based column index.",
  },
  "json-schema-generator": {
    title: "JSON Schema Generator",
    helper: "Infer a starter JSON Schema from a sample JSON object or array.",
  },
  "json-path-extractor": {
    title: "JSON Path Extractor",
    helper: "Extract a nested value from JSON using a simple dot path.",
  },
  "csv-to-sql": {
    title: "CSV to SQL INSERT Converter",
    helper: "Convert CSV rows into SQL INSERT statements for quick imports and tests.",
  },
  "csv-to-markdown": {
    title: "CSV to Markdown Table",
    helper: "Turn pasted CSV data into a Markdown table for docs and README files.",
  },
  "csv-delimiter-converter": {
    title: "CSV Delimiter Converter",
    helper: "Convert comma-separated rows to TSV, semicolon CSV, or pipe-delimited text.",
  },
  "css-clamp-generator": {
    title: "CSS Clamp Generator",
    helper: "Generate responsive clamp() expressions from min and max font sizes.",
  },
  "css-minifier": {
    title: "CSS Minifier",
    helper: "Remove comments and extra whitespace from CSS snippets.",
  },
  "html-minifier": {
    title: "HTML Minifier",
    helper: "Remove comments and extra whitespace from HTML snippets.",
  },
  "markdown-table-generator": {
    title: "Markdown Table Generator",
    helper: "Build a Markdown table from headers and row values.",
  },
  "uuid-validator": {
    title: "UUID Validator",
    helper: "Check UUID strings and identify their version.",
  },
  "ulid-generator": {
    title: "ULID Generator",
    helper: "Generate sortable ULID identifiers locally in the browser.",
  },
  "luhn-validator": {
    title: "Luhn Validator",
    helper: "Validate card-like numbers with the Luhn checksum algorithm.",
  },
  "mime-type-lookup": {
    title: "MIME Type Lookup",
    helper: "Look up common MIME types from file extensions or filenames.",
  },
  "user-agent-parser": {
    title: "User-Agent Parser",
    helper: "Extract browser, OS, device, and engine hints from a user-agent string.",
  },
  "chmod-calculator": {
    title: "chmod Calculator",
    helper: "Convert Unix file permissions between rwx notation and octal chmod values.",
  },
  "email-validator": {
    title: "Email Validator",
    helper: "Validate and normalize email addresses with practical syntax checks.",
  },
  "youtube-url-parser": {
    title: "YouTube URL Parser",
    helper: "Extract video IDs, playlist IDs, channel handles, and timestamps from YouTube URLs.",
  },
  "youtube-chapter-generator": {
    title: "YouTube Chapter Generator",
    helper: "Turn timestamp and title lines into clean YouTube chapter markup.",
  },
  "youtube-tag-extractor": {
    title: "YouTube Tag Extractor",
    helper: "Extract hashtags and repeated keyword candidates from titles or descriptions.",
  },
  "youtube-title-counter": {
    title: "YouTube Title Counter",
    helper: "Count title length and estimate whether a YouTube title is likely to truncate.",
  },
  "youtube-description-cleaner": {
    title: "YouTube Description Cleaner",
    helper: "Clean spacing, links, hashtags, and repeated blank lines in YouTube descriptions.",
  },
  "instagram-hashtag-extractor": {
    title: "Instagram Hashtag Extractor",
    helper: "Extract hashtags from captions and return a deduped copyable list.",
  },
  "instagram-caption-formatter": {
    title: "Instagram Caption Formatter",
    helper: "Clean caption spacing and separate text, hashtags, and mentions for editing.",
  },
};

const gitignoreTemplates = {
  Node: ["node_modules/", "dist/", "build/", ".env", ".env.*", "npm-debug.log*", "pnpm-debug.log*"],
  Python: ["__pycache__/", "*.py[cod]", ".venv/", "venv/", "dist/", "*.egg-info/"],
  OS: [".DS_Store", "Thumbs.db", "Desktop.ini"],
  Editors: [".vscode/", ".idea/", "*.swp", "*.swo"],
};

const dockerignoreTemplates = {
  JavaScript: ["node_modules", "npm-debug.log", "pnpm-debug.log", ".next", "dist", "coverage"],
  Python: ["__pycache__", "*.pyc", ".venv", "venv", ".pytest_cache", ".mypy_cache"],
  Git: [".git", ".gitignore", ".github"],
  Secrets: [".env", ".env.*", "*.pem", "*.key"],
};

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatSql(sql: string) {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|JOIN|VALUES|SET)\b/gi, "\n$1")
    .replace(/\b(AND|OR)\b/gi, "\n  $1")
    .replace(/,\s*/g, ",\n  ")
    .trim();
}

function parseCsvRows(input: string) {
  return input
    .split(/\r?\n/)
    .filter((row) => row.trim())
    .map((row) => row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
}

function sqlValue(value: string) {
  return value === "" ? "NULL" : `'${value.replace(/'/g, "''")}'`;
}

function csvToMarkdown(input: string) {
  const rows = parseCsvRows(input);
  if (!rows.length) return "";
  const header = rows[0];
  const separator = header.map(() => "---");
  return [header, separator, ...rows.slice(1)]
    .map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
}

function inferJsonSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return { type: "array", items: value.length ? inferJsonSchema(value[0]) : {} };
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return {
      type: "object",
      required: entries.map(([key]) => key),
      properties: Object.fromEntries(entries.map(([key, child]) => [key, inferJsonSchema(child)])),
    };
  }
  if (value === null) return { type: "null" };
  return { type: typeof value };
}

function extractJsonPath(input: string, path: string) {
  const parsed = JSON.parse(input);
  const value = path
    .replace(/^\$\.?/, "")
    .split(".")
    .filter(Boolean)
    .reduce<unknown>((current, segment) => {
      if (current == null) return undefined;
      const match = segment.match(/^(.+)\[(\d+)\]$/);
      if (match) return (current as Record<string, unknown[]>)[match[1]]?.[Number(match[2])];
      return (current as Record<string, unknown>)[segment];
    }, parsed);
  return JSON.stringify(value, null, 2);
}

function minifyCss(input: string) {
  return input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,>])\s*/g, "$1").trim();
}

function minifyHtml(input: string) {
  return input.replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
}

function luhnValid(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length < 2) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function generateUlid() {
  const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let time = Date.now();
  let encodedTime = "";
  for (let i = 0; i < 10; i += 1) {
    encodedTime = alphabet[time % 32] + encodedTime;
    time = Math.floor(time / 32);
  }
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((value) => alphabet[value % 32])
    .join("");
  return encodedTime + random;
}

const mimeTypes: Record<string, string> = {
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  json: "application/json",
  csv: "text/csv",
  txt: "text/plain",
  xml: "application/xml",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  zip: "application/zip",
  wasm: "application/wasm",
};

function parseUserAgent(input: string) {
  const ua = input || navigator.userAgent;
  const browser = ua.includes("Edg/") ? "Microsoft Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
  const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS X") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
  const engine = ua.includes("AppleWebKit") ? "WebKit/Blink" : ua.includes("Gecko/") ? "Gecko" : "Unknown";
  const device = /Mobile|Android|iPhone/.test(ua) ? "Mobile" : "Desktop";
  return `Browser: ${browser}\nOS: ${os}\nDevice: ${device}\nEngine: ${engine}\n\n${ua}`;
}

function parseYouTubeUrl(input: string) {
  try {
    const url = new URL(input.trim() || "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=43s");
    const host = url.hostname.replace(/^www\./, "");
    const videoId = host === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    const playlistId = url.searchParams.get("list");
    const handle = url.pathname.match(/^\/@([^/?]+)/)?.[1];
    const timestamp = url.searchParams.get("t") || url.searchParams.get("start");
    return [
      `Video ID: ${videoId || "Not found"}`,
      `Playlist ID: ${playlistId || "Not found"}`,
      `Channel handle: ${handle ? `@${handle}` : "Not found"}`,
      `Timestamp: ${timestamp || "Not found"}`,
      `Host: ${host}`,
    ].join("\n");
  } catch {
    return "Invalid YouTube URL";
  }
}

function extractHashtags(input: string) {
  return [...new Set((input.match(/#[\p{L}\p{N}_]+/gu) ?? []).map((tag) => tag.toLowerCase()))].join(" ");
}

function extractKeywordCandidates(input: string) {
  const stop = new Set(["the", "and", "for", "with", "you", "your", "from", "this", "that", "uma", "para", "com", "como", "mais"]);
  const words = input.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [];
  const counts = new Map<string, number>();
  words.filter((word) => !stop.has(word)).forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20)
    .map(([word, count]) => `${word},${count}`)
    .join("\n");
}

function normalizeChapterLine(line: string, index: number) {
  const trimmed = line.trim();
  const match = trimmed.match(/^((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+)$/);
  if (match) return `${match[1]} ${match[2].trim()}`;
  return `${index === 0 ? "00:00" : "00:00"} ${trimmed || `Chapter ${index + 1}`}`;
}

function cleanDescription(input: string) {
  return input
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(https?:\/\/\S+)/g, "\n$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function SimpleUtilityApp({ tool }: Props) {
  const meta = toolLabels[tool];
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");
  const [selected, setSelected] = useState<string[]>(["Node", "OS"]);

  const output = useMemo(() => {
    switch (tool) {
      case "robots-txt-generator": {
        const userAgent = primary.trim() || "*";
        const disallow = lines(secondary).map((path) => `Disallow: ${path.startsWith("/") ? path : `/${path}`}`);
        const sitemap = tertiary.trim();
        return [`User-agent: ${userAgent}`, ...disallow, sitemap ? `Sitemap: ${sitemap}` : ""].filter(Boolean).join("\n");
      }
      case "sitemap-generator": {
        const urls = lines(primary);
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
          .join("\n")}\n</urlset>`;
      }
      case "htaccess-redirect-generator": {
        const source = primary.trim() || "/old-page";
        const target = secondary.trim() || "https://example.com/new-page";
        return `Redirect 301 ${source} ${target}`;
      }
      case "csp-generator": {
        const defaultSrc = primary.trim() || "'self'";
        const imgSrc = secondary.trim() || "'self' data: https:";
        const scriptSrc = tertiary.trim() || "'self'";
        return `Content-Security-Policy: default-src ${defaultSrc}; script-src ${scriptSrc}; img-src ${imgSrc}; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`;
      }
      case "gitignore-generator":
        return selected.flatMap((name) => gitignoreTemplates[name as keyof typeof gitignoreTemplates] ?? []).join("\n");
      case "dockerignore-generator":
        return selected.flatMap((name) => dockerignoreTemplates[name as keyof typeof dockerignoreTemplates] ?? []).join("\n");
      case "sql-formatter":
        return formatSql(primary || "select id, email, created_at from users where active = true order by created_at desc limit 50");
      case "utm-builder": {
        const base = primary.trim() || "https://example.com/";
        const params = new URLSearchParams();
        if (secondary.trim()) params.set("utm_source", secondary.trim());
        if (tertiary.trim()) params.set("utm_medium", tertiary.trim());
        params.set("utm_campaign", "campaign-name");
        return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
      }
      case "url-query-builder": {
        const base = primary.trim() || "https://example.com/search";
        const params = new URLSearchParams();
        lines(secondary || "q=browser tools\npage=1").forEach((line) => {
          const [key, ...rest] = line.split("=");
          if (key) params.set(key.trim(), rest.join("=").trim());
        });
        return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
      }
      case "word-frequency-counter": {
        const words = (primary || "browser tools browser privacy local tools")
          .toLowerCase()
          .match(/[a-z0-9']+/g) ?? [];
        const counts = new Map<string, number>();
        words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
        return [...counts.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([word, count]) => `${word},${count}`)
          .join("\n");
      }
      case "csv-column-extractor": {
        const rows = parseCsvRows(primary || "name,email\nAda,ada@example.com\nLinus,linus@example.com");
        const selector = (secondary || "email").trim();
        const headers = rows[0] ?? [];
        const index = /^\d+$/.test(selector) ? Number(selector) : headers.indexOf(selector);
        return rows.slice(1).map((row) => row[index] ?? "").join("\n");
      }
      case "json-schema-generator": {
        try {
          return JSON.stringify(inferJsonSchema(JSON.parse(primary || '{"id":1,"email":"ada@example.com","active":true}')), null, 2);
        } catch (error) {
          return `Invalid JSON: ${error instanceof Error ? error.message : "Unable to parse input"}`;
        }
      }
      case "json-path-extractor": {
        try {
          return extractJsonPath(primary || '{"user":{"name":"Ada","roles":["admin","editor"]}}', secondary || "user.roles[0]");
        } catch (error) {
          return `Unable to extract path: ${error instanceof Error ? error.message : "Invalid input"}`;
        }
      }
      case "csv-to-sql": {
        const rows = parseCsvRows(primary || "name,email\nAda,ada@example.com\nLinus,linus@example.com");
        const table = (secondary || "users").trim().replace(/[^\w]/g, "") || "table_name";
        const columns = rows[0] ?? [];
        return rows.slice(1).map((row) => `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${row.map(sqlValue).join(", ")});`).join("\n");
      }
      case "csv-to-markdown":
        return csvToMarkdown(primary || "Name,Email\nAda,ada@example.com\nLinus,linus@example.com");
      case "csv-delimiter-converter": {
        const delimiter = (secondary || "tab").toLowerCase() === "semicolon" ? ";" : (secondary || "tab").toLowerCase() === "pipe" ? "|" : "\t";
        return parseCsvRows(primary || "name,email\nAda,ada@example.com").map((row) => row.join(delimiter)).join("\n");
      }
      case "css-clamp-generator": {
        const min = Number(primary || 16);
        const max = Number(secondary || 32);
        const minWidth = Number(tertiary || 320);
        const maxWidth = 1200;
        const slope = ((max - min) / (maxWidth - minWidth)) * 100;
        const intercept = min - (slope * minWidth) / 100;
        return `clamp(${min}px, ${intercept.toFixed(3)}px + ${slope.toFixed(3)}vw, ${max}px)`;
      }
      case "css-minifier":
        return minifyCss(primary || "/* Button */\n.button {\n  color: white;\n  background: #1a73e8;\n}");
      case "html-minifier":
        return minifyHtml(primary || "<main>\n  <!-- intro -->\n  <h1>Hello</h1>\n</main>");
      case "markdown-table-generator": {
        const headers = lines(primary || "Name\nEmail");
        const rows = lines(secondary || "Ada,ada@example.com\nLinus,linus@example.com").map((row) => row.split(",").map((cell) => cell.trim()));
        return [headers, headers.map(() => "---"), ...rows].map((row) => `| ${row.join(" | ")} |`).join("\n");
      }
      case "uuid-validator": {
        const value = (primary || "550e8400-e29b-41d4-a716-446655440000").trim();
        const match = value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        return match ? `Valid UUID v${match[1]}` : "Invalid UUID";
      }
      case "ulid-generator":
        return Array.from({ length: Number(primary || 5) || 5 }, generateUlid).join("\n");
      case "luhn-validator":
        return luhnValid(primary || "4242 4242 4242 4242") ? "Valid Luhn checksum" : "Invalid Luhn checksum";
      case "mime-type-lookup": {
        const ext = (primary || "example.json").split(".").pop()?.toLowerCase() ?? "";
        return mimeTypes[ext] ? `${ext}: ${mimeTypes[ext]}` : `Unknown MIME type for .${ext}`;
      }
      case "user-agent-parser":
        return parseUserAgent(primary);
      case "chmod-calculator": {
        const input = (primary || "rwxr-xr-x").trim();
        if (/^[0-7]{3,4}$/.test(input)) {
          const chars = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
          return input.slice(-3).split("").map((digit) => chars[Number(digit)]).join("");
        }
        const chunks = input.match(/[r-][w-][x-]/g) ?? [];
        return chunks.map((chunk) => (chunk[0] === "r" ? 4 : 0) + (chunk[1] === "w" ? 2 : 0) + (chunk[2] === "x" ? 1 : 0)).join("");
      }
      case "email-validator": {
        const value = (primary || "ada@example.com").trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        return valid ? `Valid email\nNormalized: ${value.toLowerCase()}` : "Invalid email syntax";
      }
      case "youtube-url-parser":
        return parseYouTubeUrl(primary);
      case "youtube-chapter-generator":
        return lines(primary || "00:00 Intro\n01:25 Setup\n04:10 Results").map(normalizeChapterLine).join("\n");
      case "youtube-tag-extractor":
        return [`Hashtags:\n${extractHashtags(primary || "#tutorial Learn browser tools #WebDev") || "None"}`, "", `Keyword candidates:\n${extractKeywordCandidates(primary || "Learn browser tools for faster YouTube workflow and web development")}`].join("\n");
      case "youtube-title-counter": {
        const title = (primary || "How to clean CSV files in your browser").trim();
        return `Characters: ${title.length}\nWords: ${title.split(/\s+/).filter(Boolean).length}\nLikely truncation risk: ${title.length > 70 ? "High" : title.length > 55 ? "Medium" : "Low"}\n\n${title}`;
      }
      case "youtube-description-cleaner":
        return cleanDescription(primary || "New video!\n\n\nWatch more at https://example.com\n\n#tools #youtube");
      case "instagram-hashtag-extractor":
        return extractHashtags(primary || "Launch day. #SmallBusiness #Marketing #Tools #marketing") || "No hashtags found";
      case "instagram-caption-formatter": {
        const caption = cleanDescription(primary || "New launch today!   \n\n\n@smallwebapps #tools #launch");
        const hashtags = extractHashtags(caption);
        const mentions = [...new Set(caption.match(/@[\w.]+/g) ?? [])].join(" ");
        return [`Caption:\n${caption.replace(/#[\p{L}\p{N}_]+/gu, "").replace(/@[\w.]+/g, "").trim()}`, "", `Mentions:\n${mentions || "None"}`, "", `Hashtags:\n${hashtags || "None"}`].join("\n");
      }
      default:
        return "";
    }
  }, [primary, secondary, selected, tertiary, tool]);

  const templateNames = tool === "dockerignore-generator" ? Object.keys(dockerignoreTemplates) : Object.keys(gitignoreTemplates);
  const copy = async () => navigator.clipboard?.writeText(output);

  return (
    <div className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">{meta.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{meta.helper} Everything runs locally in this tab.</p>
      </div>

      {tool === "gitignore-generator" || tool === "dockerignore-generator" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {templateNames.map((name) => (
            <label key={name} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={selected.includes(name)}
                onChange={(event) =>
                  setSelected((current) => event.target.checked ? [...current, name] : current.filter((item) => item !== name))
                }
              />
              {name}
            </label>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block lg:col-span-3">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              {tool.includes("csv") || tool.includes("sql") || tool.includes("word") || tool.includes("json") || tool.includes("youtube") || tool.includes("instagram") || tool === "sitemap-generator" ? "Input" : "Primary value"}
            </span>
            <textarea
              className="min-h-32 w-full rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none focus:border-blue-500"
              value={primary}
              onChange={(event) => setPrimary(event.target.value)}
              placeholder={tool === "sitemap-generator" ? "https://example.com/\nhttps://example.com/apps" : tool === "json-path-extractor" ? "{\"user\":{\"name\":\"Ada\"}}" : "Paste or type here"}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Option A</span>
            <input
              className="w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
              placeholder={tool === "csv-column-extractor" ? "email or 1" : tool === "json-path-extractor" ? "user.name" : tool === "csv-to-sql" ? "users" : tool === "robots-txt-generator" ? "/admin" : "Optional"}
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Option B</span>
            <input
              className="w-full rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              value={tertiary}
              onChange={(event) => setTertiary(event.target.value)}
              placeholder={tool === "robots-txt-generator" ? "https://example.com/sitemap.xml" : "Optional"}
            />
          </label>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Output</span>
          <button type="button" onClick={copy} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
            Copy
          </button>
        </div>
        <pre className="max-h-96 overflow-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-50">{output}</pre>
      </div>
    </div>
  );
}
