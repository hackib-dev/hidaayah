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

### 2. Public Landing Page (`/`)

A fully animated marketing landing page for first-time visitors — no login required.

- **Hero section** — headline, animated Arabic calligraphy, and CTA buttons (Get Started / Sign In)
- **Problem section** — floating emotional keywords (anxiety, emptiness, restlessness…) with an animated Quranic verse reveal on scroll
- **AI Guidance section** — live interactive demo of the emotion-to-verse flow: click a feeling prompt, watch the input type character-by-character, and see the colour-coded verse response appear — all client-side with no API call, so any visitor can experience the product before signing up. Response panel stays open when switching between prompts (no close/reopen flash). In light mode all response card backgrounds use theme-aware `rgba()` tints so text remains legible
- **AI Companion section** — marketing callouts (Contextual Wisdom, Emotional Intelligence, Always Learning) with a live Three.js animated 3D orb rendered via custom GLSL vertex/fragment shaders; the orb breathes, pulses, and adapts its colour palette to light/dark mode in real time
- **CTA section** — final sign-up prompt

**Page:** [app/page.tsx](app/page.tsx)  
**Components:** [components/HeroSection.tsx](components/HeroSection.tsx), [components/ProblemSection.tsx](components/ProblemSection.tsx), [components/AIGuidanceSection.tsx](components/AIGuidanceSection.tsx), [components/AICompanionSection.tsx](components/AICompanionSection.tsx), [components/CTASection.tsx](components/CTASection.tsx)

---

### 3. Immersive Mushaf Page View (`/dashboard/quran` → Mushaf mode)

A full digital recreation of the printed Quran page experience.

**Reading:**

- 604 Mushaf pages rendered using the official QCF v2 per-page Unicode fonts, loaded dynamically via the FontFace API from `verses.quran.foundation/fonts`
- **Four Arabic scripts:** Madani QCF (exact Medina Mushaf), Uthmani Unicode, IndoPak Nastaleeq, and **Tajweed** — colour-coded tajweed rules rendered from the QF Content API's `/quran/verses/uthmani_tajweed` endpoint; each rule class (`qalaqah`, `ikhfa`, `idgham_ghunnah`, `iqlab`, `izhaar`, `madda_*`, etc.) is styled with a distinct colour via CSS selectors on the `<tajweed>` HTML tags returned by the API. Colours are lightened automatically in dark mode so they remain legible on dark backgrounds
- **Tajweed colour key legend** — a sticky sidebar panel lists every rule with its colour dot, name, and plain-English description; visible on desktop whenever Tajweed font is active
- Three page themes: Cream, White, Dark — matching the printed feel
- Three font size options (Small / Medium / Large) with **auto-fit**: the font size is computed from the container height divided by number of lines × line-height ratio, so Arabic text always fills the page with no whitespace
- Surah name banners rendered between surahs on multi-surah pages, with gold-tinted decorative borders and corner ornaments matching the Mushaf aesthetic
- **Page bookmark** — bookmark any Mushaf page via QF User API; bookmarked state is loaded on page change and persists across sessions
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

### 4. Translation Reader (`/dashboard/quran` → Translation mode)

A surah-by-surah reading experience with translation, transliteration, and per-verse tools.

- Loads verses 50 at a time with "Load more" pagination
- **Four Arabic fonts:** QPC Hafs, Uthmani, IndoPak, and **Tajweed** — same colour-coded tajweed rendering as the Mushaf view, fetched from `/quran/verses/uthmani_tajweed` and cached per surah
- **Tajweed colour key legend** — sticky sidebar panel on desktop, visible whenever Tajweed font is selected; disappears when switching to another font
- Font size slider (5 levels)
- Transliteration toggle
- **Surah navigation arrows** — left/right chevrons on the surah header card let users jump to the previous or next surah without returning to the surah list. Arrows follow RTL convention (left = next surah, right = previous)
- **Per-verse bookmarking** — creates/deletes bookmarks via QF User API (`/v1/bookmarks`)
- **Per-verse notes** — full CRUD (create, edit, delete) synced to QF User API (`/v1/notes`)
- **Per-verse audio** — tap Play on any verse to jump playback to that verse; audio auto-advances to the next verse on `onEnded`
- Tafsir toggle (Ibn Kathir English, loaded from QF Content API)
- Footnote popups for superscripts in translations (fetched from `/foot_notes/:id`)
- **Reading session tracking** — IntersectionObserver records visible verse keys; a debounced call updates the user's last reading position via `/v1/reading-sessions`; activity seconds are flushed every 10s to `/v1/activity-days` with merged verse ranges
- Preferences persistence — on mount, loads the user's saved font scale, font choice, and reciter from QF User API `/v1/preferences`; debounced save on every settings change

