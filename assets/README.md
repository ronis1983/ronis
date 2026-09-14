# assets/

## In use

| File | Where | Notes |
|---|---|---|
| `hero.webp` | The hero — the whole of it | 1889×833, 218 KB |
| `hero.jpg` | The same frame, fallback only | 1800×794, 221 KB |
| `pavement.jpg` | The CTA band behind "יש לך משהו לבנות?" | 1600×487, 105 KB |
| `hero-cape.png` | The About portrait | 784×1042, transparent, lazy-loaded |

## The hero

`hero.jpg` is one photograph with the skyline, the rooftop and the figure
already composited. It replaced a hero that stacked three separate layers in
CSS to build that same scene — a backdrop, a masked ground plane, and a
transparent cutout standing on it. All of that is gone; the picture does it.

Three things about this image drive how the hero is built, and all are worth
knowing before swapping it for another:

**It is bright on one side.** Sampling the frame: the left half runs ~130
luminance (the sun), the right ~85 (dark skyline), the rooftop ~49. The copy
sits on the reading-start side, which *flips* between Hebrew and English — so
in Hebrew it lands on the dark half and in English on the sun. That is why
`.hero__copy::before` exists: a scrim anchored to the copy rather than to a
side, so it follows the text either way. The headline and the outlined line
also carry their own `text-shadow`; an outline has no fill to carry it and
vanishes over the sun without one.

**The rooftop is the first thing a scrim eats.** It lives in the bottom sixth
of the frame, and no crop touches it — measured, the vertical crop is 0% at
every desktop width, so anything that hides it is a gradient, not framing. The
hero's own gradient used to run to 0.72 from 82% down, which held the pavement
at 21 luminance against the 59 the photograph offers; the vignette over it was
worth only 1 more. The ramp to solid ink now waits until 95%, below every piece
of hero text — the lowest is `.hero__scroll`, ending at 88% at 1920 — and the
pavement reads at 45. The phone banner had the same problem and took the same
fix: 33 to 45.

Contrast was the thing that could have vetoed this, and it did not: the copy's
own scrim carries the text, so lifting the backdrop moved the worst hero
contrast only from 6.21 to 5.55, still above the 4.5 AA floor. Measure it
against the *real* local backdrop — render with the glyphs made transparent and
sample their boxes — not against an assumed flat colour.

**The hero has to fit the fold, and that is a height problem, not a width
one.** The point of the hero is the whole photograph, rooftop included, with no
scrolling. The photograph's bottom edge is the hero's bottom edge, so the test
is simply whether the hero box ends above the fold -- and the hero is as tall
as its copy stack, which is ~1013px untrimmed and ~860px trimmed. A rule that
trims the stack existed, but it only fired below `max-height: 920px`, which
left a dead band: a 1512x982 laptop pushed 108px of pavement under the fold, a
1680x1050 40px, a 1920x1080 10px. It also demanded `min-width: 1001px`, so a
short window between 701 and 1000 was never trimmed at all and lost 150-175px.
Both floors moved (`max-height: 1090px`, `min-width: 701px`), and below
`max-height: 700px` the meta row goes too. Measured across 22 viewports from
760x600 to 2560x1440, every one now ends the photograph above the fold.

Phones are the deliberate exception: below 700px the hero is stacked -- copy on
flat ink, photograph as a band underneath -- so the picture is below the fold
by construction. Putting a 2.27:1 frame above the copy instead is a design
choice, not a bug fix, and it has not been made.

**It is 2.27:1.** Very wide. On a desktop hero `cover` crops a little from the
sides and the framing (`background-position: 56%`) keeps the figure in. On a
phone it cannot work at all — `cover` in a tall narrow box crops to a sliver
and the copy ends up over his face. So below 700px the hero stops being an
overlay: the copy reads on flat ink and the photograph follows as a band at
close to its natural shape. That is the only place on the site it is seen
uncropped.

If you replace it, a **wider-than-tall image with a quiet area on one side**
is what this layout wants. Something closer to 16:9 would survive the phone
crop and could stay a full-bleed backdrop throughout.

### The shirt is recoloured

The shirt in `hero.jpg` is navy; in the uploaded original it is dusty mauve.
It was recoloured here, not re-shot.

Skin and that mauve are almost the same RGB — chest `[183,120,118]` against
forearm `[162,104,74]` — so brightness or hue distance alone cannot separate
them. What does: **skin carries a yellow cast and the shirt does not.**
Measured as G−B, skin runs +27 to +30 across face and arms, the shirt −4 to
+2. Two more terms exclude the rest: the cape is nearly pure red (G under
10), the shorts are neutral (R−G ≈ 2). A flood fill from a seed in the chest
then keeps warm clouds that happen to pass the colour test from being
recoloured too. The mask lands at ~23,000 px.

