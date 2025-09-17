# Astro Portfolio & Blog Architecture

## Overview

- Astro-powered personal site that combines a landing page, a blog fed by Markdown content collections, and light client-side enhancements.
- Pages are rendered server-first and enhanced as needed via scoped scripts (e.g. blog filters, contact form) instead of a single-page React bundle.
- Tailwind CSS with DaisyUI themes provides styling tokens, while custom scripts preserve theme selection across the app.

## Tech Stack

- **Astro** for routing, server-side rendering, and component composition.
- **TypeScript + Astro Content Collections** for typed Markdown frontmatter and data access.
- **Tailwind CSS & DaisyUI** (configured in `src/assets/app.css` and `tailwind.config.cjs`) for design tokens and ready-made UI primitives.
- **Plain browser APIs** for interactivity (Clipboard API, IntersectionObserver, Fetch, localStorage) with zero React runtime on most routes.

## Directory Map

- `src/pages/` – route-driven `.astro` files. Each file becomes a page; folders like `blog/` host listing and dynamic detail routes.
- `src/layouts/Layout.astro` – shared HTML shell that imports global styles, sets meta tags, and initialises theme state before first paint.
- `src/components/` – reusable UI blocks (`Hero`, `About`, `BlogPreview`, `Contact`, `Toolbar`, etc.) that the pages assemble.
- `src/content/` – Markdown blog posts plus `config.ts`, which defines the schema exposed through `getCollection('blog')`.
- `src/utils/url.ts` – helper to prefix paths with the site `BASE_URL`, ensuring portable links across environments.
- `public/` – static assets copied verbatim to the output (favicons, downloadable résumé, etc.).
- `src/assets/app.css` – Tailwind entry point that also registers custom DaisyUI themes and global prose tweaks.

## Rendering Flow

1. **Layout bootstrap**: Every page wraps content inside `Layout.astro`, which runs theme initialisation scripts (persisting `data-theme` in `localStorage`) and injects the optional `Toolbar` for mobile/desktop theme switching.
2. **Homepage (`src/pages/index.astro`)**: Composes `Hero`, `About`, `BlogPreview`, and `Contact` components. Each component is mostly static HTML sprinkled with Tailwind utility classes.
3. **Blog index (`src/pages/blog/index.astro`)**: Fetches all blog entries, filters/sorts them on the server for the initial render, and emits a JSON payload for the client. A small inline script powers search, tag filtering, debounced input handling, and URL/querystring sync without leaving the page.
4. **Blog detail (`src/pages/blog/[...slug].astro`)**: Uses Astro’s content collections to locate the matching Markdown file, renders the compiled `Content`, and enriches the article with reading-time calculation, a generated table of contents, clipboard sharing, and previous/next navigation.
5. **Contact component**: Renders social buttons and a collapsible contact form. An inline script expands/collapses the form with height animations, posts data to `PUBLIC_CONTACT_ENDPOINT`, updates status messages, and handles Turnstile tokens.

## Content Workflow

- Blog posts live under `src/content/blog/*.md`. Frontmatter must match the schema in `src/content/config.ts` (title, pubDate, optional description/tags/draft flags).
- Astro automatically types the entries; `getCollection('blog')` returns `CollectionEntry<'blog'>[]`, giving components full TypeScript hints.
- Draft posts (`draft: true`) are skipped by home/blog list queries but still routable in dev, mirroring typical CMS behaviour.

## Styling & Theming

- Tailwind is invoked via `@import "tailwindcss"` inside `src/assets/app.css`, with DaisyUI providing component classes and a set of custom themes (`light`, `dark`, `dim`, `retro`, `luxury`).
- `Layout.astro` inlines a script to detect stored or preferred color schemes and applies them before the body becomes visible, preventing a flash of the wrong theme.
- The `Toolbar` component (and a duplicate dropdown in `Hero`) drives theme changes by updating `localStorage` and toggling DaisyUI radio inputs.

## Client Enhancements

- **Blog search**: Inline TypeScript in `blog/index.astro` consumes the pre-rendered JSON payload, rebuilds the card grid in place, and keeps the history state in sync with current filters.
- **Table of contents**: Detail pages parse Markdown headings, slugify them, and leverage `IntersectionObserver` to highlight the active section while injecting permalink anchors.
- **Clipboard**: Contact and blog components rely on the Clipboard API with graceful fallbacks for browsers without direct access.
- **Contact form**: Submits JSON via `fetch` and toggles UI feedback states (`btn-success`, `btn-error`) based on response.

## Configuration & Environment

- `PUBLIC_CONTACT_ENDPOINT` (exposed via `import.meta.env`) defines where the contact form posts. A default Cloudflare Worker URL keeps the component functional if the env var is absent.
- `tailwind.config.cjs` registers DaisyUI and the typography plugin. Update the `content` glob if you add new file types that emit class names.

## Development Commands

- `npm install` – install dependencies.
- `npm run dev` – start the local dev server at `http://localhost:4321`.
- `npm run build` – build the production site into `dist/`.
- `npm run preview` – run a local server against the production build.

## Astro vs. React (SPA) Comparison

| Aspect | Astro implementation | Typical React SPA |
| --- | --- | --- |
| Rendering model | Server-first HTML with per-component hydration opt-in; most components ship zero client JS. | Client-side rendered bundle hydrates the entire app after initial load. |
| Routing | Files in `src/pages/` map directly to routes (including dynamic `[...slug]` segments). | `react-router` (or similar) defines routes in code; build creates a single `index.html`. |
| Data loading | `getCollection()` and frontmatter pulled at build time; props are synchronous within `.astro` files. | Data fetched at runtime (e.g. `useEffect`/`fetch`) or via frameworks (Next.js, Remix) with server components. |
| Component format | `.astro` files mix HTML-like templates, frontmatter scripts, and lightweight JSX islands as needed; islands can host React, Svelte, etc. | `.tsx`/`.jsx` components executed entirely in the browser (unless paired with SSR tooling). |
| State management | Scoped scripts use browser APIs; no global state unless an island introduces it. | React hooks (`useState`, `useReducer`) manage state across components; global stores often needed for cross-app data. |
| Asset bundling | Astro bundles only hydrated islands and shared CSS; static HTML stays static. | Bundler ships the full React runtime plus route/component JS even for static areas. |
| Theming | Achieved with DOM attributes (`data-theme`) and plain scripts before hydration. | Typically managed via React context or CSS variables inside components. |

> Astro can still embed React components (Astro “islands”) where granular interactivity is needed. In this project, all interactivity is handled with small vanilla scripts instead, keeping the payload light.

## Extending the Site

- Add a new blog post: create `src/content/blog/my-post.md` with schema-compliant frontmatter; it will appear automatically in the listings once `draft: false` and `pubDate` is set.
- Introduce a new section: build a component in `src/components/` and import it inside the appropriate page or layout.
- Need richer interactivity? You can author a React component and hydrate it via `<Island component={MyReactComponent} client:load />` inside an `.astro` file, but prefer vanilla scripts for small enhancements to preserve Astro’s performance benefits.
