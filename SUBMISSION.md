# Hidaayah — Quran Foundation Hackathon Submission

---

## Project Title

**Hidaayah** — _Guidance through the Quran_

---

## Team Members

- **Aqib Akinyele**
- **Muhammad Ajuwon**

---

## Short Description

Hidaayah is a full-stack web application that helps Muslims engage deeply with the Quran through personalized, emotion-driven guidance, an immersive Mushaf reading experience, voice-enabled reflection journaling, and community recitation circles — all powered by the Quran Foundation API suite.

---

## Detailed Explanation

### The Problem

Millions of Muslims want a meaningful daily relationship with the Quran but struggle to bridge the gap between reading the text and understanding how it speaks to their specific life situations. Existing apps offer reading tools but rarely connect a person's current emotional state to relevant Quranic verses. Reflection is even more rarely built in.

### The Solution

Hidaayah treats the Quran as a living guide. It starts by asking: _how are you feeling right now?_ — and then uses the Quran Foundation's semantic search to surface verses that speak directly to that moment. Every feature then reinforces that experience: read the verse in a beautiful Mushaf, listen to its recitation, bookmark it, write a note on it, save a personal reflection, track your daily reading streak, and join community circles to recite together.

---

## Features Implemented

### 1. Emotion-Driven Guidance (`/dashboard/guidance`)

The core innovation of the app. Users select or type an emotion (Anxious, Grateful, Lost, Hopeful, Struggling, Peaceful) and optionally describe their situation in free text or **by speaking into the microphone** (Web Speech API). The app uses the QF Search API's semantic search to retrieve the top 5 relevant verses, deduplicated by surah, so the user sees diverse guidance rather than 5 verses from Al-Baqarah.

Each guidance result includes:

- The Arabic text rendered in the user's selected font
- An English translation
- Ibn Kathir tafsir (loaded on demand via Content API)
- Inline audio playback for the verse
- Bookmark action (saved to QF User API)
- A personal reflection textarea that posts to QF Reflect API (`/v1/posts`) with the verse as a reference
- Navigation between all 5 candidates (Previous / Next verse)

**Component:** [components/guidance-experience.tsx](components/guidance-experience.tsx)  
**Page:** [app/(app)/dashboard/guidance/page.tsx](<app/(app)/dashboard/guidance/page.tsx>)  
**Voice input component:** [components/emotion-input.tsx](components/emotion-input.tsx)

---

### 2. Immersive Mushaf Page View (`/dashboard/quran` → Mushaf mode)

A full digital recreation of the printed Quran page experience.

**Reading:**

- 604 Mushaf pages rendered using the official QCF v2 per-page Unicode fonts, loaded dynamically via the FontFace API from `verses.quran.foundation/fonts`
- Three Arabic scripts: Madani QCF (exact Medina Mushaf), Uthmani Unicode, IndoPak Nastaleeq
- Three page themes: Cream, White, Dark — matching the printed feel
- Three font size options (Small / Medium / Large) with **auto-fit**: the font size is computed from the container height divided by number of lines × line-height ratio, so Arabic text always fills the page with no whitespace
- Surah name banners rendered between surahs on multi-surah pages, with gold-tinted decorative borders and corner ornaments matching the Mushaf aesthetic
- Fullscreen maximize/minimize toggle (covers entire viewport)

**Navigation:**

- Swipe right = next page, swipe left = previous page (RTL Mushaf convention)
- Hover-to-reveal arrow buttons (left = next, right = previous)
- Jump to any Juz or Hizb via dropdown selectors
- Page counter display (Arabic: صفحة N)

**Audio:**

- Verse-by-verse recitation with **continuous playback across pages** — when the last verse on a page finishes, the player automatically turns to the next page and resumes playing from the first verse of that page without stopping
- Tap any word to start playing from that verse
- Skip forward/back between verses on the page
- Mute toggle
- Reciter selector — filtered to only verse-level reciters from `/resources/recitations`, ensuring every listed reciter has valid per-ayah audio (non-Quran entries from the chapter reciters list are excluded)

**Component:** [components/mushaf-page-view.tsx](components/mushaf-page-view.tsx)

---

### 3. Translation Reader (`/dashboard/quran` → Translation mode)

A surah-by-surah reading experience with translation, transliteration, and per-verse tools.

