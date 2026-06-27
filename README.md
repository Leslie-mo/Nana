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
- **Ask Nana**: Chat interface where the pet responds based on historical behavior and memories in first-person, rather than generic AI conversation.
- **Personality**: A 5-dimensional personality radar chart showing character progression and the evolving personality type.
- **Life Replay**: Annual highlight recap, AI summary, and simulated memory video replay.
- **AI Avatar Create**: Upload a photo or use the camera to preview and generate an interactive digital twin of Nana that floats, breathes, and blinks.

*Note: The app supports language switching (Chinese, English, Japanese) at the top-right corner. The demonstration data is loaded from [mockData.ts](file:///c:/Users/YueqiuchiY1/Desktop/Nana/Nana%20pj/src/data/mockData.ts) and localization strings are managed in [messages.ts](file:///c:/Users/YueqiuchiY1/Desktop/Nana/Nana%20pj/src/i18n/messages.ts).*

## Project Directory Structure

```text
src/
  app/             Next.js App Router and global styles
  components/      App Shell, navigation, and page components
  data/            Mock data used for demonstrations
  i18n/            Localization dictionaries (CN/EN/JP)
  lib/gemini.ts    Mock service boundaries for Gemini API
  types/           TypeScript type definitions
public/images/     Visual assets for Nana's moments and UI
```

## Gemini Integration Plan

The [gemini.ts](file:///c:/Users/YueqiuchiY1/Desktop/Nana/Nana%20pj/src/lib/gemini.ts) file reserves placeholders for the following service functions:

- `analyzePetImage`
- `summarizePetDay`
- `generatePetPersonality`
- `chatWithPetMemory`
- `generateLifeReplay`

### Future Architecture:
- **Multimodal Understanding**: Use Gemini multimodal capabilities to analyze photos and videos.
- **Data Persistence**: Store structured events, behavior vector embeddings, and summarizations in Firebase through Vertex AI.
- **Context Retrieval**: Retrieve the pet's profile, habits, and timeline context during chat sessions to generate highly customized first-person responses.
- **Visual Avatar Generation**: Utilize Gemini Vision to extract distinct pet traits, Imagen to generate consistent characters, and Veo (or other video models) to generate short looping animations, saving source and output assets to Firebase Storage.

## Assets & Images

The mock scene graphics for Nana were generated using built-in image tools, with the final composite asset located at `public/images/nana-moments.png`.

