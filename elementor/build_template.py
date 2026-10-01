import json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
# usage: python3 build_template.py [asset base URL] [output file]

ASSET_BASE = sys.argv[1] if len(sys.argv) > 1 else "https://deploy-preview-2--thirsty-lewin-e4d076.netlify.app/assets/"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "ronis-elementor.json")

css = open(os.path.join(HERE, '..', 'site.css'), encoding='utf-8').read()
# keep: variables, header, hero, character (everything before the sections block)
css = css[:css.index('/* ---------- sections')]
css = css.replace('url("assets/skyline.jpg")', 'url("%sskyline.jpg")' % ASSET_BASE)
css = css.replace('url("assets/pavement.jpg")', 'url("%spavement.jpg")' % ASSET_BASE)
css += '''
@media (max-width: 900px) { .site-header::after { display: none; } }
@media (max-width: 760px) {
    :root { --header-h: 56px; --pave: 90px; --edge: 24px; }
    .logo { font-size: 24px; }
    .main-nav ul { gap: 16px; padding-inline-end: 0; }
    .main-nav a { font-size: 16px; }
    .hero { height: auto; min-height: 100vh; min-height: 100svh; }
    .hero-skyline { top: var(--header-h); left: 6px; right: 6px; bottom: calc(var(--pave) - 39px); border-radius: 12px 12px 0 0; }
    .hero-inner { position: relative; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 4px;
        min-height: 100vh; min-height: 100svh; padding: calc(var(--header-h) + 8px) var(--edge) calc(var(--pave) + 16px); }
    .hero-character { --ch: min(34vh, 300px); order: -1; align-self: center; }
    .hero-content { align-self: stretch; width: auto; margin: 0; }
}
'''

def scope(text):
    """prefix every selector with .elementor so theme / Elementor resets can't override the rules"""
    out, i, n = [], 0, len(text)
    def parse(i, in_keyframes=False):
        buf = []
        while i < n:
            while i < n and text[i].isspace():
                i += 1
            if i >= n:
                break
            if text.startswith('/*', i):
                j = text.index('*/', i) + 2; i = j; continue
            if text[i] == '}':
                return ''.join(buf), i + 1
            j = text.index('{', i)
            head = text[i:j].strip()
            if head.startswith('@'):
                inner, i = parse(j + 1, head.startswith('@keyframes'))
                buf.append(head + ' {\n' + inner + '}\n')
            else:
                k = text.index('}', j)
                body = text[j + 1:k]
                i = k + 1
                if in_keyframes or head in (':root', 'html', 'body'):
                    sel = head
                else:
                    sel = ',\n'.join('.elementor ' + s.strip() for s in head.split(','))
                buf.append(sel + ' {' + body + '}\n')
        return ''.join(buf), i
    res, _ = parse(0)
    return res
scoped = scope(css)
# the @keyframes block above contains nested braces-free declarations; sanity check
assert scoped.count('{') == scoped.count('}'), 'unbalanced braces'

STYLE = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@600;800&display=swap" rel="stylesheet">\n<style>\n'
         'html, body { background: #000 !important; }\n.elementor-widget-html, .elementor-widget-html .elementor-widget-container { margin: 0 !important; padding: 0 !important; }\n'
         + scoped + '</style>')

HEADER = '''<header class="site-header">
    <a class="logo" href="/">RONIS</a>
    <nav class="main-nav" aria-label="ניווט ראשי">
        <ul>
            <li><a href="#about">אודות</a></li>
            <li><a href="#projects">פרויקטים</a></li>
            <li><a href="/contact/">יצירת קשר</a></li>
        </ul>
    </nav>
</header>'''