- Loads verses 50 at a time with "Load more" pagination
- Three Arabic fonts (QPC Hafs, Uthmani, IndoPak) + font size slider (5 levels)
- Transliteration toggle
- **Per-verse bookmarking** — creates/deletes bookmarks via QF User API (`/v1/bookmarks`)
- **Per-verse notes** — full CRUD (create, edit, delete) synced to QF User API (`/v1/notes`)
- **Per-verse audio** — tap Play on any verse to jump playback to that verse; audio auto-advances to the next verse on `onEnded`
- Tafsir toggle (Ibn Kathir English, loaded from QF Content API)
- Footnote popups for superscripts in translations (fetched from `/foot_notes/:id`)
- **Reading session tracking** — IntersectionObserver records visible verse keys; a debounced call updates the user's last reading position via `/v1/reading-sessions`; activity seconds are flushed every 10s to `/v1/activity-days` with merged verse ranges
- Preferences persistence — on mount, loads the user's saved font scale, font choice, and reciter from QF User API `/v1/preferences`; debounced save on every settings change

**Component:** [components/quran-reader.tsx](components/quran-reader.tsx)

---

### 4. Quran Navigation Formats

Users can browse the Quran by Surah, Juz, Hizb, Page, or Reciters — each surfacing a different structural view.

- **Surah list** — all 114 chapters with name, revelation place, verse count; jump selectors for Juz and Hizb
- **Juz view** — lists all 30 Juz with their verse mappings
- **Hizb view** — lists all 60 Hizb
- **Page view** — grid of all 604 pages; clicking any opens Mushaf mode at that page
- **Reciters view** — full directory of all chapter reciters from `/resources/chapter_reciters`, showing each reciter's name, recitation style (Murattal / Mujawwad / Muallim), and qirat; tap any reciter to expand a surah picker, then play that reciter's full-chapter audio via `/chapter_recitations/:id/:chapter`; searchable by name; live "Playing" badge on the active reciter

**Page:** [app/(app)/dashboard/quran/page.tsx](<app/(app)/dashboard/quran/page.tsx>)  
**Components:** [components/surah-list.tsx](components/surah-list.tsx), [components/recitation-juz-view.tsx](components/recitation-juz-view.tsx), [components/recitation-hizb-view.tsx](components/recitation-hizb-view.tsx), [components/recitation-page-view.tsx](components/recitation-page-view.tsx), [components/reciters-browser.tsx](components/reciters-browser.tsx)

---

### 5. Reflections Journal (`/dashboard/reflections`)

A personal spiritual journal powered by the QF Reflect API.

**Notes tab:**

- All verse notes written during Quran reading, displayed with verse references
- Each note links back to that verse in the reader (`/dashboard/quran?verse=X:Y`)
- Delete notes; cursor-based pagination ("Load more")

**Reflections tab:**

- Full journal of all posts published to QF Reflect API (`/v1/posts`)
- Create new reflection with optional verse reference (e.g. `2:255`) and public/draft toggle
- Edit and delete existing reflections inline
- Like and Save (bookmark) reactions synced to QF Reflect API
- Comments count and view count display
- Tags and recent comment shown on expanded posts
- Date-grouped display (Today / Yesterday / dates)
- Search filter across all reflections
- Reading streak display (days)

**Page:** [app/(app)/dashboard/reflections/page.tsx](<app/(app)/dashboard/reflections/page.tsx>)

---

### 6. Recitation Circles (`/dashboard/circles`)

Community live-recitation rooms powered by QF Reflect Rooms API.

- Browse open rooms with live participant count
- Search rooms by name with **room type filter** (All / Groups / Pages)
- Create new rooms (name, description, type)
- Join rooms by invite code
- View room details: participant avatars, description, recitation progress

**Component:** [components/recitation-rooms.tsx](components/recitation-rooms.tsx)

---

### 7. Goals & Progress Tracking (`/dashboard/goals`)

Daily Quran engagement goals backed by QF User API.

- Three goal types: Pages per day (`QURAN_PAGES`), Minutes per day (`QURAN_TIME`), Verse range (`QURAN_RANGE`)
- Create, edit, and delete goals
- Daily plan progress displayed as a progress bar (0–100%)
- Goal completion estimate preview — shows a multi-day schedule for completing a target
- Goals summary shown on the home dashboard ("3 / 5 complete")

**Page:** [app/(app)/dashboard/goals/page.tsx](<app/(app)/dashboard/goals/page.tsx>)

