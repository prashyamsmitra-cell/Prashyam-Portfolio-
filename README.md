# PRASHYAM — Portfolio v2

Personal portfolio site. Next.js 15 · TypeScript · Tailwind v4 · Framer Motion.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding Project Images

Replace the placeholder panels in the **Exploits** section by swapping the image paths in `app/page.tsx`:

```ts
const projects = [
  {
    id: "caresync",
    image: "/your-caresync-screenshot.png",  // ← add your image here
    ...
  },
  ...
]
```

Drop image files into the `public/` folder and reference them as `/filename.ext`.

## Structure

```
app/
  page.tsx       — all sections (Hero, Projects, Journey, Spoils, Contact, About)
  layout.tsx     — fonts, metadata, viewport
  globals.css    — design tokens, component styles, scroll animations
  api/contact/   — contact form endpoint (configure your email service here)
public/
  *.jpg / *.png  — static assets; drop project screenshots here
components/ui/   — shadcn/ui primitives (unused in main page, available for extensions)
```

## Deployment

Push to GitHub and connect to [Vercel](https://vercel.com) — zero-config deployment.

## What Changed vs v1

- **Project cards now visible**: removed conflicting `opacity:0` CSS that fought Framer Motion, rewrote all reveal logic with `useInView` hooks.
- **Scroll progress bar**: thin line at top tracks reading position.
- **Custom cursor dot**: red trailing dot on desktop.
- **Counter animation**: stats in hero count up when scrolled into view.
- **Project image placeholders**: tasteful hatched panels ready for screenshots.
- **Animated card line**: top border sweeps left→right on hover for each project and achievement card.
- **Social link fill**: inverted fill animation on contact links.
- **Parallax**: project image panels have subtle scroll-driven Y offset via `useScroll + useTransform`.
- **Timeline company names**: now accented in red for visual hierarchy.
- **`viewport` export**: moved from page to `layout.tsx` to fix Next.js 15 warning.
- **Metadata title**: updated to reflect actual name/role.
