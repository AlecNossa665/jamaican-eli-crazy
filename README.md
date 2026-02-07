# Jamaican Eli Crazy

A Next.js web app boilerplate with **Supabase**, **Tailwind CSS**, **shadcn/ui**, and **Notion/Apple-inspired** design primitives.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui (new-york style)
- **Backend:** Supabase (auth + database via `@supabase/ssr`)
- **Fonts:** Geist (sans + mono)
- **Design:** Notion/Apple-inspired tokens (soft neutrals, rounded corners, subtle shadows)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` — from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same place (anon/public key)

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure (conventions)

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout, metadata, fonts
│   ├── page.tsx        # Home page
│   └── globals.css     # Tailwind + theme (Notion/Apple tokens)
├── components/
│   └── ui/             # shadcn components
├── lib/
│   ├── supabase/       # Supabase client (browser), server, middleware
│   └── utils.ts        # cn() etc.
```

## Landing page: save name to Supabase

The landing form saves the entered name to a `names` table. Create it once in your project:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the migration: copy and execute the contents of `supabase/migrations/001_create_names_table.sql`.

This creates the `names` table and an RLS policy that allows anonymous inserts.

## Supabase usage

- **Client Components:** `import { createClient } from "@/lib/supabase/client"`
- **Server Components / Actions / Route Handlers:** `import { createClient } from "@/lib/supabase/server"` (use `await createClient()`)
- **Middleware:** Session refresh is handled in `middleware.ts` via `updateSession`.

Always use `supabase.auth.getUser()` (or `getClaims()`) for server-side auth checks, not `getSession()`.

## Adding shadcn components

```bash
npx shadcn@latest add <component-name>
```

Example: `npx shadcn@latest add dialog dropdown-menu`

## Scripts

| Command       | Description          |
|--------------|----------------------|
| `npm run dev`   | Start dev server     |
| `npm run build` | Production build     |
| `npm run start` | Start production     |
| `npm run lint`  | Run ESLint           |

## Design tokens

Theme variables live in `src/app/globals.css`:

- **Light:** Soft off-white background, neutral grays, `--radius: 0.75rem`
- **Dark:** `.dark` class on `<html>` (e.g. via a theme provider)
- **Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg` for cards and overlays

You can switch to dark mode by adding a theme provider and toggling the `dark` class on the root.