Recolouring replaces hue and saturation but **keeps each pixel's own
lightness**, which is what preserves the folds and the shading — the fabric
still reads as fabric rather than a flat fill. The edge is feathered by
neighbour count so it does not look like a sticker.

To change it again, or to put the mauve back, the original is in git at
`82ee12d` and the recolour runs from that lossless source in one pass —
resize and JPEG encode happen once, so there is no second generation of loss.

### The chest letter is printed, not pasted

`hero.jpg` carries a gold **R** on the chest. It is not in the uploaded
original; it is composited in, from the same script that does the recolour and
against the same ~23,000 px shirt mask, so the letter can only ever land on
fabric — a glyph pixel outside the mask is discarded rather than drawn.

Three things stop it reading as a sticker. It is drawn through a squashed,
slightly rotated transform, so it follows the chest rather than the picture
plane. Every glyph pixel is multiplied by the luminance of the fabric
underneath it, so the shirt's folds run *through* the print — normalised
against the mean luminance **under the glyph**, not across the whole shirt,
because against the shirt-wide mean the bright upper chest pins at the clamp
and the letter comes out flat. And the ink carries an absolute exposure term
as well: fabric under the letter measures 1.18x the shirt mean here, so the
print sits at 1.09x. Drop identical ink on the lit chest and on the shadowed
belly and both come out equally bright, which is exactly what a pasted-on
sticker looks like.

### The arms cover part of it, for free

The letter sits at `cx 0.500, cy 0.330, size 0.100·H` — on the line where the
crossed forearms pass. **31% of it is hidden behind them**, and that needed no
occlusion layer: the arms are skin, skin is not in the shirt mask, and a glyph
pixel outside the mask was already being discarded. The depth cue falls out of
the masking that was there for a different reason.

That 31% is worth measuring rather than eyeballing, because "hidden" and "fell
off the figure" produce the same coverage number and only one of them is the
effect wanted. Classifying each discarded pixel by what covers it in the source
gives **612 to skin, 0 to cape, 0 to sky** — the letter is entirely on the body
and only the arms take any of it. Moving it sideways is what breaks that: at
`cx 0.524` ink starts spilling to cape and sky.

Legibility sets the floor. Below roughly 60% visible the R loses its leg and
starts reading as a P, so the sweep ran across the arm line and stopped at the
largest letter that still clears that bar.

The clear runs of shirt, for reference: an upper chest band at y 25.7-30.7%
(widest unbroken run 160 px) and a lower torso band at y 41.7-50.1% (143 px).

To move it, change it, or take it out, re-run the emblem pass from the lossless
original in git at `82ee12d` — recolour and letter happen in one pass before the
single resize and encode, so there is still no second generation of loss.

### The headline's two lines are fitted to one width

`.hero__title` is two display lines and they read as one block only when they
end flush. They do not naturally: measured, "שאנשים זוכרים" is 515px against
"מעצב חוויות" at 369 -- **1.40x**. The first line is the anchor and the second
is scaled to it (`fitHeadline` in `main.js`), landing both at 369px exactly.

Measured at runtime rather than hardcoded per language, because a headline is
copy and copy gets rewritten; a baked-in ratio would go silently wrong the
first time someone edits it. Two passes: the first lands within ~1%, the rest
being hinting and sub-pixel rounding at the new size, and the second corrects
for that. It re-runs on `langchange`, on resize (the inline size is px, so it
has to follow the `clamp()`), and again after `document.fonts.ready`, since the
web font changes every measurement.

**It stands down when a line wraps.** English wraps into two visual lines at
this column width, and a wrapped span's bounding box is the width of its
longest word, not of the phrase -- matching that equalises nothing and merely
resizes the headline (it grew the English one 11%). So the fit checks that
every line is a single visual line first, and otherwise clears its inline size
and leaves the cascade alone. English is therefore untouched, exactly as
before.

With JavaScript off the lines keep their natural widths. That is a cosmetic
difference in a headline that still reads, which is the right side to fail on.

### The drifting sky, and what the parallax can and cannot be

The hero is one flat photograph, so there are no depth planes to move against
each other -- separating them was already proven impossible on the cape. The
depth is added instead: two procedural cloud sheets (`feTurbulence`, inline
data URIs, no network request) drifting across the sky at different scales and
speeds. The photograph itself does not move; its bottom edge is the hero's
bottom edge and keeping that above the fold was measured carefully.

Everything here was measured as a mean per-pixel delta against the same frame
without the effect, on the sky band. Roughly: **2/255 is invisible on a
photograph, 8-12 reads clearly.**

**Getting the amplitude right.** The first version measured **2.22** -- and the
whole drift across 70 seconds measured **2.1**. That is not "subtle", it is
absent, and it shipped that way because when `mix-blend-mode: screen` came out
for performance the opacities were lowered at the same time, when removing the
blend meant they had to go *up*. At 0.60/0.45 the layer measures **11.25** and
the drift **10.03**.

