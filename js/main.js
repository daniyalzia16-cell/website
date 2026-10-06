/* ==========================================================================
   main.js — rendering, carousel, animations.
   Content lives in js/config.js; you shouldn't need to edit this file.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Helpers ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  // A source is "unset" when empty or still an ALL_CAPS placeholder like VIDEO_URL_1.
  function isPlaceholder(value) {
    if (!value) return true;
    var v = String(value).trim();
    return v === "" || /^[A-Z][A-Z0-9_]*$/.test(v);
  }

  // Normalise src (string or array) into a list of real sources.
  function toSources(src) {
    var list = Array.isArray(src) ? src : [src];
    return list.filter(function (s) { return !isPlaceholder(s); });
  }

  function mimeFor(url) {
    var clean = String(url).split("?")[0].split("#")[0].toLowerCase();
    if (/\.webm$/.test(clean)) return "video/webm";
    if (/\.(mp4|m4v)$/.test(clean)) return "video/mp4";
    if (/\.mov$/.test(clean)) return "video/quicktime";
    if (/\.ogv$/.test(clean)) return "video/ogg";
    return "";
  }

  // Attach <source> elements to a video (only called when it should load).
  function loadVideo(video, sources) {
    if (video.dataset.loaded === "1" || !sources.length) return;
    sources.forEach(function (url) {
      var s = document.createElement("source");
      s.src = url;
      var type = mimeFor(url);
      if (type) s.type = type;
      video.appendChild(s);
    });
    video.dataset.loaded = "1";
    video.load();
  }

  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
    return p;
  }

  /* ---------- Site text ---------- */

  var site = typeof SITE !== "undefined" ? SITE : {};

  function renderSiteText() {
    $$("[data-site]").forEach(function (node) {
      var key = node.getAttribute("data-site");
      if (site[key]) node.textContent = site[key];
    });
    if (site.name) document.title = site.name + " — " + (site.role || "AI Video Creator");
    var logo = $(".nav__logo");
    if (logo && site.name) logo.textContent = site.name.charAt(0);
    var initial = $(".about__initial");
    if (initial && site.name) initial.textContent = site.name.charAt(0);
    var year = $(".footer__year");
    if (year) year.textContent = new Date().getFullYear();
  }

  // Wrap each word of the hero name so it can slide up.
  function splitWords(node) {
    var words = node.textContent.trim().split(/\s+/);
    node.innerHTML = words
      .map(function (w, i) {
        return '<span class="word"><span style="--i:' + i + '">' + escapeHtml(w) + "</span></span>";
      })
      .join(" ");
  }

  /* ---------- Hero video ---------- */

  function setupHero() {
    var video = $(".hero__video");
    var soundBtn = $(".hero__sound");
    var cfg = typeof heroVideo !== "undefined" ? heroVideo : {};
    var sources = toSources(cfg.src);

    if (!video) return;
    if (!sources.length) {
      video.remove();
      if (soundBtn) soundBtn.hidden = true;
      return;
    }

    if (!isPlaceholder(cfg.poster)) video.poster = cfg.poster;
    video.muted = true;
    loadVideo(video, sources);

    function ready() { video.classList.add("is-ready"); }
    video.addEventListener("playing", ready, { once: true });
    video.addEventListener("loadeddata", function () {
      if (!reduceMotion) safePlay(video);
      ready();
    }, { once: true });
    video.addEventListener("error", function () { video.remove(); }, true);

    // Pause hero video when it scrolls out of view to save resources.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!reduceMotion) safePlay(video); }
          else video.pause();
        });
      }, { threshold: 0.05 }).observe(video.parentElement);
    }

    if (soundBtn) {
      soundBtn.addEventListener("click", function () {
        video.muted = !video.muted;
        if (!video.muted) safePlay(video);
        var on = !video.muted;
        soundBtn.setAttribute("aria-pressed", String(on));
        soundBtn.setAttribute("aria-label", on ? "Mute showreel" : "Unmute showreel");
        $(".hero__sound-label", soundBtn).textContent = on ? "Sound on" : "Sound off";
      });
    }
  }

  /* ---------- Marquee ---------- */

  function renderMarquee() {
    var track = $(".marquee__track");
    var topics = typeof trendingTopics !== "undefined" ? trendingTopics : [];
    if (!track || !topics.length) return;
    var html = topics
      .map(function (t) {
        return '<span class="marquee__item">' + escapeHtml(t.title) + '<span class="marquee__star">✦</span></span>';
      })
      .join("");
    // Duplicated for a seamless loop.
    track.innerHTML = html + html;
  }

  /* ---------- Topics ---------- */

  var ICONS = {
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M19 19v2H6"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6M7 14l1 5h2"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    wand: '<path d="M4 20L16 8M14 6l4 4"/><path d="M18 2v3M20.5 3.5L19 5M22 7h-3"/>',
    morph: '<circle cx="8" cy="12" r="5"/><rect x="12" y="7" width="10" height="10" rx="2"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7 15h10"/>',
  };

  function icon(name) {
    var path = ICONS[name] || ICONS.sparkle;
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
  }

  function renderTopics() {
    var grid = $(".topics__grid");
    var topics = typeof trendingTopics !== "undefined" ? trendingTopics : [];
    if (!grid) return;
    topics.forEach(function (t, i) {
      var card = el("article", "topic reveal");
      card.style.setProperty("--d", String(i % 4));
      card.innerHTML =
        '<div class="topic__top"><span class="topic__icon">' + icon(t.icon) + '</span><span class="topic__num">' + pad(i + 1) + "</span></div>" +
        '<h3 class="topic__title">' + escapeHtml(t.title) + "</h3>" +
        (t.description ? '<p class="topic__desc">' + escapeHtml(t.description) + "</p>" : "");
      if (finePointer) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty("--mx", e.clientX - r.left + "px");
          card.style.setProperty("--my", e.clientY - r.top + "px");
        });
      }
      grid.appendChild(card);
    });
  }

  /* ---------- About ---------- */

  function renderAbout() {
    var cfg = typeof about !== "undefined" ? about : {};
    var text = $(".about__text");
    var stats = $(".about__stats");
    if (text && cfg.paragraphs) {
      cfg.paragraphs.forEach(function (p, i) {
        var node = el("p", "reveal");
        node.style.setProperty("--d", String(i + 1));
        node.textContent = p;
        text.appendChild(node);
      });
    }
    if (stats && cfg.stats) {
      cfg.stats.forEach(function (s, i) {
        var item = el("div", "reveal");
        item.style.setProperty("--d", String(i + 1));
        item.innerHTML = "<dt>" + escapeHtml(s.value) + "</dt><dd>" + escapeHtml(s.label) + "</dd>";
        stats.appendChild(item);
      });
    }
  }

  /* ---------- Contact ---------- */

  function renderContact() {
    var cfg = typeof contact !== "undefined" ? contact : {};
    var emailLink = $('[data-contact="email"]');
    var emailText = $('[data-contact="email-text"]');
    if (emailLink && cfg.email) {
      emailLink.href = "mailto:" + cfg.email;
      emailText.textContent = cfg.email;
    }
    var list = $(".contact__socials");
    if (!list || !cfg.socials) return;
    cfg.socials.forEach(function (s, i) {
      var li = el("li", "reveal");
      li.style.setProperty("--d", String(i));
      var href = isPlaceholder(s.url) ? "#contact" : s.url;
      var external = /^https?:/i.test(href);
      li.innerHTML =
        '<a href="' + escapeHtml(href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" +
        "<b>" + escapeHtml(s.label) + "</b><span>" + escapeHtml(s.handle || "") + "</span></a>";
      list.appendChild(li);
    });
  }

  /* ---------- Carousel ---------- */

  var SVG_PLAY = '<svg class="i-play" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
  var SVG_PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
  var SVG_MUTED = '<svg class="i-muted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
  var SVG_SOUND = '<svg class="i-sound" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  function setupCarousel() {
    var root = $(".carousel");
    var list = typeof videos !== "undefined" ? videos : [];
    if (!root || !list.length) return;

    var viewport = $(".carousel__viewport", root);
    var track = $(".carousel__track", root);
    var dotsWrap = $(".carousel__dots", root);
    var currentEl = $(".carousel__current", root);
    var totalEl = $(".carousel__total", root);
    var progressEl = $(".carousel__progress span", root);
    var slides = [];
    var index = 0;
    var inView = false;
    var userPaused = false; // user explicitly paused the active video
    var unmuted = false;

    totalEl.textContent = pad(list.length);

    list.forEach(function (item, i) {
      var sources = toSources(item.src);
      var placeholderName = Array.isArray(item.src) ? item.src[0] : item.src;
      var slide = el("article", "slide");
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + list.length + ": " + (item.title || "Video"));

      var media = el("div", "slide__media");
      var hasPoster = !isPlaceholder(item.poster);

      if (sources.length) {
        if (hasPoster) {
          var img = el("img", "slide__poster");
          img.src = item.poster;
          img.alt = "";
          img.loading = "lazy";
          img.decoding = "async";
          media.appendChild(img);
        }
        // Video element is created now, but sources are attached only when needed.
        var video = el("video", "slide__video");
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.preload = "none";
        if (hasPoster) video.poster = item.poster;
        media.insertBefore(video, media.firstChild);
        media.appendChild(el("div", "slide__loader"));
      } else {
        media.appendChild(
          el(
            "div",
            "slide__placeholder",
            "<code>" + escapeHtml(placeholderName || "VIDEO_URL_" + (i + 1)) + "</code><span>Add the video URL or path in js/config.js</span>"
          )
        );
      }

      media.appendChild(el("div", "slide__shade"));

      var ui = el("div", "slide__ui");
      ui.innerHTML =
        '<div class="slide__info">' +
        (item.category ? '<span class="slide__cat">' + escapeHtml(item.category) + "</span>" : "") +
        '<h3 class="slide__title">' + escapeHtml(item.title || "Untitled") + "</h3>" +
        (item.description ? '<p class="slide__desc">' + escapeHtml(item.description) + "</p>" : "") +
        "</div>" +
        '<div class="slide__buttons">' +
        '<button type="button" class="slide__btn slide__btn--mute" aria-label="Unmute video"' + (sources.length ? "" : " disabled") + ">" + SVG_MUTED + SVG_SOUND + "</button>" +
        '<button type="button" class="slide__btn slide__btn--play" aria-label="Play video"' + (sources.length ? "" : " disabled") + ">" + SVG_PLAY + SVG_PAUSE + "</button>" +
        "</div>";
      media.appendChild(ui);

      var bar = el("div", "slide__bar", "<span></span>");
      if (sources.length) media.appendChild(bar);

      slide.appendChild(media);
      track.appendChild(slide);

      var dot = el("button", "carousel__dot");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Show video " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(dot);

      var state = {
        el: slide,
        video: $(".slide__video", slide),
        sources: sources,
        bar: $("span", bar),
        playBtn: $(".slide__btn--play", slide),
        muteBtn: $(".slide__btn--mute", slide),
      };
      slides.push(state);
      wireSlide(state, i);
    });

    function wireSlide(s, i) {
      var v = s.video;
      if (v) {
        v.addEventListener("playing", function () {
          s.el.classList.add("is-playing");
          s.el.classList.remove("is-buffering");
          s.playBtn.setAttribute("aria-label", "Pause video");
        });
        v.addEventListener("pause", function () {
          s.el.classList.remove("is-playing");
          s.playBtn.setAttribute("aria-label", "Play video");
        });
        v.addEventListener("waiting", function () { s.el.classList.add("is-buffering"); });
        v.addEventListener("canplay", function () { s.el.classList.remove("is-buffering"); });
        v.addEventListener("timeupdate", function () {
          if (v.duration) s.bar.style.transform = "scaleX(" + v.currentTime / v.duration + ")";
        });
        v.addEventListener("error", function () { s.el.classList.remove("is-buffering"); }, true);
      }

      s.playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (i !== index) return goTo(i);
        if (!v) return;
        if (v.paused) {
          userPaused = false;
          loadVideo(v, s.sources);
          s.el.classList.add("is-buffering");
          safePlay(v);
        } else {
          userPaused = true;
          v.pause();
        }
      });

      s.muteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!v) return;
        unmuted = v.muted;
        v.muted = !unmuted;
        s.el.classList.toggle("is-unmuted", unmuted);
        s.muteBtn.setAttribute("aria-label", unmuted ? "Mute video" : "Unmute video");
        if (unmuted && v.paused) { userPaused = false; safePlay(v); }
      });

      // Clicking a side slide brings it to the centre.
      s.el.addEventListener("click", function () {
        if (dragMoved) return;
        if (i !== index) goTo(i);
      });
    }

    function layout(animate) {
      var slideW = slides[0].el.offsetWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      var offset = viewport.clientWidth / 2 - slideW / 2 - index * (slideW + gap);
      track.classList.toggle("no-transition", !animate);
      track.style.transform = "translate3d(" + (offset + dragDelta) + "px,0,0)";
    }

    function update() {
      slides.forEach(function (s, i) {
        var active = i === index;
        var near = Math.abs(i - index) === 1;
        s.el.classList.toggle("is-active", active);
        s.el.classList.toggle("is-near", near);
        s.el.setAttribute("aria-hidden", String(!active));
        $$("button", s.el).forEach(function (b) { b.tabIndex = active ? 0 : -1; });
        dotsWrap.children[i].setAttribute("aria-selected", String(active));

        if (!s.video) return;
        if (active) {
          // Keep mute state consistent across slides.
          s.video.muted = !unmuted;
          s.el.classList.toggle("is-unmuted", unmuted);
          s.muteBtn.setAttribute("aria-label", unmuted ? "Mute video" : "Unmute video");
          if (inView) {
            loadVideo(s.video, s.sources);
            if (!userPaused && !reduceMotion) {
              s.el.classList.add("is-buffering");
              safePlay(s.video);
            }
          }
        } else {
          s.video.pause();
          s.el.classList.remove("is-buffering");
          // Pre-fetch just the metadata of neighbours so they start quickly.
          if (near && inView) {
            s.video.preload = "metadata";
            loadVideo(s.video, s.sources);
          }
        }
      });
      currentEl.textContent = pad(index + 1);
      progressEl.style.transform = "scaleX(" + (index + 1) / slides.length + ")";
    }

    function goTo(i) {
      var next = (i + slides.length) % slides.length;
      if (next !== index) userPaused = false;
      index = next;
      layout(true);
      update();
    }

    $(".carousel__prev", root).addEventListener("click", function () { goTo(index - 1); });
    $(".carousel__next", root).addEventListener("click", function () { goTo(index + 1); });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
    });

    /* Drag / swipe (pointer events cover mouse, touch and pen) */
    var dragStartX = 0;
    var dragStartY = 0;
    var dragDelta = 0;
    var dragging = false;
    var dragMoved = false;
    var axisLocked = null;

    viewport.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.target.closest(".slide__btn")) return;
      dragging = true;
      dragMoved = false;
      axisLocked = null;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragDelta = 0;
    });

    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      if (!axisLocked && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axisLocked === "x") viewport.classList.add("is-dragging");
      }
      if (axisLocked !== "x") return;
      dragMoved = true;
      // Rubber-band resistance at the ends.
      var atEdge = (index === 0 && dx > 0) || (index === slides.length - 1 && dx < 0);
      dragDelta = atEdge ? dx * 0.35 : dx;
      layout(false);
    }, { passive: true });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      var threshold = Math.min(120, viewport.clientWidth * 0.12);
      var delta = dragDelta;
      dragDelta = 0;
      if (delta < -threshold && index < slides.length - 1) goTo(index + 1);
      else if (delta > threshold && index > 0) goTo(index - 1);
      else layout(true);
      // Let the click handler see dragMoved, then reset.
      setTimeout(function () { dragMoved = false; }, 0);
    }

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("dragstart", function (e) { e.preventDefault(); });

    /* Only load/play videos while the carousel is on screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          inView = e.isIntersecting;
          if (inView) update();
          else slides.forEach(function (s) { if (s.video) s.video.pause(); });
        });
      }, { threshold: 0.25 }).observe(viewport);
    } else {
      inView = true;
    }

    // Pause everything when the tab is hidden.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) slides.forEach(function (s) { if (s.video) s.video.pause(); });
      else if (inView) update();
    });

    var resizeRaf;
    window.addEventListener("resize", function () {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () { layout(false); });
    });

    layout(false);
    update();
    root.tabIndex = -1;
  }

  /* ---------- Scroll reveal ---------- */

  function setupReveal() {
    var items = $$(".reveal");
    $$("[data-delay]").forEach(function (n) { n.style.setProperty("--d", n.getAttribute("data-delay")); });
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (n) {
      // Hero items are revealed after the preloader instead.
      if (!n.closest(".hero")) io.observe(n);
    });
  }

  /* ---------- Parallax + nav state ---------- */

  function setupScrollEffects() {
    var nav = $(".nav");
    var parallax = $$("[data-parallax]");
    var heroContent = $(".hero__content");
    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 20);
      nav.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * 0.8 && !document.body.classList.contains("menu-open"));
      lastY = y;

      if (!reduceMotion) {
        parallax.forEach(function (n) {
          var speed = parseFloat(n.getAttribute("data-parallax")) || 0;
          var rect = n.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
          var center = rect.top + rect.height / 2 - window.innerHeight / 2;
          var shift = n.closest(".hero") ? y * speed : center * speed;
          n.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
        });
        if (heroContent && y < window.innerHeight) {
          heroContent.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
          heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.8)));
        }
      }
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    }, { passive: true });
    onScroll();

    // Highlight the nav link of the section in view.
    var links = $$(".nav__links a[href^='#']");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("main section[id]").forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- Mobile menu ---------- */

  function setupMenu() {
    var toggle = $(".nav__toggle");
    var menu = $(".mobile-menu");
    function set(open) {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
    }
    toggle.addEventListener("click", function () {
      set(!document.body.classList.contains("menu-open"));
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  }

  /* ---------- Cursor glow + magnetic buttons ---------- */

  function setupPointerFx() {
    if (!finePointer || reduceMotion) return;
    var glow = $(".cursor-glow");
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    document.documentElement.classList.add("has-pointer");

    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) requestAnimationFrame(loop);
      else running = false;
    }
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });

    $$(".btn, .icon-btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Preloader ---------- */

  function runPreloader(done) {
    var num = $(".preloader__num");
    var bar = $(".preloader__bar span");
    var progress = 0;
    var loaded = false;
    var start = performance.now();
    var minTime = reduceMotion ? 0 : 1300;

    window.addEventListener("load", function () { loaded = true; });
    if (document.readyState === "complete") loaded = true;
    // Never block the page for long if a font or asset is slow.
    setTimeout(function () { loaded = true; }, 3000);

    function tick(now) {
      var elapsed = now - start;
      var target = loaded ? 100 : Math.min(90, (elapsed / minTime) * 90);
      progress += (target - progress) * 0.12;
      if (loaded && elapsed > minTime && progress > 99.4) progress = 100;
      num.textContent = Math.round(progress);
      bar.style.transform = "scaleX(" + progress / 100 + ")";
      if (progress < 100) return requestAnimationFrame(tick);
      setTimeout(finish, 150);
    }

    function finish() {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-loaded");
      done();
    }

    requestAnimationFrame(tick);
  }

  /* ---------- Boot ---------- */

  function init() {
    renderSiteText();
    var nameEl = $(".hero__name .split");
    if (nameEl) splitWords(nameEl);
    renderMarquee();
    renderTopics();
    renderAbout();
    renderContact();
    setupHero();
    setupCarousel();
    setupReveal();
    setupScrollEffects();
    setupMenu();
    setupPointerFx();

    runPreloader(function () {
      setTimeout(function () {
        $$(".hero .reveal").forEach(function (n) { n.classList.add("is-visible"); });
      }, 350);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
