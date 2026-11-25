# Tarn: concept site

A portfolio concept for **Tarn**, a fictional AI personal-finance advisor. It reproduces the structure, layout, proportions, type scale and motion of the reference site (useorigin.com). The name, logo, colours, fonts, copy, images and code are all new. Tarn is not a real company or service.

Static HTML, CSS and JS with no build step. All paths are relative, so the site works at the root of a GitHub Pages subdomain. The one exception is `404.html`, which uses root paths (`/`) because GitHub Pages serves it from any missing address. The social meta (`og:image`, `og:url`) uses absolute URLs on the planned domain, `https://tarn.wolfbc.art/` (see `tools/deploy-subdomains.sh`); change them if the site moves.

## Pages

| Path | What it is |
|---|---|
| `index.html` | Home: floating nav, hero with a glass phone, principles panel, bank wordmarks, feature carousel, alerts, three method rows, households, Ask Tarn chat phone, testimonials, final CTA, footer |
| `pricing/` | Hero, 3 info cards, pricing panel with a yearly/monthly switch, comparison table (3 accordion groups), moments strip, FAQ, CTA |
| `spending/` | Hero with a self-typing question field, 6 UI tiles, the week's 7 renewals, budget (bars and gauge), Ask Tarn answers, FAQ, CTA |
| `about/` | Type-only hero, 3 focus cards, investor wordmarks, Join us, CTA |
| `404.html` | Not-found page |

There are no product pages beyond Spending. The "Product" menu lists Spending plus home sections (`/#features`, `/#together`), as COPY §0 asks.

## Fonts (Google Fonts, `display=swap`)
- **Newsreader** 300/400 and italic 300, optical size 72: display headings. The italic is used in two home headings (hero and final CTA) and at most once per inner-page H1.
- **Geist** 300/400/500: body text, UI and the drawn wordmarks (no heavier weight is used, so nothing is synthesised).
- **Geist Mono** 400/500: nav, buttons and labels, in uppercase at 12px.

## Libraries
None. GSAP wasn't needed: the insight slider, alert stack, carousel, marquees and chat typing use CSS plus a small `js/site.js`, with IntersectionObserver to pause loops that are off screen.

## What reproduces the reference
- Layout system: floating nav 56px tall, r12, inset 24/16 with backdrop blur; panels inset 32px with r24; two columns of 676+24+676; text widths 420 and 980; container widths 1400 and 1200.
- Home section order and measured heights at 1440 (hero 1170, principles 497, logos about 210 with its caption, features about 1110, alerts 900, method 3×631, households 912, ask 1678, CTA 546, footer about 780). Page height is about 10,890px against the reference's 10,798px.
- Type scale 96/80/48/36 · 20/16/14/12; buttons 48px tall with r8; breakpoints at 991, 767 and 479.
- Motion:
  - Two-step hero entrance with blur, and word-by-word reveal of the phone headline.
  - Feature carousel that autoplays every 5s, goes there and back, and has a real pause button.
  - Alert pills that stack every 3s.
  - Pulsing live dots, horizontal and vertical marquees, a dot canvas that lights up under the cursor, and a progressive blur on the households photo.
  - The pricing switch with a spring, the comparison accordion, FAQ `<details>`, and a moments strip that drifts with scroll.

## What is original (and the reference's signature effects we changed)
- Identity: Tarn name, the T-on-a-ripple logo and favicon (SVG), and the palette. The palette is black `#050505`, white at five alphas, and three accents: lake teal `#35c2a0`, ember `#ff6b57` and dawn gold `#f0c162`. There is no violet anywhere.
- The reference's falling card stack in the hero phone is now a sideways slider of 4 glass insight cards, changing every 3.5s.
- The award laurels are now 4 principle seals framed by two concentric ripple arcs (no leaves).
- Employer logos are now 8 fictional bank wordmarks, drawn as SVG text.
- Testimonials have no stars: each is a drawn quote mark, the quote, and a name with a city.
- The reference's Lottie chat is now an HTML/CSS phone. The conversation is on screen from the start; each loop dims it, types the question again and replays Tarn's answers. Three suggested questions sit under the greeting (hidden below 480px, where the phone is too small for them).
- The aurora and the orbiting blobs use teal and gold, kept low.

## Fictional content is labelled where it appears
Short 12px captions sit next to the bank wordmarks, the feature carousel (figures), the testimonials, the Spending tiles, the pricing panel and the investor row. The legal footer repeats it in full.

## Buttons that would need a real product
"Log in", "iOS app", "Android app", the three plan buttons and the seven "Review" buttons are `<button>`s. A click shows a short line in a `role="status"` region next to them (or in a small notice at the bottom of the screen for the nav), saying that Tarn is a concept. "Write to us" opens `mailto:join@tarn.example`. Footer items without a page are plain grey text, not links. There are no social links.

## Assets
Images are only the ones supplied in `assets/`, copied to `app/assets/`. The home hero photo is a CSS background (preloaded, described for screen readers in a hidden line) so it sits behind the hero column the way the reference's video does. `assets/hero-lake-1600.webp` is a 1600px copy of the same photo (99 KB instead of 254 KB) served below 768px. `assets/og.jpg` is a 1200×630 crop of `hero-lake.webp` for social sharing.

Drawn in HTML/SVG instead of images:
- both phone frames
- all product UI: feature cards, account cards, gauge, flow card, budget bars and day cards
- the logo
- the seals
- the fictional bank and investor wordmarks
- the icons
- the pricing "aura" background, a CSS gradient

## Accessibility
- One h1 per page with no skipped heading levels, a skip link, a visible teal focus ring, and `aria-expanded` on the menu, dropdown and accordions.
- Text over photographs is held to AA with local scrims (hero copy, phone glass, method tiles, households, pricing switch), measured pixel by pixel against the real background.
- **Pause motion**: a toggle in every footer (and a second one that appears on Tab right after "Skip to content") pauses every loop on the site: CSS animations, the insight slider, the alert stack, the chat phone and the carousel autoplay. The choice is remembered across pages. The insight slider and the alert stack also hold while the pointer or focus is on them.
- The pricing switch is `role="switch"`, named by its visible label. The comparison table has plan names as column headers for screen readers.
- The phone menu locks page scroll and makes the rest of the page `inert` while open; Esc closes it.
- Reading text is at least 60% white on solid surfaces, which passes AA. Legal text was raised from the brief's 38% to 60% for the same reason.
- Under `prefers-reduced-motion`, every loop stops and all content is visible, including all six alerts.
- No horizontal scroll at 320px; footer and menu tap targets are at least 44px below 992px.

## Before publishing
The external drive this lives on creates AppleDouble files (`._*`). Remove them from `app/` before deploying: `find app -name '._*' -delete`.
