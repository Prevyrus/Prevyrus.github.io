# David Gallegos — Portfolio Site

Modular, no-build-step site. Deploys straight to GitHub Pages — just push
these files to your repo root (or a folder, if you configure Pages that way).

## Structure

```
index.html            All page markup, organized in commented sections
css/
  variables.css        Color, type, spacing tokens — change the look from here
  base.css              Reset + the animated background layer
  layout.css            Nav, sections, grids
  components.css         Buttons, cards, tags, ticker + news widget styles
  animations.css          Reveal-on-scroll hook class
js/
  config.js              <-- EDIT THIS for API keys, watchlists, news sources
  animations.js           GSAP scroll-reveal + background parallax
  stock-ticker.js          Renders + refreshes the Markets section
  news-feed.js             Renders + refreshes the Research feed section
  main.js                  Mobile nav + active-link highlighting
```

Adding a new section: copy an existing `<section class="section" ...>` block
in `index.html`, add `data-reveal` to the elements you want to animate in,
and add a nav link. No other file needs to change.

## Making the ticker go live

1. Create a free account at https://finnhub.io/register (no card required).
2. Copy the API key from your Finnhub dashboard.
3. Open `js/config.js` and paste it into `finnhubApiKey: ""`.
4. Reload the page — quotes switch from sample data to live automatically.

Edit the `stockWatchlists` arrays in the same file to change which
companies are tracked (capped at 10 per category, per your spec). Note:
Google Health and Amazon Health aren't separately traded stocks, so those
rows track the parent company (GOOGL, AMZN) and are labeled as such.

## The research feed

No API key needed for either source:

- **PubMed** (`research.pubmedQuery` in config.js) — edit the search
  string to change which papers show up. Currently tuned to oncology /
  precision oncology / cancer genomics.
- **Industry RSS** (`industryNewsFeeds` in config.js) — add or remove
  publications by RSS URL. These are proxied through the free
  rss2json.com service since browsers can't fetch raw RSS cross-origin.
  Their free tier has a daily request cap; if you outgrow it, sign up for
  a free rss2json API key and append `&api_key=...` to the proxied URL
  inside `news-feed.js`.

## Animation

Scroll reveals and the background parallax are handled by GSAP +
ScrollTrigger (loaded via CDN in `index.html`, no install needed). If
someone has "reduce motion" turned on at the OS level, everything appears
instantly with no animation — that's handled automatically in
`animations.js`.

## Deploying

This is a static site — commit and push to your GitHub Pages repo, no
build step required.
