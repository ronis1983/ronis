# assets/

## The three photographs

The site is designed around three images. **They are in place.** If you ever
replace them, keep exactly these names and everything picks them up with no
code change:

| Filename | What it is | Where it appears | Recommended size |
|---|---|---|---|
| `skyline.jpg` | Blurred Tel Aviv skyline at golden hour | Hero backdrop | ≥ 2000 × 800, landscape |
| `pavement.jpg` | Wet pavement catching the sunset | The CTA band behind "יש לך משהו לבנות?" | ≥ 2000 × 700, landscape |
| `hero-cape.png` | Cutout of the figure in the red cape | Hero foreground, right side | ≥ 800 × 1200, **transparent background** |

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
