# Portfolio — רוני סמט / Roni Samet

A bilingual (Hebrew / English) portfolio site for a web designer. Vanilla
HTML, CSS and JavaScript — **no build step, no dependencies, no npm install.**
Open the files and they work.

## Where it is live

Pushed to `claude/portfolio-website-designer-cosug0`, the site deploys to
GitHub Pages at **https://ronis1983.github.io/ronis/** via
`.github/workflows/pages.yml`. The workflow enables Pages itself, so there is
nothing to switch on by hand.

Use Pages rather than a raw-file CDN for anything involving `hero-cape.mp4`:
those CDNs redirect media to `raw.githubusercontent.com` and rate-limit, which
makes video an unreliable thing to preview through them.

## Run it locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Opening `index.html` directly with `file://` also works, though the language
choice will not persist between pages in some browsers.

## Pages

| File | What it is |
|---|---|
| `index.html` | The portfolio: hero, services, work, process, about, testimonials, contact |
| `case-study.html` | One full case study, linked from every work card |
| `assets/css/site.css` | The entire design system — tokens, components, responsive rules |
| `assets/js/i18n.js` | The Hebrew ⇄ English toggle |
| `assets/js/main.js` | Sticky header, mobile menu, scroll reveals, work filter, counters, form validation |

`first.html`, `contact.html` and `style.css` are the earlier practice files.
They are untouched and unrelated to this site.

### `lab/cape-sim.html`

A standalone prototype: a real Verlet cloth simulation (particle grid,
distance constraints, gravity, gusting wind) rendered in WebGL, so the
motion quality can be judged before committing to it. It is **not** wired
into the site and can be deleted freely.

Its texture is the cape auto-extracted from `hero-cape.png`, which only
recovers the brightly lit ribbon — the flat PNG cannot be separated cleanly,
because the cape's shadow folds share a colour range with the dark clothing
and the warm rim light on skin shares one with the lit fabric. Supply
`hero-cape-cloth.png` as its own transparent layer and the same simulation
runs on the full shape; only the texture changes.

## The three photographs

`skyline.jpg`, `pavement.jpg` and `hero-cape.png` are in `assets/` and in use.
The JPEGs were compressed on the way in (3.3 MB → 178 KB) with no visible
loss; the originals remain in git history. If either file ever goes missing
the CSS gradients take over and the hero collapses to a single column, so the
page never looks broken. Details in [`assets/README.md`](assets/README.md).

## How the bilingual toggle works

Hebrew is the source of truth in the markup. English lives in a `data-en`
attribute, so no string is written twice:

```html
<h1 data-en="I design experiences">מעצב חוויות</h1>
```

On first load `i18n.js` copies each element's Hebrew into `data-he`, then the
two simply swap. It also sets `lang` and `dir` on `<html>` and remembers the
choice in `localStorage`.

Attributes are translated with a `data-en-*` prefix:

```html
<input placeholder="ישראל ישראלי" data-en-placeholder="Jane Doe">
<meta name="description" content="…" data-en-content="…">
```

Supported: `placeholder`, `aria-label`, `alt`, `content`, `title`.

**To add a new translated string:** write the Hebrew as the element's normal
content and add `data-en="…"`. That is the whole procedure — there is no
translation file to update.

Direction is handled entirely by CSS logical properties (`margin-inline`,
`inset-inline-start`, and so on), so there are no `[dir="rtl"]` override
blocks to maintain. The only two exceptions are deliberate and commented in
`site.css`: the button arrow flips, and the client marquee reverses.

## Placeholder content to replace

Everything below is invented. Each is marked with a `data-placeholder`
attribute in the HTML, so `grep -n 'data-placeholder' *.html` lists them all.

- **Name / brand** — "רוני סמט / Roni Samet", and the `R` monogram (the `RS`
  monogram is now only the About portrait's fallback)
- **Phone number** — `+972 50 000 0000` (the email, `ronisamet@gmail.com`, is real)
- **The six projects** — Nova Fintech, Shaked Coffee House, Tikvah Health,
  Golan Wines, Delta Fit, Orbit Studio
- **The three testimonials** and their authors
- **All statistics** — 12 years, 140 projects, 60 clients, and every metric in
  the case study
- **The client marquee** names
- **Social links** in the footer, which all point at `#`

A dashed note at the bottom of both pages says so to any visitor. Delete the
`.placeholder-note` blocks once the real content is in.

## The contact form

The form carries `data-netlify="true"` and `name="contact"`, forwarded from the
original `contact.html`, so deploying to Netlify captures submissions with no
extra work. It also has a honeypot field (`bot-field`) and client-side
validation with bilingual error messages.

On any other host the form will not submit anywhere — point `action` at your
own endpoint, or swap it for a `mailto:` link.

## Browser support

Modern evergreen browsers. The site uses CSS logical properties, `clamp()`,
`aspect-ratio` and `IntersectionObserver`. Without JavaScript the page still
renders and reads correctly in Hebrew; only the toggle, filter and reveal
animations are lost.

## Accessibility

Skip link, semantic landmarks, visible focus rings, `aria-pressed` on both
toggles, `aria-expanded` on the menu, bilingual `alt` text, and all motion —
including the parallax and the marquee — disabled under
`prefers-reduced-motion: reduce`.
