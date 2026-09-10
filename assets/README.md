# assets/

## In use

| File | Where | Notes |
|---|---|---|
| `hero.jpg` | The hero — the whole of it | 1800×794, 221 KB |
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
