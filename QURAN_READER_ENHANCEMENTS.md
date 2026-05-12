# Quran Reader Enhancement Implementation Plan

## ✅ COMPLETED

1. **Garden Responsive Design** - Garden canvas now uses aspect-ratio and preserveAspectRatio="xMidYMid meet" for proper mobile display
2. **Audio Listening Blooms Flowers** - Already implemented in gardenTracking.ts (audio_listen activity adds flowers)

## 🔨 TO IMPLEMENT

### 1. Audio Player Enhancements

**Location**: `components/quran-reader.tsx` or verse audio components

- Add play/pause toggle for any verse (not just from beginning)
- When clicking play on a verse mid-surah, it should toggle to pause
- Pause button should work from any verse position
- Track currently playing verse and show pause icon

### 2. Verse Sharing Feature

**Location**: New component `components/verse-share.tsx`

- Share button on each verse card
- Generate image with:
  - Arabic text
  - Translation
  - Verse reference (Surah:Ayah)
  - App branding/logo
  - Beautiful gradient background
- Share options:
  - Copy link
  - Download image
  - Share via Web Share API (mobile)
- Link format: `https://hidaayah.app/verse/2:255`

### 3. Surah Navigation

**Location**: `components/quran-reader.tsx`

- Detect when reaching end of surah
- Auto-load next surah on next page
- Show transition UI: "End of Surah X - Continue to Surah Y?"
- Smooth pagination between surahs

### 4. Juz & Hizb View Redesign

**Location**: `components/recitation-juz-view.tsx` and `components/recitation-hizb-view.tsx`

**Remove**: Percentage completion bars

**Add**: Page-based navigation similar to Surah view

- **Desktop**: Vertical list of pages (Page 1, Page 2, ... Page 604)
- **Mobile**: Grid of page boxes (5 columns × 6 rows = 30 pages per view)
- Each page shows: Page number + first verse reference
- Click page → opens Mushaf view at that page

### 5. Last Recitation Tracking

**Location**: New file `lib/recitationTracking.ts`

**Track**:

- Last read Surah (surah number, ayah, timestamp)
- Last read Juz (juz number, page, timestamp)
- Last read Hizb (hizb number, page, timestamp)
- Last read Page (page number, timestamp)

**Storage**: localStorage key `hidaayah_last_recitations`

**Display on Homepage**:

- "Continue Reading" card
- Shows last 4 recitation types
- Quick resume buttons

### 6. Remove "Load More" - Load All Verses

**Location**: `components/quran-reader.tsx`

- Remove pagination/load more button
- Load entire surah at once
- Use virtualization if performance issues (react-window or react-virtual)
- Show loading skeleton while fetching

### 7. Companion Overlay Improvements

**Location**: `components/CompanionOverlay.tsx`

**Changes**:

- Hide overlay when on `/dashboard/companion` page
- Make overlay draggable/movable
- Add position controls (left, right, bottom-left, bottom-right)
- Save position preference in localStorage
- Smooth animations when moving

## Implementation Priority

1. ✅ Garden responsive (DONE)
2. ✅ Audio blooms flowers (DONE)
3. Audio player toggle (HIGH)
4. Verse sharing (HIGH)
5. Last recitation tracking (HIGH)
6. Remove load more (MEDIUM)
7. Juz/Hizb redesign (MEDIUM)
8. Surah auto-continue (MEDIUM)
9. Companion overlay improvements (LOW)

## Files to Modify

- `components/quran-reader.tsx`
- `components/verse-card.tsx`
- `components/recitation-juz-view.tsx`
- `components/recitation-hizb-view.tsx`
- `components/CompanionOverlay.tsx`
- `app/(app)/dashboard/page.tsx` (homepage)
- `lib/recitationTracking.ts` (NEW)
- `components/verse-share.tsx` (NEW)
