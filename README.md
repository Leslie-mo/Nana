# Pet Digital Twin / Nana

Nana is not just a standard pet profile, but a dynamic digital life that continuously grows from daily behavior, photos, and shared experiences. It forms its own memories and holds conversations from a pet's first-person perspective.

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system. If you are using the portable Node.js setup:

```powershell
# Set portable Node path
$env:PATH = 'C:\Users\YueqiuchiY1\.node-portable;' + $env:PATH
```

### Installation

```bash
npm install
```

### Run Local Development Server

Create `.env.local` with your Gemini API key:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_DEMO_MODE=false
```

Set `NEXT_PUBLIC_DEMO_MODE=true` for a stable Hackathon demo mode. In demo mode, Nana skips Gemini chat calls and replies from local memory with local reaction assets.

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. The interface is mobile-first; on desktop browsers, it centers and displays within a mobile mockup container with a maximum width of 430px.

### Production Build

```bash
npm run build
npm start
```

## Key Pages & Features

- **Home**: Main digital twin dashboard, daily behavior summary, emotional states, and AI health/behavior discoveries.
- **Memory**: A Google Photos-style timeline documenting important memories and milestones.
- **Ask Nana**: Chat interface backed by Gemini API, where the pet responds based on historical behavior and memories in first-person, rather than generic AI conversation.
- **Personality**: A 5-dimensional personality radar chart showing character progression and the evolving personality type.
- **Life Replay**: Annual highlight recap, AI summary, and simulated memory video replay.
- **AI Avatar Create**: Upload a photo or use the camera, send it through Gemini Vision, produce a stable avatar design spec, and preview an animated digital twin.

*Note: The app supports language switching (Chinese, English, Japanese) at the top-right corner. The demonstration data is loaded from [mockData.ts](file:///c:/Users/YueqiuchiY1/Desktop/Nana/Nana%20pj/src/data/mockData.ts) and localization strings are managed in [messages.ts](file:///c:/Users/YueqiuchiY1/Desktop/Nana/Nana%20pj/src/i18n/messages.ts).*

## Project Directory Structure

```text
src/
  app/             Next.js App Router and global styles
  components/      App Shell, navigation, and page components
  data/            Mock data used for demonstrations
  i18n/            Localization dictionaries (CN/EN/JP)
  lib/gemini.ts    Gemini API helpers and local fallback flows
  types/           TypeScript type definitions
public/images/     Visual assets for Nana's moments and UI
public/nana-frames/ Expected local fallback frame sequence directory
```

## Gemini Integration

The app now uses Gemini in two places:

- `src/app/api/chat/route.ts` calls Gemini API for real first-person Nana chat.
- `src/app/api/generate-avatar/route.ts` accepts an uploaded pet image and calls Gemini Vision through `generatePetAvatarFromImage(imageFile, locale)`.

The avatar generation flow currently works like this:

1. The user uploads or captures Nana's photo.
2. The frontend posts the image to `/api/generate-avatar`; the API key stays server-side in `process.env.GEMINI_API_KEY`.
3. Gemini Vision analyzes the photo and returns a structured avatar spec, including species, breed guess, body shape, face shape, eye color, fur colors, special marks, `avatarPrompt`, and `animationPrompt`.
4. The UI displays the generated spec and uses local generated reaction assets for the visible avatar and animation.

For the Hackathon demo, the app does not call Imagen, Veo, or any image/video generation API. Gemini controls text, mood, action, `mediaKey`, and suggested posts. The actual reaction images and frame animations are local PNG files under `public/reaction/`, surfaced in the UI as AI generated reactions.

If Gemini returns quota exceeded, rate limit, 429, or resource exhausted, chat falls back to local Nana memory mode and shows a small notice instead of exposing the raw API error.

Local reaction assets live under `public/reaction/`, including profile images, emotions, animation frames, scenes, and post-ready images. Older fallback frame names under `public/nana-frames/` are still safe to keep, but the demo UI now prefers `public/reaction/`.

```text
idle-1.png
idle-2.png
idle-3.png
idle-4.png
blink-1.png
blink-2.png
blink-3.png
wave-1.png
wave-2.png
wave-3.png
wave-4.png
jump-1.png
jump-2.png
jump-3.png
jump-4.png
```

If those frames are missing or fail to load, `AnimatedPetAvatar` gracefully falls back to the uploaded/source avatar image with CSS breathing, floating, and click-bounce animation.

### Future Architecture

- **Real Image Generation**: Use the Gemini-generated `avatarPrompt` with Imagen to create a clean, consistent mascot image.
- **Real Video/Frame Generation**: Use the Gemini-generated `animationPrompt` with Veo or a frame generation pipeline to create idle, blink, wave, and jump sequences.
- **Data Persistence**: Store avatar specs, source photos, generated frames, behavior vector embeddings, and summaries in Firebase through Vertex AI.
- **Context Retrieval**: Retrieve the pet's profile, habits, and timeline context during chat sessions to generate highly customized first-person responses.

## Assets & Images

The mock scene graphics for Nana were generated using built-in image tools, with the final composite asset located at `public/images/nana-moments.png`.

