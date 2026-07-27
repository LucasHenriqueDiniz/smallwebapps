# Small Web Apps

> Free, fast, private browser tools for everyday PDF, image, developer, data, and YouTube tasks.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Website](https://img.shields.io/badge/website-smallwebapps.com-green.svg)](https://smallwebapps.com)
[![Tools](https://img.shields.io/badge/tools-136%2B-brightgreen.svg)](https://smallwebapps.com/apps)

**Website:** [smallwebapps.com](https://smallwebapps.com)  
**All Tools:** [smallwebapps.com/apps](https://smallwebapps.com/apps)

---

## ✨ Why Small Web Apps?

No uploads. No accounts. No servers. Every tool runs **entirely in your browser** with **zero data leaving your device**.

- ⚡ **Instant** — load and use immediately
- 🔒 **Private** — nothing sent to servers
- 📴 **Offline** — works without internet
- 🎯 **Focused** — one job, done well
- 🆓 **Forever free** — no ads, no paywalls

---

## 🛠️ Featured Tools

**Developer**  
JSON Formatter · JWT Decoder · Base64 Encoder · Regex Tester · URL Encoder · Hash Generator

**PDF**  
Compressor · Merge · Split · Extract Text · Rotate · Watermark · Metadata Editor

**Images**  
Optimizer · Resizer · Cropper · Format Converter · Color Picker · Favicon Generator

**Data**  
CSV Cleaner · Word Counter · Keyword Density Checker · Meta Tags Analyzer · Open Graph Checker

**YouTube**  
Watch History Analyzer · Chapter Generator · Tag Extractor · Title Counter

**Text & More**  
Case Converter · Line Sorter · Password Generator · Unit Converter · Timestamp Converter · Age Calculator

[→ Browse all 136+ tools](https://smallwebapps.com/apps)

---

## 🏗️ Architecture

A lightweight, **content-first** monorepo optimized for speed, SEO, and privacy:

- **Astro** — static pages, routing, metadata, sitemaps
- **React** — interactive tool islands (hydrated on-demand)
- **TypeScript** — type-safe tools and metadata
- **Tailwind CSS** — responsive design with CSS variables for dark mode
- **Cloudflare Pages** — CDN-fast static hosting

Each tool is a self-contained React component; the site renders SEO-optimized pages via Astro, hydrating only the tool UI when needed.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10+

### Development

```bash
# Install dependencies
pnpm install

# Start dev server (Astro on port 4321 by default)
pnpm dev

# Full monorepo build
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm check
```

### Project Structure

```
smallwebapps/
├── apps/
│   └── web/                          # Main Astro site
│       ├── src/
│       │   ├── pages/                # Routes (landing, /apps/[slug], etc)
│       │   ├── tools/                # React tool implementations
│       │   ├── components/           # Astro + React shared UI
│       │   ├── data/apps.ts          # Tool metadata (single source of truth)
│       │   └── styles/               # Global CSS + design tokens
│       └── astro.config.mjs
├── packages/
│   └── data/                         # Shared TypeScript types
└── scripts/
    └── prepare-tubetrace-embed.mjs   # YouTube analysis tool setup
```

### Adding a Tool

1. **Define metadata** in [`apps/web/src/data/apps.ts`](./apps/web/src/data/apps.ts):
   ```typescript
   {
     slug: "my-tool",
     name: "My Tool",
     category: "Developer Tools",
     shortDescription: "Brief description",
     longDescription: "Full description shown on tool page",
     features: ["Feature 1", "Feature 2"],
     faq: [{ question: "Q?", answer: "A." }],
     content: { howToUse: ["Step 1", "Step 2"] },
   }
   ```

2. **Create React component** at `apps/web/src/tools/my-tool/MyToolApp.tsx`

3. **Register** in [`apps/web/src/components/tools/ToolMount.astro`](./apps/web/src/components/tools/ToolMount.astro):
   ```tsx
   {slug === "my-tool" && <MyToolApp client:load />}
   ```

That's it—the site auto-generates the page with metadata, breadcrumbs, FAQ, and related tools.

---

## 📦 Deployment

**Production:** https://smallwebapps.com (Cloudflare Pages)

### Deploy to Cloudflare Pages

```bash
pnpm run deploy:cloudflare
```

This runs `pnpm build` then deploys `apps/web/dist` to the `smallwebapps` Pages project.

---

## 📝 License

MIT © 2024 [Lucas Diniz](https://github.com/LucasHenriqueDiniz)

See [LICENSE](./LICENSE) for the full text.

---

## 🤝 Contributing

Found a bug or have a feature idea? [Open an issue](https://github.com/LucasHenriqueDiniz/smallwebapps/issues) or submit a pull request.

---

## 📖 More Info

- **Privacy Policy:** https://smallwebapps.com/privacy
- **Terms of Service:** https://smallwebapps.com/terms
- **Contact:** https://smallwebapps.com/contact