**Component:** [components/quran-reader.tsx](components/quran-reader.tsx)

---

### 5. Quran Companion (Floating Chat Assistant)

A persistent floating chat panel available on every page of the authenticated app — mounted in the root layout so it survives navigation.

**How it works:**

- Rule-based intent engine (`lib/companion-engine.ts`) — no LLM, no external AI API. The user's message is parsed with regex and a 200+ entry surah-name lookup table to classify intent, then a live QF API call is made to fulfil it. Responses are formatted text returned synchronously from the engine
- Arabic segments in responses are automatically detected and rendered RTL in a block with the Arabic font, while English prose renders normally — no manual tagging required

**Supported intents:**

| Intent                | Example                                          | What happens                                                                                           |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Open specific verse   | "Show me 2:255" or "Ayat al-Kursi"               | Fetches verse via `/verses/by_key/:key`, returns Arabic + translation + inline "Open in reader →" link |
| Surah info            | "Tell me about Al-Kahf"                          | Fetches chapter metadata + first verse                                                                 |
| Tafsir lookup         | "Tafsir of Ad-Duha"                              | Fetches Ibn Kathir tafsir for that verse                                                               |
| Semantic search       | "Find verses about patience" / "I am struggling" | Hits QF Search API, returns top result                                                                 |
| Random ayah           | "Surprise me"                                    | Calls `/verses/random`, returns a random verse                                                         |
| Juz / Hizb navigation | "Open Juz 30"                                    | Returns summary + "Open Juz 30 →" deep link                                                            |
| Reciter lookup        | "Find Mishari Alafasy"                           | Deep links to the Reciters tab filtered to that name                                                   |

**Navigation integration:**

- Every response that references a verse, surah, juz, hizb, page, or reciter shows a clickable "Open in reader →" / "Read surah →" link
- Clicking dispatches a `quran-companion-navigate` custom DOM event; the Quran page listens for it and navigates to the correct view, verse, and mode without a full page reload

**UX:**

- Floating action button (bottom-right) with a Sparkles icon; opens an animated slide-up panel
- Suggestion chips on first open: "Show me Ayat al-Kursi", "Find verses about patience", "Surprise me with a random ayah", etc.
- Auto-scroll to latest message; auto-focus input on open
- Typing indicator (animated dots) while the engine resolves
- Supports multi-line input (Shift+Enter for newline, Enter to send)

**Component:** [components/quran-companion.tsx](components/quran-companion.tsx)  
**Engine:** [lib/companion-engine.ts](lib/companion-engine.ts)

---

### 6. Quran Navigation Formats

Users can browse the Quran by Surah, Juz, Hizb, Page, or Reciters — each surfacing a different structural view.

- **Surah list** — all 114 chapters with name, revelation place, verse count; jump selectors for Juz and Hizb
- **Juz view** — lists all 30 Juz with their verse mappings
- **Hizb view** — lists all 60 Hizb
- **Page view** — grid of all 604 pages; clicking any opens Mushaf mode at that page
- **Reciters view** — full directory of all chapter reciters from `/resources/chapter_reciters`, showing each reciter's name, recitation style (Murattal / Mujawwad / Muallim), and qirat; tap any reciter to expand a surah picker, then play that reciter's full-chapter audio via `/chapter_recitations/:id/:chapter`; searchable by name; live "Playing" badge on the active reciter

