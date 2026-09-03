/* ==========================================================================
   Hero cape video

   The clip is the figure on a pure black background, in H.264 — which has no
   alpha channel. Dropped in as-is it would be an opaque rectangle covering the
   skyline and the pavement. So each frame is keyed to transparency here and
   drawn into a canvas that sits exactly over the static cutout.

   The key is a flood fill inward from the frame border, not a brightness
   threshold. The background is pure (0,0,0) but the cape's darkest folds are
   only (20,0,0) — dark enough that any threshold removing the background also
   punches holes in the cape. Connectivity separates them: the folds are dark
   but unreachable from the edge. Measured at ~4.5ms per frame for 480x624,
   against a 33ms budget at 30fps.

   Everything here is an enhancement. The <img> keeps its place in layout and
   is simply revealed again if any step fails.
   ========================================================================== */
(function () {
  "use strict";

  var SRC = "assets/hero-cape.mp4";
  /* a pixel is background-ish if its channels sum below this */
  var DARK = 46;

  /* Reported on window and in the console: when the cape does not animate,
     the reason should be one line away, not a debugging session. console.debug
     is hidden behind Chrome's Verbose level, so this uses info. */
  function report(state, detail) {
    window.heroVideoStatus = { state: state, detail: detail || "" };
    if (window.console && console.info) {
      console.info("[hero-video] " + state + (detail ? ": " + detail : ""));
    }
  }
  function bail(reason) { report("not running", reason); }

  function init() {
    var figure = document.querySelector(".hero__figure");
    var img = document.querySelector(".hero__cutout");
    if (!figure || !img) return bail("no figure");

    /* honour the same motion contract as the rest of the page */
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return bail("reduced motion");
    var conn = navigator.connection;
    if (conn && conn.saveData) return bail("save-data");
    if (figure.classList.contains("is-missing")) return bail("cutout missing");

    var display = document.createElement("canvas");
    display.className = "hero__figure-video";
    display.setAttribute("aria-hidden", "true");
    var dctx = display.getContext("2d");
    if (!dctx) return bail("no 2d context");
    figure.appendChild(display);

    /* The canvas tracks the image's rendered box rather than restating its
       sizing rules — those rules carry the fold and grounding maths and must
       stay in one place. */
    function syncBox() {
      var f = figure.getBoundingClientRect(), i = img.getBoundingClientRect();
      display.style.left = (i.left - f.left) + "px";
      display.style.top = (i.top - f.top) + "px";
      display.style.width = i.width + "px";
      display.style.height = i.height + "px";
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      display.width = Math.max(1, Math.round(i.width * dpr));
      display.height = Math.max(1, Math.round(i.height * dpr));
    }
    syncBox();
    if (window.ResizeObserver) new ResizeObserver(syncBox).observe(img);
    window.addEventListener("resize", syncBox);

    /* 1.7MB must not compete with the skyline, the pavement and the fonts
       for the first paint. Everything above is layout-only and cheap; the
       fetch waits until the page has loaded and the main thread is idle. */
    function whenIdle(fn) {
      var run = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(fn, { timeout: 2500 }); };
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run, { once: true });
    }

    var video = document.createElement("video");
    video.src = SRC;
    video.muted = true;            /* required for autoplay, and the clip
                                      carries an audio track nobody wants */
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.preload = "none";
    video.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";

    var work = document.createElement("canvas");
    var wctx = work.getContext("2d", { willReadFrequently: true });
    var mask, stack, ready = false, running = false, stopped = false, started = false;

    function cleanup(reason) {
      stopped = true;
      try { video.pause(); video.removeAttribute("src"); video.load(); } catch (e) {}
      video.remove(); display.remove();
      figure.classList.remove("has-video");
      bail(reason);
    }

    /* key one frame: flood fill the background in from all four edges */
    function keyFrame() {
      var W = work.width, H = work.height, N = W * H;
      wctx.drawImage(video, 0, 0, W, H);
      var id = wctx.getImageData(0, 0, W, H), d = id.data;
      mask.fill(0);
      var sp = 0, i, j, x, y;
      function darkAt(k) { var o = k * 4; return (d[o] + d[o + 1] + d[o + 2]) < DARK; }
      for (x = 0; x < W; x++) {
        i = x;               if (darkAt(i) && !mask[i]) { mask[i] = 1; stack[sp++] = i; }
        i = (H - 1) * W + x; if (darkAt(i) && !mask[i]) { mask[i] = 1; stack[sp++] = i; }
      }
      for (y = 0; y < H; y++) {
        i = y * W;           if (darkAt(i) && !mask[i]) { mask[i] = 1; stack[sp++] = i; }
        i = y * W + W - 1;   if (darkAt(i) && !mask[i]) { mask[i] = 1; stack[sp++] = i; }
      }
      while (sp) {
        i = stack[--sp]; x = i % W; y = (i / W) | 0;
        if (x > 0)     { j = i - 1; if (!mask[j] && darkAt(j)) { mask[j] = 1; stack[sp++] = j; } }
        if (x < W - 1) { j = i + 1; if (!mask[j] && darkAt(j)) { mask[j] = 1; stack[sp++] = j; } }
        if (y > 0)     { j = i - W; if (!mask[j] && darkAt(j)) { mask[j] = 1; stack[sp++] = j; } }
        if (y < H - 1) { j = i + W; if (!mask[j] && darkAt(j)) { mask[j] = 1; stack[sp++] = j; } }
      }
      /* feather: an edge pixel next to background goes part-transparent, so
         the silhouette does not read as cut out with scissors */
      for (i = 0; i < N; i++) {
        var o = i * 4;
        if (mask[i]) { d[o + 3] = 0; continue; }
        x = i % W; y = (i / W) | 0;
        var edge = (x > 0 && mask[i - 1]) || (x < W - 1 && mask[i + 1]) ||
                   (y > 0 && mask[i - W]) || (y < H - 1 && mask[i + W]);
        d[o + 3] = edge ? 140 : 255;
      }
      wctx.putImageData(id, 0, 0);

      dctx.clearRect(0, 0, display.width, display.height);
      dctx.drawImage(work, 0, 0, display.width, display.height);

      if (!ready) { ready = true; figure.classList.add("has-video"); report("running"); }
    }

    var useVFC = typeof video.requestVideoFrameCallback === "function";
    function frame() {
      if (stopped) return;
      if (running && !video.paused && video.readyState >= 2) {
        try { keyFrame(); } catch (e) { return cleanup("key failed: " + e.message); }
      }
      if (useVFC) video.requestVideoFrameCallback(frame);
      else requestAnimationFrame(frame);
    }

    video.addEventListener("error", function () { cleanup("video error"); });

    video.addEventListener("loadeddata", function () {
      work.width = video.videoWidth; work.height = video.videoHeight;
      if (!work.width) return cleanup("no dimensions");
      mask = new Uint8Array(work.width * work.height);
      stack = new Int32Array(work.width * work.height);
      var p = video.play();
      if (p && p.catch) {
        p.then(function () { started = true; running = true; frame(); watchVisibility(); })
         .catch(function () { cleanup("autoplay refused"); });
      } else { started = true; running = true; frame(); watchVisibility(); }
    }, { once: true });

    /* Decoding for something nobody is looking at is wasted battery. This is
       registered only after the element is loaded: an observer firing before
       that would start playback, and the load() below would then reset the
       element out from under it. */
    function watchVisibility() {
      if (!("IntersectionObserver" in window)) return;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (stopped || !started) return;
          if (e.isIntersecting) { running = true; video.play().catch(function () {}); }
          else { running = false; video.pause(); }
        });
      }, { threshold: 0.01 }).observe(figure);
    }
    whenIdle(function () {
      if (stopped || started) return;
      /* Don't spend 1.7MB on a browser that cannot decode it. Some builds of
         Chromium ship without the H.264 licence, and there the bytes would be
         downloaded and thrown away. */
      if (!video.canPlayType('video/mp4; codecs="avc1.42E01E"')) {
        return cleanup("h264 not supported");
      }
      figure.appendChild(video);
      video.preload = "auto";
      video.load();          /* the one and only load; it resets the element */
    });

    document.addEventListener("visibilitychange", function () {
      if (stopped) return;
      if (document.hidden) video.pause();
      else if (running) video.play().catch(function () {});
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
