# assets/

## The three photographs

The site is designed around three images. **They are in place.** If you ever
replace them, keep exactly these names and everything picks them up with no
code change:

| Filename | What it is | Where it appears | Recommended size |
|---|---|---|---|
| `skyline.jpg` | Blurred Tel Aviv skyline at golden hour | Hero backdrop | ≥ 2000 × 800, landscape |
| `pavement.jpg` | Wet pavement catching the sunset | **The hero's ground plane** — what he stands on — and the CTA band | ≥ 2000 × 700, landscape |
| `hero-cape.png` | Cutout of the figure in the red cape | Hero foreground, standing on the pavement | ≥ 800 × 1200, **transparent background** |

`hero-cape.png` must be a PNG with a real alpha channel — it sits on top of the
skyline, so a white or checkerboard background will show.

Keep each JPEG under ~400 KB (they are decorative and heavily overlaid, so
quality 70–80 is plenty). A WebP copy is not required.

### What was done to the uploaded files

The two JPEGs were resized and re-encoded, because 3.3 MB of background
imagery undercuts a site whose own copy sells load speed:

| File | Before | After |
|---|---|---|
| `skyline.jpg` | 2880×1178, 1324 KB | 1920×785, 73 KB (q72) |
| `pavement.jpg` | 2880×876, 2027 KB | 1600×487, 105 KB (q68) |
| `hero-cape.png` | 784×1042, 775 KB | untouched |

Neither JPEG loses anything visible: the skyline is a blurred bokeh plate
under three gradient layers, and the pavement sits under an 86–94% dark
scrim. The cape is the sharp foreground subject, so it was left alone.

The originals are still in git — `git show 4a01f38:assets/skyline.jpg > skyline.jpg`
restores any of them.

## `hero-cape.mp4` — the animated cape

An optional enhancement layered over `hero-cape.png`. 480×624, H.264, ~1.8 MB.

H.264 carries no alpha channel and the clip is the figure on a pure black
background, so it cannot simply be dropped in — it would be an opaque
rectangle covering the skyline. `js/hero-video.js` keys each frame to
transparency at runtime and draws it into a canvas sitting exactly over the
still.

The key is a **flood fill inward from the frame border**, not a brightness
threshold. The background is exactly `(0,0,0)`, but the cape's darkest folds
are only `(20,0,0)` — any threshold that removes the background also punches
holes through the cape. Connectivity separates them: the folds are dark but
unreachable from the edge. Roughly 4.5 ms per frame at 480×624.

The PNG remains the source of truth. The video is skipped entirely — no
bytes fetched — under `prefers-reduced-motion`, with Save-Data on, if the
browser cannot decode H.264, or if autoplay is refused. In every one of
those cases the still is what shows, and it keeps its place in layout
throughout, so the figure's size and footing on the pavement never depend on
the video loading.

To replace it, keep the name `hero-cape.mp4` and the black background. A
taller export costs nothing extra and would sharpen it: at 480 px wide it is
upscaled roughly 3× on a retina screen.

## How the hero composes them

The three photographs are one scene, not three decorations:

```
  skyline.jpg    ← sky and city, the full hero backdrop
       ↓ (masked haze, no hard seam)
  pavement.jpg   ← ground plane, bottom ~34% of the hero
       ↑
  hero-cape.png  ← stands on the pavement, ~60-90px of ground in front
```

The ground is a separate `.hero__ground` layer whose top edge is masked to
transparent, so the two photographs meet in a haze instead of a cut line.
The figure carries a blurred contact shadow and a faint mirrored copy
beneath his feet, because the pavement is wet.

If you swap the pavement for a different shot, the thing to check is
`background-position` on `.hero__ground` — it is set to `center 60%` to put
the near, reflective part of the road under his feet.

## What happens while they are missing

Nothing breaks, and nothing looks unfinished:

- **Backgrounds** are declared as `linear-gradient(…), url(…)` in
  `css/site.css`, so the gradient is painted regardless and a 404 on the
  photo simply leaves the gradient — a golden-hour sky for the hero, an
  ember wash for the CTA band.
- **The cape cutout** is a real `<img>`. When it fails to load, `js/main.js`
  adds `.is-missing` to `.hero__figure`, which hides the broken image and
  leaves the crimson glow behind it — a deliberate part of the composition,
  not a hole.

So the only visible difference after you add the files is that the photographs
appear. Layout and spacing do not shift.

## Adding project screenshots

`case-study.html` has dashed placeholder blocks (`.cs-shot`) where real
screenshots go. Suggested convention:

```
assets/work/nova-hero.jpg
assets/work/nova-system.jpg
```

Replace the `<div class="cs-shot">…</div>` with an `<img>` when you have them.

## Folder layout

```
assets/
├── css/site.css     the whole design system, one file
├── js/i18n.js       Hebrew ⇄ English toggle
├── js/main.js       nav, reveals, filter, counters, form validation
├── skyline.jpg      ← you add
├── pavement.jpg     ← you add
└── hero-cape.png    ← you add
```