**Page:** [app/(app)/dashboard/quran/page.tsx](<app/(app)/dashboard/quran/page.tsx>)  
**Components:** [components/surah-list.tsx](components/surah-list.tsx), [components/recitation-juz-view.tsx](components/recitation-juz-view.tsx), [components/recitation-hizb-view.tsx](components/recitation-hizb-view.tsx), [components/recitation-page-view.tsx](components/recitation-page-view.tsx), [components/reciters-browser.tsx](components/reciters-browser.tsx)

---

### 7. Quran Garden (`/dashboard/garden`)

A gamified XP and progression system that grows a visual garden as the user engages with the Quran.

**XP system:**

- Two actions earn XP: reading a unique Mushaf page (+10 XP) and expanding tafsir (+8 XP)
- Pages are deduplicated via a persisted Set — revisiting the same page never re-awards XP
- 20 levels with non-linear XP thresholds (60 XP for level 2 up to 12 000 XP for level 20)
- An XP toast notification animates up from the bottom of the screen whenever XP is earned

**Garden progression:**

- The SVG garden scene evolves through 4 visual stages based on total XP (stage 2 at 300 XP, stage 3 at 1 000 XP, stage 4 at 3 000 XP)
- 12 unlockable garden elements tied to milestones: first flowers, rich grass, first tree, pathway, wisdom tree (10 tafsirs read), stream, birds, fruit tree, glowing path (30 tafsirs), rare flowers, waterfall, and golden light (all 604 pages read)
- Garden "vitality" — a health percentage based on weekly XP that determines how lush and saturated the scene looks; an inactive week dims the garden
- Floating particle animations, stage-specific sky gradients, and soft SVG filters

**Stats panel:**

- Total XP, weekly XP, current level with XP-to-next-level bar
- Garden stage badge and unlocked element count
- Streak days and last activity date

**State:** fully client-side, persisted to `localStorage` under `hidaayah_garden_v2`

**Page:** [app/(app)/dashboard/garden/page.tsx](<app/(app)/dashboard/garden/page.tsx>)  
**Component:** [components/quran-garden.tsx](components/quran-garden.tsx)  
**Engine:** [lib/garden.ts](lib/garden.ts)

---

### 8. Reflections Journal (`/dashboard/reflections`)

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

### 9. Recitation Circles (`/dashboard/circles`)

Community live-recitation rooms powered by QF Reflect Rooms API.

- Browse open rooms with live participant count
- Search rooms by name with **room type filter** (All / Groups / Pages)
- Create new rooms (name, description, type)
- Join rooms by invite code
- View room details: participant avatars, description, recitation progress

**Component:** [components/recitation-rooms.tsx](components/recitation-rooms.tsx)

---

### 10. Goals & Progress Tracking (`/dashboard/goals`)

Daily Quran engagement goals backed by QF User API.

- Three goal types: Pages per day (`QURAN_PAGES`), Minutes per day (`QURAN_TIME`), Verse range (`QURAN_RANGE`)
- Create, edit, and delete goals
- Daily plan progress displayed as a progress bar (0–100%)
- Goal completion estimate preview — shows a multi-day schedule for completing a target
- Goals summary shown on the home dashboard ("3 / 5 complete")

**Page:** [app/(app)/dashboard/goals/page.tsx](<app/(app)/dashboard/goals/page.tsx>)

---

### 11. Thematic Collections (`/dashboard/collections`)

Curated verse collections by theme (Mercy, Patience, Gratitude, etc.).

- Browse all available collections from QF Content API
- Open any collection to see all member verses with Arabic text, translation, and tafsir
- Each verse links back to the reader for full context

**Page:** [app/(app)/dashboard/collections/page.tsx](<app/(app)/dashboard/collections/page.tsx>)

---

### 12. Bookmarks (`/dashboard/bookmarks`)

A single view of all verses the user has bookmarked across the app, with direct links back to the reader.

---

### 13. Home Dashboard (`/dashboard`)

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