---

### 8. Thematic Collections (`/dashboard/collections`)

Curated verse collections by theme (Mercy, Patience, Gratitude, etc.).

- Browse all available collections from QF Content API
- Open any collection to see all member verses with Arabic text, translation, and tafsir
- Each verse links back to the reader for full context

**Page:** [app/(app)/dashboard/collections/page.tsx](<app/(app)/dashboard/collections/page.tsx>)

---

### 9. Bookmarks (`/dashboard/bookmarks`)

A single view of all verses the user has bookmarked across the app, with direct links back to the reader.

---

### 10. Home Dashboard (`/dashboard`)

An at-a-glance summary of the user's Quran engagement:

- **Daily streak** (QF User API)
- **Reflection count** (QF Reflect API)
- **Saved verses count** (QF User API bookmarks)
- **Resume reading** — links back to exact verse from last reading session
- **Today's goals** summary (done / total)
- **Verse of the moment** — random ayah with Arabic text, translation, and inline audio playback
- **Quick action grid** — Seek Guidance, Read Quran, Reflections, Collections
- **Notes count** summary

**Page:** [app/(app)/dashboard/page.tsx](<app/(app)/dashboard/page.tsx>)

---

### 11. Profile & Settings (`/dashboard/profile`)

- Display name, username, bio, country (ISO 3166-1 alpha-2 dropdown), verified badge, followers count, join year
- Edit profile fields synced to QF Reflect API (`/v1/profile`)
- Country stored as ISO code; displayed using `Intl.DisplayNames` for human-readable names
- Followers list for the logged-in user
- Reading streak card with activity history

**Pages:** [app/(app)/dashboard/profile/page.tsx](<app/(app)/dashboard/profile/page.tsx>), [app/(app)/dashboard/profile/[tab]/page.tsx](<app/(app)/dashboard/profile/%5Btab%5D/page.tsx>)

---

### 12. Authentication

Full OAuth2 PKCE flow using QF's OAuth2 server.

- Login / Signup pages with QF OAuth2 redirect
- Callback page handles authorization code exchange, stores access token in `localStorage`, refresh token in an `httpOnly` cookie
- Auto-refresh: Axios response interceptors on `userApi` and `reflectApi` instances automatically retry failed requests after refreshing the access token; on refresh failure the session is cleared and the user is redirected to login
- Prelive environment: the proxy at `/api/qf/[...path]` routes `/auth` → QF User API and `/reflect` → QF Reflect API so third-party browser origins blocked on prelive never see a request

**Files:** [app/api/auth/token/route.ts](app/api/auth/token/route.ts), [app/api/qf/[...path]/route.ts](app/api/qf/%5B...path%5D/route.ts), [app/apiService/quranFoundationService/index.ts](app/apiService/quranFoundationService/index.ts), [components/auth-provider.tsx](components/auth-provider.tsx)

---

## QF APIs Used

| API                                         | Endpoints                                                                                                                                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content API** (`/content/api/v4`)         | chapters, verses by chapter/juz/page/key, verse audio files, `/resources/recitations` (verse reciters), `/resources/chapter_reciters` (chapter reciters with style/qirat), `/chapter_recitations/:id/:chapter` (full chapter audio), tafsirs, foot notes, pages, juzs, hizbs, random ayah, collections, bookmarks, notes, reading sessions, activity days, preferences |
| **Search API**                              | `/search` — semantic search by emotion/situation text                                                                                                                                                    |
| **User API** (proxied `/api/qf/auth`)       | `/v1/users/me`, `/v1/bookmarks`, `/v1/notes`, `/v1/reading-sessions`, `/v1/activity-days`, `/v1/goals`, `/v1/goal-plans`, `/v1/streaks`, `/v1/preferences`                                               |
| **Reflect API** (proxied `/api/qf/reflect`) | `/v1/profile`, `/v1/posts`, `/v1/posts/:id/like`, `/v1/posts/:id/save`, `/v1/notes`, `/v1/rooms`, `/v1/rooms/search`, `/v1/rooms/:id/join`                                                               |

**Total unique endpoints used: 90+**

---

## Technical Stack

