# Product Vision: Creator Studio Web

## 1. Overarching Goal
**"Ideate. Write. Visualize. Launch."**
To build a comprehensive, end-to-end AI platform that abstracts away the technical complexity of video production. The platform empowers modern creators to move from a raw idea to a ready-to-launch video asset in a single, unified workflow.

## 2. Target Audience
* **Content Creators:** YouTubers, TikTokers, and social media influencers looking to scale production.
* **Marketers:** Professionals needing rapid video concepts and assets without hiring a full production team.
* **Storytellers:** Individuals who have ideas but lack the technical skills to script or visualize them.

## 3. The Four Pillars (Core Features)
The application is structured around four distinct stages of the creator lifecycle:

### Phase 1: Ideate (Viral Engine)
* **Goal:** overcome "writer's block" and identify high-performing concepts.
* **Features:** Trend analysis, concept generation, and viral hook brainstorming.

### Phase 2: Write (AI Scripting)
* **Goal:** Turn loose concepts into structured, production-ready scripts.
* **Features:**
    * AI Script Writer (Powered by Gemini 2.5 Flash).
    * Scene-by-scene breakdown (Audio vs. Visual).
    * Tone and style customization.
    * **Current Status:** Functional (Basic script generation implemented).

### Phase 3: Visualize (Asset Manager)
* **Goal:** Provide the visual and auditory components to match the script.
* **Features:**
    * AI Image Generation (Flux/Pollinations/Imagen).
    * Stock Asset Integration (Pexels/Lorem Picsum).
    * Asset organization per scene.
    * **Current Status:** In-progress (Stock photo mode active; AI generation via link sharing).

### Phase 4: Launch (Distribution)
* **Goal:** Ensure the content reaches the widest possible audience.
* **Features:** SEO metadata generation, thumbnail creation, and platform-specific export optimization.

## 4. User Experience (UX) Philosophy
* **"Complexity Abstraction":** Users should not need to prompt engineer raw LLMs. The UI should offer intuitive buttons ("Generate Script", "Suggest Visuals") that handle the complex prompting in the background.
* **Project-Centric:** All work is organized into "Projects," which act as containers for the script, assets, and settings.

## 5. Technical Context (High Level)
* **Frontend:** Next.js (App Router), React, Tailwind CSS.
* **Backend:** Next.js API Routes (Serverless functions).
* **Database:** Supabase (PostgreSQL).
* **AI Engine:** Google Gemini (Primary), Pollinations.ai (Visuals Fallback).
* **Infrastructure:** Vercel (Hosting).