### 14. Profile & Settings (`/dashboard/profile`)

- Display name, username, bio, country (ISO 3166-1 alpha-2 dropdown), verified badge, followers count, join year
- Edit profile fields synced to QF Reflect API (`/v1/profile`)
- Country stored as ISO code; displayed using `Intl.DisplayNames` for human-readable names
- Followers list for the logged-in user
- Reading streak card with activity history

**Pages:** [app/(app)/dashboard/profile/page.tsx](<app/(app)/dashboard/profile/page.tsx>), [app/(app)/dashboard/profile/[tab]/page.tsx](<app/(app)/dashboard/profile/%5Btab%5D/page.tsx>)

---

### 15. Authentication

Full OAuth2 PKCE flow using QF's OAuth2 server.

- Login / Signup pages with QF OAuth2 redirect
- Callback page handles authorization code exchange, stores access token in `localStorage`, refresh token in an `httpOnly` cookie
- Auto-refresh: Axios response interceptors on `userApi` and `reflectApi` instances automatically retry failed requests after refreshing the access token; on refresh failure the session is cleared and the user is redirected to login
- Prelive environment: the proxy at `/api/qf/[...path]` routes `/auth` → QF User API and `/reflect` → QF Reflect API so third-party browser origins blocked on prelive never see a request

**Files:** [app/api/auth/token/route.ts](app/api/auth/token/route.ts), [app/api/qf/[...path]/route.ts](app/api/qf/%5B...path%5D/route.ts), [app/apiService/quranFoundationService/index.ts](app/apiService/quranFoundationService/index.ts), [components/auth-provider.tsx](components/auth-provider.tsx)

---

## QF APIs Used

### Content API (`/content/api/v4`) — 20 endpoints

| Endpoint                                          | Used by                                             |
| ------------------------------------------------- | --------------------------------------------------- |
| `GET /chapters`                                   | Surah list                                          |
| `GET /chapters/:id`                               | Reader surah header, Companion                      |
| `GET /verses/by_chapter/:chapter`                 | Translation reader                                  |
| `GET /verses/by_page/:page`                       | Mushaf page view                                    |
| `GET /verses/by_juz/:juz`                         | Juz view                                            |
| `GET /verses/by_key/:key`                         | Companion (show verse), guidance                    |
| `GET /verses/random`                              | Home "verse of the moment", Companion "surprise me" |
| `GET /quran/verses/uthmani_tajweed`               | Tajweed colour-coded font (Translation & Mushaf)    |
| `GET /resources/recitations`                      | Mushaf & Translation reciter selector               |
| `GET /resources/chapter_reciters`                 | Reciters browser tab                                |
| `GET /recitations/:reciterId/by_chapter/:chapter` | Per-ayah audio in Mushaf & Translation readers      |
| `GET /chapter_recitations/:reciterId/:chapter`    | Full-chapter audio in Reciters tab                  |
| `GET /resources/tafsirs`                          | Tafsir panel (list available tafsir books)          |
| `GET /tafsirs/:id/by_chapter/:chapter`            | Tafsir panel in Translation reader                  |
| `GET /tafsirs/:id/by_ayah/:key`                   | Guidance tafsir, Companion tafsir intent            |
| `GET /pages`                                      | Page navigation view (all 604 pages grid)           |
| `GET /pages/lookup`                               | Resolve verse key → mushaf page number              |
| `GET /juzs`                                       | Juz list & jump selectors                           |
| `GET /hizbs`                                      | Hizb list & jump selectors                          |
| `GET /collections` / `GET /collections/:id`       | Thematic collections browse & detail                |

### Search API — 1 endpoint

| Endpoint         | Used by                                            |
| ---------------- | -------------------------------------------------- |
| `GET /v1/search` | Emotion-driven guidance, Companion semantic search |

### User API (proxied via `/api/qf/auth`) — 18 endpoints