HERO = '''<main class="hero">
    <div class="hero-skyline" aria-hidden="true"></div>
    <div class="hero-pavement" aria-hidden="true"></div>
    <div class="hero-inner">
        <div class="hero-content">
            <h1>מעצב ובונה אתרים</h1>
            <p>אני בונה אתרים שעפים מהר ומביאים לקוחות <span class="nowrap">שתים־עשרה שנה</span> של ניסיון, עיצוב ובנייה.</p>
            <div class="hero-actions">
                <a class="btn btn-primary" href="#projects">צפייה בעבודות &gt;&gt;</a>
                <a class="btn btn-ghost" href="/contact/">בואו נדבר &gt;&gt;</a>
            </div>
        </div>
        <div class="hero-character">
            <img src="%shero-character.png" alt="RONIS בתלבושת גיבור על, עף לעבר הצופה" width="1024" height="1536">
        </div>
    </div>
</main>''' % ASSET_BASE

SCRIPT = '''<script>
(function () {
    var header = document.querySelector('.site-header');
    function markTop() { if (header) header.classList.toggle('at-top', window.scrollY < 8); }
    markTop();
    window.addEventListener('scroll', markTop, { passive: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var hero = document.querySelector('.hero'), ch = document.querySelector('.hero-character');
    if (!hero || !ch) return;
    var mx = 0, my = 0, queued = false;
    function apply() {
        queued = false;
        var sy = Math.min(Math.max(window.scrollY, 0), hero.offsetHeight);
        hero.style.setProperty('--sy', sy.toFixed(1));
        ch.style.setProperty('--mx', mx.toFixed(3));
        ch.style.setProperty('--my', my.toFixed(3));
        ch.style.setProperty('--s', (sy / hero.offsetHeight).toFixed(3));
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(apply); } }
    if (window.matchMedia('(pointer: fine)').matches) {
        hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            my = ((e.clientY - r.top) / r.height - 0.5) * 2;
            queue();
        });
        hero.addEventListener('pointerleave', function () { mx = 0; my = 0; queue(); });
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    queue();
})();
</script>'''

