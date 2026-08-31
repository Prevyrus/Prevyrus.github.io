/**
 * NEWS-FEED.JS
 * -----------------------------------------------------------------------
 * Two feeds, both keyless:
 *   1. PubMed (NCBI E-utilities) — recent oncology / precision-oncology
 *      research papers. esearch -> get PMIDs, esummary -> get details.
 *   2. Industry RSS (STAT News, Endpoints, FierceBiotech), proxied
 *      through rss2json.com since browsers can't fetch raw RSS
 *      cross-origin.
 * -----------------------------------------------------------------------
 */

(function newsFeedModule() {
  const grid = document.querySelector("[data-news-grid]");
  if (!grid) return;

  function cardHtml({ source, date, title, summary, url }) {
    return `
      <article class="glass news-card" data-reveal>
        <div class="source-row"><span>${source}</span><span>${date}</span></div>
        <h4>${title}</h4>
        <p>${summary}</p>
        <a href="${url}" target="_blank" rel="noopener">Read more</a>
      </article>`;
  }

  function loadingHtml(msg) {
    return `<p class="news-loading">${msg}</p>`;
  }
  function errorHtml(msg) {
    return `<p class="news-error">${msg}</p>`;
  }

  async function fetchPubMed() {
    const { pubmedQuery, maxResults } = SITE_CONFIG.research;
    const base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
    const searchUrl = `${base}/esearch.fcgi?db=pubmed&retmode=json&sort=date&retmax=${maxResults}&term=${encodeURIComponent(
      pubmedQuery
    )}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const ids = searchData?.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = `${base}/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    return ids
      .map((id) => summaryData.result?.[id])
      .filter(Boolean)
      .map((item) => ({
        source: item.source || "PubMed",
        date: item.pubdate || "",
        title: item.title || "Untitled",
        summary: (item.authors || []).slice(0, 3).map((a) => a.name).join(", ") || "View on PubMed",
        url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`
      }));
  }

  async function fetchIndustryFeeds() {
    const feeds = SITE_CONFIG.industryNewsFeeds;
    const perFeed = SITE_CONFIG.maxIndustryItemsPerFeed;
    const results = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const proxied = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
          const res = await fetch(proxied);
          const data = await res.json();
          if (data.status !== "ok") throw new Error("feed error");
          return data.items.slice(0, perFeed).map((item) => ({
            source: feed.name,
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "",
            title: item.title,
            summary: (item.description || "").replace(/<[^>]+>/g, "").slice(0, 140) + "…",
            url: item.link
          }));
        } catch (err) {
          console.warn(`News: could not load feed ${feed.name}`, err);
          return [];
        }
      })
    );
    return results.flat();
  }

  async function render() {
    grid.innerHTML = loadingHtml("Loading recent research and industry news…");
    try {
      const [research, industry] = await Promise.all([
        fetchPubMed().catch((err) => {
          console.warn("News: PubMed fetch failed", err);
          return [];
        }),
        fetchIndustryFeeds()
      ]);

      const combined = [...research, ...industry];
      if (combined.length === 0) {
        grid.innerHTML = errorHtml(
          "Couldn't load live articles right now — this needs an active internet connection in the browser viewing the page."
        );
        return;
      }
      grid.innerHTML = combined.map(cardHtml).join("");

      // re-run reveal animation for freshly-injected cards, if GSAP is active
      if (document.documentElement.classList.contains("js-ready") && typeof gsap !== "undefined") {
        gsap.utils.toArray("[data-news-grid] [data-reveal]").forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" }
          });
        });
      } else {
        grid.querySelectorAll("[data-reveal]").forEach((el) => {
          el.style.opacity = 1;
          el.style.transform = "none";
        });
      }
    } catch (err) {
      console.error("News: render failed", err);
      grid.innerHTML = errorHtml("Something went wrong loading the news feed.");
    }
  }

  render();
  setInterval(render, SITE_CONFIG.newsRefreshIntervalMs);
})();
