# Small Web Apps

Free browser-based tools for everyday PDF, image, developer, data, and YouTube tasks.

**Website:** https://smallwebapps.com  
**Tools:** https://smallwebapps.com/apps/  
**GitHub:** https://github.com/LucasHenriqueDiniz/smallwebapps

---

## What is this?

Small Web Apps is a collection of **136+ free, browser-based utilities** designed for privacy, speed, and simplicity. No accounts, no uploads, no servers. Tools run locally in your browser.

Core principles:
- Fast static pages
- Clear tool descriptions before interacting
- Useful pages even without JavaScript
- Privacy and limitation notes
- Internal links between related tools

---

## Featured tools

**Developer:** JSON Formatter, JWT Decoder, Base64 Encoder, Regex Tester, CSV Cleaner  
**PDF:** Compressor, Extract Text, Merge, Split, Rotate, Watermark  
**Images:** Optimizer, Resize, Crop, Metadata, Format Converter  
**Data:** Word Counter, Keyword Density, Meta Tags Analyzer, Open Graph Checker  
**YouTube:** Watch History Analyzer, Chapter Generator, Tag Extractor

Full list: https://smallwebapps.com/apps/

---

## Technology

- **Astro** — static pages, routing, SEO metadata
- **React** — interactive tool islands (client-side hydration)
- **TypeScript** — type safety for apps and metadata
- **Tailwind CSS** — styling with CSS variables for dark mode
- **Cloudflare Pages** — static hosting and deployment

---

## Development

Install and run:

```bash
pnpm install
pnpm dev              # Development server
pnpm build            # Full build
pnpm --dir apps/web run build  # Astro build only
```

Edit tool metadata: [`apps/web/src/data/apps.ts`](./apps/web/src/data/apps.ts)  
Add interactive tools: `apps/web/src/tools/{slug}/`  
Register tools: [`apps/web/src/components/tools/ToolMount.astro`](./apps/web/src/components/tools/ToolMount.astro)

---

## Deployment

Production: **https://smallwebapps.com** (Cloudflare Pages)

- Build command: `pnpm build`
- Output directory: `apps/web/dist`

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