**Scroll parallax on a translucent layer cannot be made to read.** A layer can
only displace as much as it is visible in the first place, and the clouds have
to stay translucent to sit on a photograph at all. Three attempts, each
measured: more depth (1.57), travel concentrated into the range where the sky
is still on screen (2.82), a sharper and finer texture (2.94-2.96 -- no change
at all). None crossed the threshold.

**So the parallax moves something opaque.** The copy block, at `-0.20` of
scroll -- negative because it sits in front of the photograph and nearer things
travel further. Text edges are high-contrast, so the same displacement measures
**6.75 to 10.55 with peaks around 218**. That is the half of the effect that is
actually seen.

**Cost.** `mix-blend-mode: screen` looked marginally richer and cost half the
frame rate -- 33.3ms a frame against 16.7 with the layer off -- because
blending reads the backdrop back every frame. Dropping it and restricting the
layer to the top 54% (all the mask kept anyway) gives 16.7ms median and 16.8ms
worst over 180 frames: identical to having no layer at all.

Masked to the sky. Unmasked, the sheet washes over the figure and the pavement
and flattens both; the first version did exactly that.

`prefers-reduced-motion` and a JavaScript failure both make the whole thing a
no-op: `--sy` is only ever set by `initParallax`, and both transforms read it
as `var(--sy, 0px)`, so unset it resolves to zero. `initParallax` publishes it
on `.hero` as one property and lets CSS multiply it per layer, so retuning a
layer never touches JavaScript. It replaced a version targeting
`.hero__figure`, an element deleted when the hero became one composited
photograph -- so it had been returning immediately and there was no parallax at
all, only code that looked like there was.

### Bump `?v=` whenever an asset changes

Every reference to the stylesheet, the scripts and the two photographs carries
a `?v=N`. A fixed filename is what lets a cache between the repository and a
browser keep serving the previous bytes after a change lands -- which is
invisible from the server side, because the files on GitHub are correct and the
page still looks untouched.

The version only works if it moves. Editing `site.css` and leaving `?v=4` in
place reintroduces exactly the bug the query was added to kill. Bump every
occurrence together, in `index.html`, `case-study.html` and `site.css`:

    grep -rl '?v=' index.html case-study.html assets/css/site.css \
      | xargs sed -i 's/?v=5/?v=6/g'

`og:image` is deliberately left unversioned -- social scrapers fetch it fresh.

### Why WebP, and what still limits the quality

The hero ships as WebP at the source's full 1889px, with the JPEG kept as a
fallback for anything without `image-set()`. Measured against the uncompressed
master, at roughly the same budget:

| encoding | KB | PSNR vs master |
|---|---|---|
| JPEG 1800 q82 (the old file) | 221 | 34.02 |
| WebP 1889 q80 | 163 | 35.71 |
| **WebP 1889 q86 (shipped)** | **218** | **36.97** |
| WebP 1889 q88 | 238 | 37.52 |

Better on both axes at once: 3 KB lighter and 2.95 dB closer to the master.
Even q72, at 131 KB, beats the old JPEG on fidelity.

**What this does not fix is resolution, which is the real ceiling.** The upload
is 1889px wide. `cover` on a 2.27:1 frame draws it at ~1950 CSS px on any
window from 1470 to 1920 wide, which is ~3900 device px on a retina screen —
a **2.06x upscale**, and 2.71x on a 2560 display. No encoder recovers detail
that was never captured; only a larger source does. Re-encoding was worth doing
because it is free, but softness on a retina screen is a pixel-count problem.

The pipeline is verified end to end: rebuilding the master from the lossless
original and re-encoding at 1800 q82 reproduces the shipped `hero.jpg`
byte-for-byte, so the WebP is the same image, encoded better — not a
re-processed one.

### Why JPEG

It arrived as a 2.1 MB PNG. PNG is lossless and meant for flat colour and
transparency; for a photograph it stores noise faithfully at great expense.
Re-encoded to JPEG at quality 82 it is **221 KB — a 90% saving** with nothing
visible lost. The original PNG is still in git at commit `82ee12d`.

## Not currently used

Nothing references these. They cost nothing at runtime — no visitor downloads
them — but they are still in the repository:

- `skyline.jpg` — the old hero backdrop, superseded by `hero.jpg`
- `hero-cape.mp4` + `js/hero-video.js` — the animated cape and its runtime
  keying. The clip is the figure on black; the script keyed it to
  transparency per frame so it could sit over the old layered hero. With the
  figure now baked into `hero.jpg` there is no cutout to replace, so nothing
  loads it. Kept rather than deleted — say the word and it goes.

`lab/cape-sim.html` still uses `hero-cape.png` and still runs.

## If a file goes missing

Nothing breaks. The hero's background falls back to solid ink and the copy
stays readable; the About portrait falls back to an `RS` monogram. Verified,
not assumed.
