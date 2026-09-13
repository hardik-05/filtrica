# Filtrica — Air Filtration Company Website

A static, dependency-free marketing/informational site for an industrial &
cleanroom air-filtration company: hero, about, a multi-stage filtration
technology diagram, products, industries served, testimonials, and a
contact/quote-request form. Supports light and dark mode.

**Stack:** plain HTML + CSS + vanilla JS. No framework, no build step, no
`node_modules`, nothing to update or go stale. Any static host serves it as-is.

**Live:** https://filtrica.onrender.com (Render static site, auto-deploys on
every push to this branch).

## Preview locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL.

## One manual step: enable the contact form

The form sends mail with [Web3Forms](https://web3forms.com) — a free,
no-backend form relay. Because it needs to be tied to *your* inbox, this is
the one step only you can do (no API key can be generated on your behalf
without access to your email):

1. Go to https://web3forms.com and create a free access key using the inbox
   you want quote requests delivered to.
2. Open `config.js` and replace the placeholder:
   ```js
   window.FILTRICA_CONFIG = {
     WEB3FORMS_ACCESS_KEY: "paste-your-real-key-here",
   };
   ```
3. Commit and push (or redeploy) — no other code changes are needed.

Until a real key is set, the form shows a clear inline message instead of
silently failing.

The form also includes a hidden honeypot field to cut down on bot spam
without adding a CAPTCHA.

## Deployment

Live on **Render** as a static site (https://filtrica.onrender.com), linked
directly to this GitHub repo/branch — auto-deploy is on, so every push
redeploys automatically with no further action needed. No build command is
actually required (it's plain static files); Render's static-site config
just needs a command to run (a no-op `echo`) and a publish path of `.` (repo
root).

To move it or add another host later, this is a directory of plain static
files, so any static host works the same way (Vercel, Netlify, GitHub Pages,
Cloudflare Pages, S3+CDN, etc.) — point the host at the repo root with no
build command.

## Replacing placeholder content

Everything you'd want to personalize is a plain string in `index.html`, and
the placeholders that must not go live as-is are wrapped in `[brackets]`:

- Company name ("Filtrica"), tagline and copy in the `<header>`, `#home` and
  `#about` sections.
- `#contact` section: `[Street Address, City, Country]`, `[+1 000 000 0000]`,
  and the `info@filtrica.example` address/link (this is only a page-footer
  display address — it is **not** where form submissions go; that's whatever
  inbox you tied to your Web3Forms key above).
- Testimonials and the "What Our Customers Say" section are generic,
  role-only sample copy — swap in real customer quotes when you have them.
- Social link(s) in the contact card (`href="#"` placeholders).

No images were sourced from external stock-photo services — every visual
(hero graphic, facility illustration, filtration-stage icons) is a hand-built
inline SVG using the site's own color tokens, so it renders crisply at any
size, needs no image hosting or licensing, and re-themes automatically for
dark mode.

## Project structure

```
index.html   – all page content/sections
styles.css   – design tokens (light + dark) and all component styles
script.js    – theme toggle, mobile nav, scroll-spy, reveal animations, form submit
config.js    – the one setting you must fill in (Web3Forms access key)
favicon.svg  – site icon
robots.txt   – allow-all crawling
```
