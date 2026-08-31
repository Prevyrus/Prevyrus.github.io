/**
 * CONFIG.JS
 * -----------------------------------------------------------------------
 * This is the ONE file you edit to customize the data-driven modules.
 * Everything else (ticker rendering, news rendering) reads from here.
 * -----------------------------------------------------------------------
 */

const SITE_CONFIG = {

  // ---------------------------------------------------------------------
  // STOCK TICKER
  // ---------------------------------------------------------------------
  // Data source: Finnhub.io (free tier: 60 calls/min, no credit card).
  // 1. Create a free account at https://finnhub.io/register
  // 2. Copy your API key from the dashboard
  // 3. Paste it below between the quotes.
  // Until you add a key, the ticker shows sample data so you can see the
  // layout working.
  finnhubApiKey: "", // <-- paste your free Finnhub API key here

  // Two watchlists, capped at 10 tickers each per your spec.
  // Note: Google Health and Amazon Health aren't separately publicly
  // traded — they're divisions of Alphabet and Amazon — so those two
  // rows track the parent company stock and are labeled accordingly.
  stockWatchlists: {
    biotech: [
      { symbol: "MRNA", name: "Moderna" },
      { symbol: "REGN", name: "Regeneron Pharmaceuticals" },
      { symbol: "VRTX", name: "Vertex Pharmaceuticals" },
      { symbol: "ILMN", name: "Illumina" },
      { symbol: "GILD", name: "Gilead Sciences" },
      { symbol: "BIIB", name: "Biogen" },
      { symbol: "AMGN", name: "Amgen" },
      { symbol: "BNTX", name: "BioNTech" },
      { symbol: "CRSP", name: "CRISPR Therapeutics" },
      { symbol: "EXAS", name: "Exact Sciences" }
    ],
    healthTech: [
      { symbol: "NVDA", name: "NVIDIA" },
      { symbol: "GOOGL", name: "Alphabet (Google Health)" },
      { symbol: "AMZN", name: "Amazon (Amazon Health)" },
      { symbol: "MSFT", name: "Microsoft (Health & Cloud)" },
      { symbol: "ISRG", name: "Intuitive Surgical" },
      { symbol: "TDOC", name: "Teladoc Health" },
      { symbol: "DXCM", name: "Dexcom" },
      { symbol: "VEEV", name: "Veeva Systems" },
      { symbol: "PHR", name: "Phreesia" },
      { symbol: "IBM", name: "IBM (Watson Health legacy)" }
    ]
  },

  // How often to refresh quotes, in milliseconds. Free tier allows plenty
  // of headroom at this rate for a 20-symbol watchlist.
  stockRefreshIntervalMs: 60000,

  // ---------------------------------------------------------------------
  // NEWS / RESEARCH FEED
  // ---------------------------------------------------------------------
  // Two sources, no API key required for either:
  //
  // 1. PubMed (NCBI E-utilities) — real published research. Free, public,
  //    no key needed, CORS-enabled. Good for the "oncology research" ask.
  //
  // 2. RSS feeds from industry publications, proxied through rss2json.com
  //    (free tier, no key needed for light traffic) since browsers can't
  //    fetch raw RSS cross-origin.
  research: {
    // PubMed search term — edit this to change what shows up.
    pubmedQuery: "(oncology[Title]) OR (cancer genomics[Title]) OR (precision oncology[Title])",
    maxResults: 6
  },

  industryNewsFeeds: [
    { name: "STAT News",        url: "https://www.statnews.com/feed/" },
    { name: "Endpoints News",   url: "https://endpts.com/feed/" },
    { name: "FierceBiotech",    url: "https://www.fiercebiotech.com/rss.xml" }
  ],
  maxIndustryItemsPerFeed: 3,

  newsRefreshIntervalMs: 15 * 60000 // refresh every 15 minutes
};