| Endpoint                        | Used by                                       |
| ------------------------------- | --------------------------------------------- |
| `GET /v1/bookmarks`             | Bookmarks page, reader bookmark state         |
| `POST /v1/bookmarks`            | Bookmark verse (reader, guidance)             |
| `DELETE /v1/bookmarks/:id`      | Remove bookmark                               |
| `GET /v1/notes`                 | Reflections journal Notes tab                 |
| `POST /v1/notes`                | Add verse note in reader                      |
| `PATCH /v1/notes/:id`           | Edit note                                     |
| `DELETE /v1/notes/:id`          | Delete note                                   |
| `POST /v1/reading-sessions`     | Track reading position (IntersectionObserver) |
| `POST /v1/activity-days`        | Flush activity seconds every 10s              |
| `GET /v1/goals`                 | Goals page, home dashboard summary            |
| `POST /v1/goals`                | Create goal                                   |
| `PUT /v1/goals/:id`             | Edit goal                                     |
| `DELETE /v1/goals/:id`          | Delete goal                                   |
| `GET /v1/goals/estimate`        | Goal completion estimate preview              |
| `GET /v1/goals/get-todays-plan` | Home dashboard today's goal progress          |
| `GET /v1/streaks`               | Home dashboard streak, profile streak card    |
| `GET /v1/preferences`           | Load saved font/scale/reciter on reader mount |
| `POST /v1/preferences/bulk`     | Save font/scale/reciter preference changes    |

### Reflect API (proxied via `/api/qf/reflect`) — 26 endpoints

| Endpoint                            | Used by                               |
| ----------------------------------- | ------------------------------------- |
| `GET /v1/users/profile`             | Profile page                          |
| `PUT /v1/users/profile`             | Edit profile                          |
| `GET /v1/users/:id`                 | View other user profiles              |
| `GET /v1/users/search`              | User search                           |
| `POST /v1/users/:id/toggle-follow`  | Follow / unfollow                     |
| `GET /v1/users/:id/followers`       | Followers list                        |
| `GET /v1/users/:id/following`       | Following list                        |
| `GET /v1/posts/my-posts`            | Reflections journal tab               |
| `POST /v1/posts`                    | Create reflection (journal, guidance) |
| `PUT /v1/posts/:id`                 | Edit reflection                       |
| `DELETE /v1/posts/:id`              | Delete reflection                     |
| `POST /v1/posts/:id/toggle-like`    | Like reflection                       |
| `POST /v1/posts/:id/toggle-save`    | Save reflection                       |
| `POST /v1/posts/:id/views`          | Record post view                      |
| `GET /v1/posts/:id/comments`        | View comments                         |
| `POST /v1/comments`                 | Add comment                           |
| `POST /v1/comments/:id/toggle-like` | Like comment                          |
| `GET /v1/rooms/joined-rooms`        | Circles — my rooms                    |
| `GET /v1/rooms/managed-rooms`       | Circles — rooms I manage              |
| `GET /v1/rooms/search`              | Circles search                        |
| `GET /v1/rooms/:id`                 | Room detail                           |
| `GET /v1/rooms/:id/members`         | Room members list                     |
| `GET /v1/rooms/:id/posts`           | Room feed                             |
| `POST /v1/rooms/groups`             | Create circle                         |
| `POST /v1/rooms/:id/invite`         | Invite member                         |
| `POST /v1/rooms/:id/join`           | Join room                             |

### OAuth2 — 2 endpoints

| Endpoint             | Used by                                     |
| -------------------- | ------------------------------------------- |
| `GET /oauth2/auth`   | Login / Signup redirect                     |
| `POST /oauth2/token` | Authorization code exchange + token refresh |

---

**Total confirmed active endpoints: 67**  
(20 Content API + 1 Search + 18 User API + 26 Reflect API + 2 OAuth)

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

**Rule-based companion with zero LLM dependency.** The Quran Companion resolves all queries locally using regex intent parsing and a hand-coded 200+ entry surah-name table, then makes a single targeted QF API call. This means zero latency from model inference, no API key, and responses that are always factually grounded in QF data — the companion can't hallucinate a verse that doesn't exist because it fetches the real one.

