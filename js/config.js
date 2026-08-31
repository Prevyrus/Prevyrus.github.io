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
  // STOCK WATCHLIST
  // ---------------------------------------------------------------------

  stockApiUrl:
    "https://portfolio-stocks.davidandresgallegos.workers.dev",

  stockWatchlists: {
    usBiotech: [
      { symbol: "LLY", name: "Eli Lilly" },
      { symbol: "JNJ", name: "Johnson & Johnson" },
      { symbol: "ABBV", name: "AbbVie" },
      { symbol: "MRK", name: "Merck" },
      { symbol: "AMGN", name: "Amgen" }
    ],

    globalBiotech: [
      { symbol: "RHHBY", name: "Roche" },
      { symbol: "NVS", name: "Novartis" },
      { symbol: "AZN", name: "AstraZeneca" },
      { symbol: "NVO", name: "Novo Nordisk" },
      { symbol: "SNY", name: "Sanofi" }
    ]
  },

  // Browser asks the Worker for the latest cached values every 15 minutes.
  stockRefreshIntervalMs: 15 * 60 * 1000,

  // ---------------------------------------------------------------------
  // RESEARCH / NEWS FEED
  // ---------------------------------------------------------------------
  // Exactly 10 items total:
  //   5 oncology / biotech
  //   5 health technology / AI / computing
  //
  // Both categories use PubMed/NCBI, so no secret API key is required.

  researchFeeds: [
    {
      key: "oncologyBiotech",
      label: "Oncology & Biotech",
      maxResults: 5,
      query:
        "(cancer genomics[Title/Abstract] OR precision oncology[Title/Abstract] OR biotechnology[Title/Abstract] OR cancer therapy[Title/Abstract])"
    },

    {
      key: "healthTechnology",
      label: "Health Technology & AI",
      maxResults: 5,
      query:
        "(artificial intelligence[Title/Abstract] OR machine learning[Title/Abstract] OR GPU[Title/Abstract] OR deep learning[Title/Abstract]) AND (healthcare[Title/Abstract] OR medicine[Title/Abstract] OR medical imaging[Title/Abstract] OR genomics[Title/Abstract])"
    }
  ],

  // Refresh research feed every 30 minutes.
  newsRefreshIntervalMs: 30 * 60 * 1000
};
