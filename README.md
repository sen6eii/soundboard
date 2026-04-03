# 🎛 Soundboard — Music Moodboards

A moodboard tool for producers and musicians. Collect audio references, YouTube links, and sonic inspirations organized by project.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

Then open http://localhost:3000

## Deploy to Vercel (free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts. Your app will be live at a `.vercel.app` URL in ~1 minute.

## Features

- **Boards** — Create one per project (beat, canción, EP, etc.)
- **Audio references** — Upload MP3/WAV/FLAC, plays with waveform visualization
- **Link references** — Paste YouTube or SoundCloud URLs, shows thumbnail + timestamp notes
- **Mood tags** — Tag references: DARK, ENERGETIC, CHILL, ETHEREAL, AGGRESSIVE, MELANCHOLIC, HYPNOTIC, RAW, CINEMATIC, GROOVY, MINIMAL, CHAOTIC
- **Filter by tag** — See only the references with a specific mood
- **Notes** — Add a text note explaining what you like about each reference
- **Persistent** — Everything saves in your browser's localStorage

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- WaveSurfer.js (waveform rendering)
- localStorage (no database needed for prototype)

## Structure

```
app/
  page.tsx              # Home — board list
  board/[id]/page.tsx   # Board view — moodboard
components/
  ReferenceCard.tsx     # Individual reference card
  AddReferenceModal.tsx # Modal to add audio or link
  CreateBoardModal.tsx  # Modal to create a board
  WaveformPlayer.tsx    # Audio player with waveform
  MoodTag.tsx           # Tag pill + tag selector
lib/
  types.ts              # TypeScript types
  store.ts              # localStorage CRUD
```
