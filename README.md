# Danial Ahmad Khan — AI Video Creator Portfolio

A static, dependency-free portfolio site (HTML + CSS + vanilla JS). Host it anywhere that serves static files: Amazon S3, Netlify, Vercel, GitHub Pages, and so on.

```
index.html        page structure
css/styles.css    design & animations
js/config.js      ← ALL editable content lives here
js/main.js        carousel, lazy-loading, animations
videos/           optional: drop local video files here
images/           optional: poster/thumbnail images
```

## Adding your videos

Open **`js/config.js`** and replace the placeholders:

| Placeholder        | Where it appears            |
| ------------------ | --------------------------- |
| `HERO_VIDEO_URL`   | Full-screen hero background |
| `VIDEO_URL_1` … `VIDEO_URL_5` | Portfolio carousel |

Each `src` can be:

```js
src: "https://cdn.example.com/reel.mp4"        // remote URL
src: "videos/reel.mp4"                          // local file in /videos
src: ["videos/reel.webm", "videos/reel.mp4"]    // several formats; the browser picks one it supports
```

You can also set an optional `poster: "images/reel.jpg"` thumbnail. Posters make the page feel faster and show while a video loads.

To add more videos, copy one `{ ... }` block in the `videos` array. To remove one, delete its block. Any `src` still left as a placeholder shows a styled "coming soon" card instead of a broken player.

### Video tips
- **Formats:** MP4 (H.264) works everywhere; WebM is smaller in Chrome, Firefox and Edge. Supplying both covers every browser.
- **Size:** for the web, aim for 1080p at roughly 4–8 Mbps. Keep hero loops short (10–20 s).
- **Remote hosting:** the URL must link directly to the video file. A YouTube or Instagram page URL won't work. S3, Cloudflare R2, Bunny CDN and similar hosts work well.
- **Autoplay:** videos start muted, because browsers block autoplay with sound. Visitors can unmute them with the speaker button.

## Performance behaviour
- Carousel videos use `preload="none"`. Only the active slide loads and plays, and its two neighbours fetch only metadata.
- Videos play only while the carousel is on screen. They pause when it scrolls away or the tab is hidden.
- The hero video pauses when it scrolls out of view.
- Animations use only `transform` and `opacity`, and the site respects `prefers-reduced-motion`.

## Other content
In the same `config.js`:
- `SITE`: name, role, headline, intro text
- `trendingTopics`: category cards. Add or remove entries freely; the icon options are listed in the file.
- `about`: paragraphs and stats
- `contact`: email and social links (`INSTAGRAM_URL`, `LINKEDIN_URL`, and so on)

## Preview locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