| Layer      | Technology                                                                          |
| ---------- | ----------------------------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router)                                                             |
| Language   | TypeScript (strict)                                                                 |
| Styling    | Tailwind CSS v4 + shadcn/ui (Radix UI primitives)                                   |
| Animation  | Framer Motion                                                                       |
| HTTP       | Axios (4 instances: content, user, reflect, search)                                 |
| Auth       | OAuth2 PKCE + httpOnly refresh cookie                                               |
| Fonts      | QCF v2 per-page fonts, QPCHafs, IndoPak Nastaleeq, Amiri (dynamic FontFace loading) |
| PWA        | next-pwa (installable, offline shell)                                               |
| Deployment | Vercel                                                                              |

### Notable Technical Decisions

**Server-side proxy for third-party blocked origins.** QF's prelive API blocks cross-origin browser requests. All user-authenticated and reflect API calls go through Next.js API routes (`/api/qf/auth/[...path]` and `/api/qf/reflect/[...path]`) which add the correct headers server-side.

**Per-page QCF font loading.** The Medina Mushaf font is split across 604 page-specific `.woff2` files. The app pre-loads the current page font and the adjacent page font using the FontFace API before rendering, preventing flash of unstyled text.

**Auto-fit Arabic text.** The Mushaf container has a fixed aspect ratio (1:1.41 — A4 proportions). Font size is computed dynamically as `(containerHeight - padding) / (lineCount × lineHeightRatio)`, capped at the user's size preference, so Arabic text always fills the page with no whitespace.

**Continuous audio across Mushaf pages.** When the last verse on a page finishes playing, the component stores a `pendingPlayRef` sentinel, increments the page, and suppresses the normal `isPlaying=false` reset. When the new page's audio files load, the sentinel is consumed and playback begins immediately on the first verse of the new page — no interruption.

**Semantic search deduplication.** The QF search returns many verses from the same surah. The guidance engine deduplicates candidates by surah number before presenting them, ensuring the user sees up to 5 different surahs, not 5 verses from Al-Baqarah.

**Token coalescing.** Each of the four token types (content, user, reflect, search) uses an in-flight promise cache so parallel requests during cold start share a single token fetch instead of triggering multiple OAuth calls.

**Dual reciter ID spaces.** The QF Content API exposes two distinct reciter lists with incompatible ID spaces: `/resources/recitations` (ayah-by-ayah, used by `/recitations/:id/by_chapter/:chapter`) and `/resources/chapter_reciters` (full-chapter audio, used by `/chapter_recitations/:id/:chapter`). The Mushaf and Translation readers filter to only verse-level recitation IDs so every listed option has valid per-ayah audio. The new Reciters browse tab uses the chapter reciters list and plays full-surah audio, surfacing the richer metadata (style, qirat) that endpoint provides.

**Accessibility.** All action buttons have `aria-label`, `aria-pressed` (toggles), and `aria-expanded` (collapsibles). Focus rings are applied via a `.focus-ring` utility class. A `prefers-reduced-motion: reduce` block in `globals.css` collapses all CSS transitions and animations to near-instant for users who need it.

---

## Live Demo

**URL:** https://hidaayah-chi.vercel.app

---

## GitHub Repository

_(private — available on request)_

---

## Demo Video Script (2–3 minutes)

Suggested walkthrough for the demo video:

1. **(0:00–0:20) Home screen** — show the greeting, streak, saved verses, and "verse of the moment" with inline audio playback

2. **(0:20–0:50) Emotion-driven guidance** — tap "Seek Guidance", speak into the microphone ("I'm feeling anxious about a big decision"), watch the search results come in, see the Arabic verse with audio, expand the tafsir, write a short reflection, save it

3. **(0:50–1:30) Mushaf reader** — open the Quran, switch to Mushaf mode, swipe through a few pages, show the surah banner appearing, tap a word to start audio, let it play through to the end of the page and auto-advance to the next page, toggle fullscreen

4. **(1:30–1:50) Translation reader** — switch to Translation mode, open a verse's notes panel, add a note, show it appear in the journal

5. **(1:50–2:10) Reflections journal** — open Reflections, show Notes tab with verse-linked notes, switch to Reflections tab, show date-grouped posts with like/save actions

6. **(2:10–2:30) Goals & Profile** — quick look at Goals page with progress bars; open Profile to show streak, followers, bio, country

7. **(2:30–2:40) Reciters** — open the Reciters tab, search for a reciter, expand to pick a surah, tap Play to stream the full chapter — show the style/qirat badge and the live "Playing" indicator

8. **(2:40–2:55) Circles** — show the recitation rooms search with room-type filter
