/* ==========================================================================
   SITE CONFIGURATION — edit this file to update the website.
   You never need to touch index.html, main.js or styles.css to add content.
   ==========================================================================

   HOW TO ADD YOUR VIDEOS
   ----------------------
   Replace each placeholder (VIDEO_URL_1, VIDEO_URL_2, ...) with either:

     • A remote URL     →  "https://cdn.example.com/my-video.mp4"
     • A relative path  →  "videos/my-video.mp4"   (file placed in the /videos folder)

   Supported formats: MP4 (H.264) and WebM. To give browsers a choice of
   formats, use an array instead of a single string:

     src: ["videos/clip.webm", "videos/clip.mp4"]

   "poster" is an optional thumbnail image (URL or path, e.g. "images/clip.jpg")
   shown before the video loads. Strongly recommended for fast loading.

   Any src left as a placeholder (e.g. "VIDEO_URL_3") shows an elegant
   "video coming soon" card instead of a broken player.
   ========================================================================== */

const SITE = {
  name: "Danial Ahmad Khan",
  shortName: "Danial",
  role: "AI Video Creator",
  headline: "Bringing Ideas to Life with AI",
  intro:
    "Cinematic AI-generated films, scroll-stopping social content and trending AI video concepts — crafted with generative tools and a storyteller's eye.",
};

/* --------------------------------------------------------------------------
   HERO VIDEO — the large cinematic video behind the hero section.
   Plays automatically (muted + looped) where the browser allows.
   -------------------------------------------------------------------------- */
const heroVideo = {
  src: "HERO_VIDEO_URL", // ← replace with your showreel URL or path
  poster: "",            // ← optional thumbnail, e.g. "images/hero-poster.jpg"
};

/* --------------------------------------------------------------------------
   VIDEO PORTFOLIO — the horizontal showcase carousel.
   Add, remove or reorder objects freely. Only "src" is required.
   -------------------------------------------------------------------------- */
const videos = [
  {
    title: "AI Video Project 01",
    category: "AI Cinematic",
    description: "A moody, film-grade short generated entirely with AI.",
    src: "VIDEO_URL_1", // ← replace with your video URL or path
    poster: "",
  },
  {
    title: "AI Video Project 02",
    category: "Trending AI",
    description: "A viral-format concept built for short-form platforms.",
    src: "VIDEO_URL_2", // ← replace with your video URL or path
    poster: "",
  },
  {
    title: "AI Video Project 03",
    category: "AI Fashion & Beauty",
    description: "Editorial fashion visuals with surreal generative styling.",
    src: "VIDEO_URL_3", // ← replace with your video URL or path
    poster: "",
  },
  {
    title: "AI Video Project 04",
    category: "AI Commercial",
    description: "A product spot imagined, lit and animated with AI.",
    src: "VIDEO_URL_4", // ← replace with your video URL or path
    poster: "",
  },
  {
    title: "AI Video Project 05",
    category: "AI Storytelling",
    description: "A narrative piece exploring character and atmosphere.",
    src: "VIDEO_URL_5", // ← replace with your video URL or path
    poster: "",
  },
];

/* --------------------------------------------------------------------------
   TRENDING AI TOPICS — add a new object to add a new category card.
   "icon" can be any of: film, sparkle, book, box, megaphone, phone, user,
   wand, morph, flask (falls back to "sparkle").
   -------------------------------------------------------------------------- */
const trendingTopics = [
  { title: "AI Cinematic Videos", icon: "film", description: "Film-grade shots, lighting and camera moves generated from imagination." },
  { title: "AI Fashion & Beauty", icon: "sparkle", description: "Editorial looks, runway concepts and beauty visuals with a surreal edge." },
  { title: "AI Storytelling", icon: "book", description: "Short narratives with consistent worlds, moods and emotional arcs." },
  { title: "AI Product Videos", icon: "box", description: "Hero product shots and launches without a physical studio." },
  { title: "AI Commercials", icon: "megaphone", description: "Concept-to-screen ad spots for brands that want to stand out." },
  { title: "AI Social Media Content", icon: "phone", description: "Vertical, scroll-stopping clips tuned for Reels, TikTok and Shorts." },
  { title: "AI Characters", icon: "user", description: "Original digital characters with personality and visual consistency." },
  { title: "AI Animation", icon: "wand", description: "Stylised motion — from painterly worlds to 3D-inspired animation." },
  { title: "AI Transformation Videos", icon: "morph", description: "Seamless morphs and before/after reveals that keep viewers watching." },
  { title: "Experimental Generative AI", icon: "flask", description: "Boundary-pushing visuals exploring what generative video can become." },
];

/* --------------------------------------------------------------------------
   ABOUT — paragraphs and highlight stats.
   -------------------------------------------------------------------------- */
const about = {
  paragraphs: [
    "Danial is an AI video creator who turns ideas into cinematic, emotionally engaging visuals using the latest generative AI tools. Each piece blends filmmaking instincts — composition, lighting, pacing and sound — with the limitless possibilities of AI.",
    "From trending short-form concepts to brand commercials and experimental art pieces, Danial focuses on creative AI-generated visual content that feels intentional, polished and unmistakably modern.",
  ],
  stats: [
    { value: "100+", label: "AI videos created" },
    { value: "10", label: "Content styles" },
    { value: "24/7", label: "Creative curiosity" },
  ],
};

/* --------------------------------------------------------------------------
   CONTACT — replace the placeholders with your real details.
   Remove any entry you don't use; add more by copying a line.
   -------------------------------------------------------------------------- */
const contact = {
  email: "YOUR_EMAIL@example.com",
  socials: [
    { label: "Instagram", handle: "@your_instagram", url: "INSTAGRAM_URL" },
    { label: "LinkedIn", handle: "Your Name", url: "LINKEDIN_URL" },
    { label: "TikTok", handle: "@your_tiktok", url: "TIKTOK_URL" },
    { label: "YouTube", handle: "Your Channel", url: "YOUTUBE_URL" },
    { label: "X / Twitter", handle: "@your_handle", url: "X_URL" },
  ],
};
