# Small Web Apps

Free browser-based utilities for PDF, image, developer, data, and YouTube workflows.

Website: https://smallwebapps.com
Tools directory: https://smallwebapps.com/apps/

Small Web Apps is built as a fast, static-first product hub. Tool pages are designed to be indexable, useful without JavaScript where possible, and clear about privacy and limitations.

## Popular tools

- JSON Formatter: https://smallwebapps.com/apps/json-formatter/
- PDF Compressor: https://smallwebapps.com/apps/pdf-compress/
- Compress PDF to 100KB: https://smallwebapps.com/apps/compress-pdf-to-100kb/
- Image Optimizer: https://smallwebapps.com/apps/image-optimize/
- AI Image Checker: https://smallwebapps.com/apps/ai-image-checker/
- Password Generator: https://smallwebapps.com/apps/password-generator/
- QR Code Generator: https://smallwebapps.com/apps/qr-code-generator/
- JWT Decoder: https://smallwebapps.com/apps/jwt-decoder/
- Base64 Encoder: https://smallwebapps.com/apps/base64-encoder/
- Keyword Density Checker: https://smallwebapps.com/apps/keyword-density-checker/

## Product model

- `smallwebapps.com` is the canonical production domain.
- `/apps/[slug]/` is the canonical URL pattern for tool pages.
- Interactive tools run inside the main hub when they are ready.
- Most workflows are browser-first, with privacy and limitations documented on tool pages.

## Repository layout

```text
apps/
  web/                  Astro site shell, SEO pages, and embedded tools
  tubetrace/            Imported Vite + React TubeTrace app source
packages/
  config/               Shared config guidance and base TypeScript settings
  data/                 Shared product data types for app metadata
```

## Stack

- Astro
- TypeScript
- Tailwind CSS
- React islands for embedded tools
- Static-first build for Cloudflare Pages

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the local dev server:

```bash
pnpm dev
```

Build the site:

```bash
pnpm build
```

Build only the web app:

```bash
pnpm --dir apps/web run build
```

## Adding a new app

1. Add app metadata in [`apps/web/src/data/apps.ts`](./apps/web/src/data/apps.ts).
2. If the app is interactive, add its implementation under `apps/web/src/tools/{slug}`.
3. Register interactive tools in `apps/web/src/components/tools/ToolMount.astro`.
4. Keep metadata, FAQ, visible content, limitations, privacy copy, and schema aligned.
5. Avoid manual ad slots inside the core tool workflow.

## SEO and discovery

The site includes static SEO assets for search engines and AI crawlers:

- `robots.txt`
- `sitemap-index.xml`
- `llms.txt`
- structured data on home, app directory, and tool pages

After deployment, submit `https://smallwebapps.com/sitemap-index.xml` in Google Search Console and inspect a few important URLs such as the home page, `/apps/`, JSON Formatter, PDF Compressor, Image Optimizer, and AI Image Checker.

## Security and environment files

Do not commit local secrets or deployment credentials. The repository ignores `.env` and `.env.*` files by default.

Before making the repository public or committing deployment changes, check for secrets:

```bash
rg --files -uuu -g '.env' -g '.env.*' -g '!node_modules' -g '!apps/web/dist' -g '!.git'
rg -n -i "(api[_-]?key|secret|token|password|private[_-]?key|client[_-]?secret)"
```

## Deployment

The production target is a single Cloudflare Pages project.

- Production domain: https://smallwebapps.com
- Repository: https://github.com/LucasHenriqueDiniz/smallwebapps
- Build command: `pnpm build`
- Output directory: `apps/web/dist`

Deploy only after validating the build and SEO essentials.

## License

This repository is licensed under the [MIT License](./LICENSE).

## Agent files

- `CLAUDE.md` contains the canonical repository instructions.
- `AGENTS.md` and `CODEX.md` redirect to `CLAUDE.md`.