if __name__ == '__main__' and len(sys.argv) > 3 and sys.argv[3] == 'harness':
    # plain HTML page that mimics Elementor's wrapper, for local testing of the HTML-widget parts
    open(sys.argv[4], 'w', encoding='utf-8').write(
        '<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        '<style>.elementor img{height:auto;max-width:100%;border:none;border-radius:0;box-shadow:none}.elementor a{color:#c36;text-decoration:underline}'
        '.elementor h1{font-size:40px;color:#222;margin:0 0 20px}.elementor p{margin-bottom:20px}body{margin:0;background:#fff}</style></head><body>'
        '<div class="elementor elementor-1"><div class="e-con"><div class="elementor-widget elementor-widget-html"><div class="elementor-widget-container">'
        + STYLE + HEADER + '</div></div><div class="elementor-widget elementor-widget-html"><div class="elementor-widget-container">' + HERO + '</div></div>'
        '<div class="elementor-widget elementor-widget-html"><div class="elementor-widget-container">' + SCRIPT + '</div></div></div></div>'
        '<div style="height:1200px;background:#000"></div></body></html>')
    sys.exit(0)

# ---------- Elementor JSON ----------
random.seed(7)
def eid():
    return ''.join(random.choice('0123456789abcdef') for _ in range(7))

def px(v, unit='px'):
    return {"unit": unit, "size": v, "sizes": []}
def box(t, r=None, b=None, l=None, unit='px'):
    r = t if r is None else r; b = t if b is None else b; l = r if l is None else l
    return {"unit": unit, "top": str(t), "right": str(r), "bottom": str(b), "left": str(l), "isLinked": t == r == b == l}

def widget(wtype, settings):
    return {"id": eid(), "elType": "widget", "widgetType": wtype, "settings": settings, "elements": []}
def container(settings, elements=None):
    base = {"content_width": "full", "padding": box(0), "margin": box(0), "flex_gap": {"column": "0", "row": "0", "isLinked": True, "unit": "px"}}
    base.update(settings)
    return {"id": eid(), "elType": "container", "settings": base, "elements": elements or [], "isInner": False}

def font(size, weight, family="Assistant", **extra):
    d = {"typography_typography": "custom", "typography_font_family": family, "typography_font_size": px(size),
         "typography_font_weight": str(weight), "typography_line_height": {"unit": "em", "size": 1.3, "sizes": []}}
    d.update(extra); return d
def heading(title, tag, color, size, weight=800, **extra):
    s = {"title": title, "header_size": tag, "title_color": color, **font(size, weight)}
    s.update(extra); return widget("heading", s)
def text(html, color, size, weight=600, **extra):
    s = {"editor": html, "text_color": color, **font(size, weight)}
    s.update(extra); return widget("text-editor", s)
def html(code):
    return widget("html", {"html": code})

BAR = "selector .elementor-heading-title::after{content:'';display:block;width:64px;height:4px;margin-top:12px;border-radius:2px;background:#eebf00}"
fx = lambda speed: {"motion_fx_motion_fx_scrolling": "yes", "motion_fx_translateY_effect": "yes", "motion_fx_translateY_direction": "negative",
                    "motion_fx_translateY_speed": px(speed), "motion_fx_translateY_affectedRange": {"unit": "%", "size": "", "sizes": {"start": 0, "end": 100}}}
card_style = {"background_background": "classic", "background_color": "rgba(124,123,121,0.12)", "border_border": "solid", "border_width": box(1),
              "border_color": "rgba(255,255,255,0.12)", "border_radius": box(12), "padding": box(28),
              "width": {"unit": "%", "size": 31.5, "sizes": []}, "width_tablet": {"unit": "%", "size": 100, "sizes": []}, "width_mobile": {"unit": "%", "size": 100, "sizes": []},
              "flex_direction": "column", "flex_gap": {"column": "8", "row": "8", "isLinked": True, "unit": "px"}}
row_style = {"flex_direction": "row", "flex_wrap": "wrap", "flex_gap": {"column": "32", "row": "32", "isLinked": True, "unit": "px"}, "flex_direction_mobile": "column"}
section_style = lambda bg: {"content_width": "boxed", "boxed_width": px(1190), "flex_direction": "column", "background_background": "classic", "background_color": bg,
                            "padding": box(96, 24), "padding_mobile": box(64, 20), "flex_gap": {"column": "0", "row": "0", "isLinked": True, "unit": "px"}}
def full_bleed(inner_settings, children):
    return container({"flex_direction": "column", "background_background": "classic", "background_color": inner_settings["bg"]},
                     [container({"content_width": "boxed", "boxed_width": px(1190), "flex_direction": "column", "padding": box(96, 24), "padding_mobile": box(64, 20)}, children)])

def section_head(title, lead):
    return [heading(title, "h2", "#d3d3d3", 48, 800, custom_css=BAR, typography_font_size_mobile=px(36)),
            text("<p>%s</p>" % lead, "#c3c3c3", 24, 600, _margin={"unit": "px", "top": "0", "right": "0", "bottom": "40", "left": "0", "isLinked": False}, typography_font_size_mobile=px(20))]

features = []
for n, (t, d) in enumerate([("עיצוב", "עיצוב נקי וברור שמדבר בשפה של העסק שלכם ומוביל את הגולש לפעולה."),
                            ("בנייה", "קוד קל ומהיר, מותאם לכל מסך, כך שהאתר נטען מיד ועובד בכל מכשיר."),
                            ("תוצאות", "אתר שלא רק יפה אלא מביא פניות ולקוחות חדשים.")], 1):
    features.append(container({**card_style, **fx(n)}, [
        text("<p>0%d</p>" % n, "#eebf00", 20, 800), heading(t, "h3", "#d3d3d3", 28, 600), text("<p>%s</p>" % d, "#c3c3c3", 20, 400)]))

projects = []
for n, (name, kind, c1, c2) in enumerate([("שם הפרויקט", "אתר תדמית לעסק", "#7b0909", "#151515"), ("שם הפרויקט", "חנות אונליין", "#eebf00", "#3a2a00"),
                                          ("שם הפרויקט", "דף נחיתה", "#555555", "#111111")], 1):
    projects.append(container({**card_style, **fx(n), "padding": box(16, 16, 24, 16)}, [
        container({"min_height": px(200), "background_background": "gradient", "background_color": c1, "background_color_b": c2,
                   "background_gradient_type": "linear", "background_gradient_angle": {"unit": "deg", "size": 135, "sizes": []}, "border_radius": box(8),
                   "margin": box(0, 0, 16, 0)}),
        heading(name, "h3", "#d3d3d3", 28, 600), text("<p>%s</p>" % kind, "#c3c3c3", 20, 400)]))

btn = lambda label, url: widget("button", {"text": label, "link": {"url": url, "is_external": "", "nofollow": "", "custom_attributes": ""}, "align": "center",
    "background_color": "#eebf00", "button_text_color": "#000000", "border_radius": box(12), "button_box_shadow_box_shadow_type": "yes",
    "button_box_shadow_box_shadow": {"horizontal": 0, "vertical": 8, "blur": 10, "spread": 0, "color": "rgba(0,0,0,0.1)"},
    "text_padding": box(12, 32), **{"typography_typography": "custom", "typography_font_family": "Assistant", "typography_font_size": px(20), "typography_font_weight": "600"}})

content = [
    container({"flex_direction": "column", "_element_id": "top"}, [html(STYLE + HEADER)]),
    container({"flex_direction": "column", "_element_id": "hero"}, [html(HERO)]),
    container({"_element_id": "about", "flex_direction": "column", "background_background": "classic", "background_color": "#000000"},
              [container({"content_width": "boxed", "boxed_width": px(1190), "flex_direction": "column", "padding": box(96, 24), "padding_mobile": box(64, 20)},
                         section_head("אודות", "שתים־עשרה שנה אני מעצב ובונה אתרים — מהסקיצה הראשונה ועד העלייה לאוויר.") + [container(row_style, features)])]),
    container({"_element_id": "projects", "flex_direction": "column", "background_background": "classic", "background_color": "#0d0d0d"},
              [container({"content_width": "boxed", "boxed_width": px(1190), "flex_direction": "column", "padding": box(96, 24), "padding_mobile": box(64, 20)},
                         section_head("פרויקטים", "מבחר עבודות. (דוגמאות להמחשה — להחליף בפרויקטים אמיתיים.)") + [container(row_style, projects)])]),
    container({"flex_direction": "column", "background_background": "classic", "background_color": "#000000"},
              [container({"content_width": "boxed", "boxed_width": px(1190), "flex_direction": "column", "align_items": "center", "padding": box(96, 24), "padding_mobile": box(64, 20)},
                         [heading("מוכנים להתחיל?", "h2", "#d3d3d3", 48, 800, align="center", typography_font_size_mobile=px(36)),
                          text("<p>ספרו לי על הפרויקט ואחזור אליכם בהקדם.</p>", "#c3c3c3", 24, 600, align="center", _margin={"unit": "px", "top": "12", "right": "0", "bottom": "32", "left": "0", "isLinked": False}),
                          btn("בואו נדבר >>", "/contact/")])]),
    container({"flex_direction": "row", "justify_content": "space-between", "align_items": "center", "background_background": "classic", "background_color": "#000000",
               "border_border": "solid", "border_width": {"unit": "px", "top": "1", "right": "0", "bottom": "0", "left": "0", "isLinked": False}, "border_color": "rgba(255,255,255,0.12)",
               "padding": box(24, 51), "padding_mobile": box(24, 20), "flex_direction_mobile": "column", "flex_gap": {"column": "8", "row": "8", "isLinked": True, "unit": "px"}},
              [heading("RONIS", "div", "#eebf00", 28, 800), text("<p>© 2026 כל הזכויות שמורות</p>", "#c3c3c3", 18, 400)]),
    container({"flex_direction": "column"}, [html(SCRIPT)]),
]

template = {"version": "0.4", "title": "RONIS - דף הבית", "type": "page", "content": content,
            "page_settings": {"template": "elementor_canvas", "hide_title": "yes", "background_background": "classic", "background_color": "#000000"}}
json.dump(template, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote', OUT, len(json.dumps(template, ensure_ascii=False)) // 1024, 'KB; top-level containers:', len(content))
