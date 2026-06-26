# Small Web Apps

Free browser-based tools for everyday PDF, image, developer, data, SEO, and YouTube tasks.

- Website: https://smallwebapps.com
- Tools directory: https://smallwebapps.com/apps/
- GitHub repository: https://github.com/LucasHenriqueDiniz/smallwebapps
- Sitemap: https://smallwebapps.com/sitemap-index.xml
- AI crawler guide: https://smallwebapps.com/llms.txt
- Robots file: https://smallwebapps.com/robots.txt
- Privacy: https://smallwebapps.com/privacy/
- Terms: https://smallwebapps.com/terms/
- Contact: https://smallwebapps.com/contact/

Small Web Apps is a static-first hub of lightweight utilities. The goal is simple: open a tool, finish the task, and leave without creating an account. Many tools run directly in the browser, and tool pages include plain-language notes about privacy, limitations, and expected use.

## Featured tools

### Developer tools

- JSON Formatter: https://smallwebapps.com/apps/json-formatter/
- JWT Decoder: https://smallwebapps.com/apps/jwt-decoder/
- Base64 Encoder: https://smallwebapps.com/apps/base64-encoder/
- Regex Tester: https://smallwebapps.com/apps/regex-tester/
- CSV Cleaner: https://smallwebapps.com/apps/csv-cleaner/

### PDF tools

- PDF Compressor: https://smallwebapps.com/apps/pdf-compress/
- Compress PDF to 100KB: https://smallwebapps.com/apps/compress-pdf-to-100kb/
- Compress PDF to 200KB: https://smallwebapps.com/apps/compress-pdf-to-200kb/
- Compress PDF to 500KB: https://smallwebapps.com/apps/compress-pdf-to-500kb/
- Compress PDF to 1MB: https://smallwebapps.com/apps/compress-pdf-to-1mb/
- PDF to Image: https://smallwebapps.com/apps/pdf-to-image/
- Extract PDF Text: https://smallwebapps.com/apps/pdf-extract-text/

### Image tools

- Image Optimizer: https://smallwebapps.com/apps/image-optimize/
- Compress Image to 50KB: https://smallwebapps.com/apps/compress-image-to-50kb/
- Compress Image to 100KB: https://smallwebapps.com/apps/compress-image-to-100kb/
- Compress Image to 200KB: https://smallwebapps.com/apps/compress-image-to-200kb/
- AI Image Checker: https://smallwebapps.com/apps/ai-image-checker/

### SEO and content tools

- Keyword Density Checker: https://smallwebapps.com/apps/keyword-density-checker/
- Meta Tags Analyzer: https://smallwebapps.com/apps/meta-tags-analyzer/
- Open Graph Checker: https://smallwebapps.com/apps/open-graph-checker/
- Word Counter: https://smallwebapps.com/apps/word-counter/
- QR Code Generator: https://smallwebapps.com/apps/qr-code-generator/

### Security and utility tools

- Password Generator: https://smallwebapps.com/apps/password-generator/
- Password Strength Checker: https://smallwebapps.com/apps/password-strength/
- BMI Calculator: https://smallwebapps.com/apps/bmi-calculator/
- Loan Calculator: https://smallwebapps.com/apps/loan-calculator/

## Why this exists

Most small online utilities are cluttered, slow, or unclear about what happens to user files. Small Web Apps is built around a different baseline:

- fast static pages;
- clear tool descriptions before the widget;
- useful pages even when JavaScript fails;
- privacy and limitation notes for risky workflows;
- no account requirement for normal tool use;
- internal links between related tools so users can keep working.

## Technology

- Astro for static pages, routing, metadata, and SEO structure
- TypeScript for app and metadata safety
- React islands for interactive tool surfaces
- Tailwind CSS and local CSS variables for styling
- Cloudflare Pages for static deployment

## Repository structure

```text
apps/
  web/                  Astro website, SEO pages, and embedded tools
  tubetrace/            Imported TubeTrace source used by the hub
packages/
  config/               Shared TypeScript/config guidance
  data/                 Shared product data types
.claude/                Agent instructions, validation scripts, and templates
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build the full site:

```bash
pnpm build
```

Build only the Astro web app:

```bash
pnpm --dir apps/web run build
```

Run Astro checks for the web app:

```bash
pnpm --dir apps/web astro check
```

## Adding or updating tools

Tool pages are data-driven. Start with metadata, then add interactivity only when needed.

1. Update tool metadata in [`apps/web/src/data/apps.ts`](./apps/web/src/data/apps.ts).
2. Add React code under `apps/web/src/tools/{slug}` for interactive tools.
3. Register the tool in `apps/web/src/components/tools/ToolMount.astro`.
4. Keep title, description, FAQ, limitations, privacy copy, and structured data aligned.
5. Keep canonical URLs on `/apps/{slug}/`.

## SEO assets

The deployed site is expected to expose:

- https://smallwebapps.com/robots.txt
- https://smallwebapps.com/sitemap-index.xml
- https://smallwebapps.com/llms.txt
- https://smallwebapps.com/apps/

After deployment, submit `https://smallwebapps.com/sitemap-index.xml` in Google Search Console and inspect priority pages such as:

- https://smallwebapps.com/
- https://smallwebapps.com/apps/
- https://smallwebapps.com/apps/json-formatter/
- https://smallwebapps.com/apps/pdf-compress/
- https://smallwebapps.com/apps/image-optimize/
- https://smallwebapps.com/apps/ai-image-checker/

## Public listing copy

Short description:

```text
Free browser-based utilities for PDF, image, developer, SEO, data, and YouTube workflows. No account required.
```

Long description:

```text
Small Web Apps is a collection of free browser-based tools for common PDF, image, developer, SEO, data, and YouTube tasks. It includes utilities like JSON Formatter, PDF Compressor, Image Optimizer, AI Image Checker, JWT Decoder, Base64 Encoder, QR Code Generator, Word Counter, Keyword Density Checker, Meta Tags Analyzer, and Open Graph Checker. The site is built to be fast, simple, and privacy-conscious, with many workflows running locally in the browser and no account required for normal use.
```

Tags:

```text
web tools, online tools, browser tools, developer tools, pdf tools, image tools, seo tools, data tools, youtube tools, json formatter, pdf compressor, image optimizer, ai image checker, keyword density checker, meta tags analyzer, open graph checker, privacy-first, no signup, free tools
```

## Security and local files

Do not commit secrets or deployment credentials. The repository ignores `.env` and `.env.*` files.

Useful checks before publishing or deploying:

```bash
rg --files -uuu -g '.env' -g '.env.*' -g '!node_modules' -g '!apps/web/dist' -g '!.git'
rg -n -i "(api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret)"
```

Audit output directories are ignored:

- `.audit-tmp/`
- `smallwebapps.com-audit/`

## Deployment

Production deployment uses Cloudflare Pages.

- Production domain: https://smallwebapps.com
- Cloudflare Pages project: `smallwebapps`
- Build command: `pnpm build`
- Output directory: `apps/web/dist`

Do not deploy from automation or agent work unless deployment is explicitly requested.

## Agent instructions

`CLAUDE.md` is the canonical instruction file for agents working in this repository. `AGENTS.md` points to it. The old `CODEX.md` redirect file was removed to avoid duplicate agent entrypoints.

## License

This repository is licensed under the [MIT License](./LICENSE).