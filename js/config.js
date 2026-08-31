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

  // Refresh browser display every 15 minutes.
  // Cloudflare also caches each quote for 15 minutes.
  stockRefreshIntervalMs: 15 * 60000,

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

  newsRefreshIntervalMs: 15 * 60000
};
