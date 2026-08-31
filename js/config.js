/**
 * CONFIG.JS
 * -----------------------------------------------------------------------
 * Central configuration for the site's data-driven modules.
 * Stock data is fetched through a Cloudflare Worker so the Finnhub API
 * key stays private.
 * -----------------------------------------------------------------------
 */

const SITE_CONFIG = {

  // ---------------------------------------------------------------------
  // STOCK TICKER
  // ---------------------------------------------------------------------

  stockApiUrl:
    "https://portfolio-stocks.davidandresgallegos.workers.dev",

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

  // Browser refresh interval.
  // 15 minutes = 15 × 60 × 1000 milliseconds.
  stockRefreshIntervalMs: 15 * 60 * 1000,

  // ---------------------------------------------------------------------
  // NEWS / RESEARCH FEED
  // ---------------------------------------------------------------------

  research: {
    pubmedQuery:
      "(oncology[Title]) OR (cancer genomics[Title]) OR (precision oncology[Title])",

    maxResults: 6
  },

  industryNewsFeeds: [
    {
      name: "STAT News",
      url: "https://www.statnews.com/feed/"
    },
    {
      name: "Endpoints News",
      url: "https://endpts.com/feed/"
    },
    {
      name: "FierceBiotech",
      url: "https://www.fiercebiotech.com/rss.xml"
    }
  ],

  maxIndustryItemsPerFeed: 3,

  // Refresh news feed every 15 minutes.
  newsRefreshIntervalMs: 15 * 60 * 1000
};
