# Hidaayah — Your Quranic Guidance Companion

Hidaayah (هداية) is a spiritual companion app that connects your daily emotions and struggles to relevant Quranic verses. Share what's on your heart, read the Quran in a clean Mushaf experience, save reflections, and track your spiritual journey over time.

## Features

- **Seek Guidance** — Describe your current state and receive Quranic verses tailored to your situation via semantic search
- **Read the Quran** — A focused Mushaf experience with translation, transliteration, and tafsir
- **Reflect & Journal** — Write and save reflections tied to specific verses, powered by Quran Reflect
- **Theme Collections** — Curated verse collections on patience, gratitude, trust, hope, and more
- **Streak Tracking** — Track your daily reading streak and personal milestones
- **Profile** — View your stats, saved verses, and reflection history

## Tech Stack

- [Next.js 15](https://nextjs.org/) — App Router, Server Components
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Quran Foundation APIs](https://api-docs.quran.foundation/) — Quran content, search, user auth, streaks, bookmarks
- [Quran Reflect API](https://quranreflect.com/) — User reflections and lessons feed

## Getting Started

```bash
git clone https://github.com/your-username/hidaayah.git
cd hidaayah
yarn
yarn dev
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
# User Auth — Pre-Production OAuth client
NEXT_PUBLIC_QF_CLIENT_ID=
QF_CLIENT_SECRET=
NEXT_PUBLIC_QF_OAUTH_BASE_URL=https://prelive-oauth2.quran.foundation
NEXT_PUBLIC_QF_OAUTH_REDIRECT_URI=http://localhost:3000/callback

# Content APIs — Production client (Quran verses, audio, tafsir)
QF_CONTENT_CLIENT_ID=
QF_CONTENT_CLIENT_SECRET=

# Base URLs
NEXT_PUBLIC_QF_CONTENT_BASE_URL=https://apis.quran.foundation/content/api/v4
NEXT_PUBLIC_QF_AUTH_BASE_URL=https://apis-prelive.quran.foundation/auth
NEXT_PUBLIC_QF_SEARCH_BASE_URL=https://apis.quran.foundation/search
NEXT_PUBLIC_QF_REFLECT_BASE_URL=https://apis-prelive.quran.foundation/quran-reflect
```

API credentials can be requested from [Quran Foundation](https://quran.foundation).

## Scripts

```bash
yarn dev           # Run in development mode
yarn build         # Production build
yarn start         # Start production server
yarn lint          # ESLint check
yarn lint-fix      # ESLint fix
yarn format        # Format with Prettier
yarn check-types   # TypeScript type check
yarn test-all      # Format + lint + types + build
```