**Companion navigation via custom DOM events.** The companion is mounted in the root layout (outside the Quran page's React tree). To navigate the Quran page without prop drilling or a global store, the companion dispatches a `quran-companion-navigate` custom DOM event with the target encoded in `detail`. The Quran page listens for this event and handles the navigation internally — clean decoupling with no shared state.

**Tajweed rendering via native HTML tags.** The QF tajweed endpoint returns Arabic text with custom `<tajweed class="rule_name">` tags. Rather than parsing and converting them, the app renders the HTML directly with `dangerouslySetInnerHTML` inside a `.tajweed-text` parent and targets each rule with CSS attribute selectors (`.tajweed-text tajweed[class='qalaqah'] { color: … }`). Dark mode overrides are applied via `.dark .tajweed-text …` selectors, boosting dark-navy blues and dark reds to legible lighter variants. The tajweed map is fetched once per surah (Translation view) or once per chapter-per-page (Mushaf view) and cached in component state.

**Tajweed legend stays fixed while content scrolls.** The colour-key legend panel uses `sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto` so it pins to the top of the viewport and never scrolls out of view even on long surahs.

**Gamified garden with deduplication.** The XP engine stores every Mushaf page number that has already been read in a persisted `readPages` Set. Award calls for those page numbers are silently no-ops, preventing farming. The same approach is not applied to tafsir (since re-reading tafsir has genuine learning value) but a separate `awardedVersesRef` in the reader prevents double-awarding within a single session.

**RTL-aware surah navigation.** Surah navigation arrows in the Translation reader follow RTL convention: the left chevron advances to the next surah (higher number) and the right chevron goes back — matching the direction Arabic Quran text flows and consistent with the Mushaf page-turn arrows.

**Landing page AI guidance demo.** The public landing page's AI Guidance section simulates the full guidance UX (emotion selection → typing animation → verse response) entirely client-side with no API call. The response panel is always visible once triggered — switching between prompts swaps content with a crossfade using `AnimatePresence mode="wait"` keyed on `displayedIndex`, with no close/reopen flash between selections.

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

1. **(0:00–0:15) Landing page** — scroll through the public landing page, show the floating emotional words, the Quranic verse reveal, and click through the AI Guidance demo section

2. **(0:15–0:30) Home screen** — after sign-in, show the greeting, streak, saved verses, "verse of the moment" with inline audio playback, and the quick-action grid

3. **(0:30–1:00) Emotion-driven guidance** — tap "Seek Guidance", speak into the microphone ("I'm feeling anxious about a big decision"), watch the search results come in, see the Arabic verse with audio, expand the tafsir, write a short reflection, save it

4. **(1:00–1:10) Quran Companion** — tap the floating Sparkles button, type "Show me Ayat al-Kursi", watch it fetch the verse and show the "Open in reader →" link, tap it to navigate directly to 2:255

5. **(1:10–1:50) Mushaf reader** — open the Quran, switch to Mushaf mode, swipe through a few pages, show the surah banner appearing, tap a word to start audio, let it play through to the end of the page and auto-advance to the next page, switch to Tajweed font and show the colour-coded text with the legend panel on the right, toggle fullscreen

6. **(1:50–2:10) Translation reader** — switch to Translation mode, use the surah navigation arrows to move between surahs, switch to Tajweed font, show the legend, open a verse's notes panel and add a note

7. **(2:10–2:25) Quran Garden** — open the Garden page, show the SVG scene at its current stage, point out unlocked elements, and the XP / level / vitality stats

8. **(2:25–2:40) Reflections journal** — open Reflections, show Notes tab with verse-linked notes, switch to Reflections tab, show date-grouped posts with like/save actions

9. **(2:40–2:50) Goals & Profile** — quick look at Goals page with progress bars; open Profile to show streak, followers, bio, country

10. **(2:50–3:00) Reciters** — open the Reciters tab, search for a reciter, expand to pick a surah, tap Play to stream the full chapter — show the style/qirat badge and the live "Playing" indicator

11. **(3:00–3:10) Circles** — show the recitation rooms search with room-type filter
