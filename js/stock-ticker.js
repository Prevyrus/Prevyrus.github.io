/**
 * STOCK-TICKER.JS
 * -----------------------------------------------------------------------
 * Renders the two watchlists defined in config.js (biotech / health-tech)
 * and, if a Finnhub API key is present, keeps them updated with live
 * quotes on a timer. Without a key, it shows clearly-labeled sample data
 * so the layout is visible immediately.
 * -----------------------------------------------------------------------
 */

(function stockTickerModule() {
  const root = document.querySelector("[data-ticker-root]");
  if (!root) return;

  const listEl = root.querySelector("[data-ticker-list]");
  const updatedEl = root.querySelector("[data-ticker-updated]");
  const tabs = root.querySelectorAll("[data-ticker-tab]");
  const noteEl = root.querySelector("[data-ticker-note]");

  let activeCategory = "biotech";
  const hasKey = Boolean(SITE_CONFIG.finnhubApiKey && SITE_CONFIG.finnhubApiKey.trim());

  // Deterministic sample data (no key configured yet) — clearly labeled
  // as sample so it's never mistaken for a live price.
  function sampleQuote(symbol) {
    let hash = 0;
    for (const ch of symbol) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
    const base = 40 + (hash % 400);
    const changePct = ((hash % 700) / 100) - 3.5; // -3.5% .. +3.5%
    return { price: base, changePct };
  }

  async function fetchQuote(symbol) {
    if (!hasKey) return sampleQuote(symbol);
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${SITE_CONFIG.finnhubApiKey}`
      );
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      if (!data || typeof data.c !== "number" || data.c === 0) throw new Error("no data");
      const price = data.c;
      const changePct = data.pc ? ((data.c - data.pc) / data.pc) * 100 : 0;
      return { price, changePct };
    } catch (err) {
      console.warn(`Ticker: falling back to sample data for ${symbol}`, err);
      return sampleQuote(symbol);
    }
  }

  function formatPrice(p) {
    return `$${p.toFixed(2)}`;
  }
  function formatChange(pct) {
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
  }

  async function renderCategory(category) {
    const companies = SITE_CONFIG.stockWatchlists[category] || [];
    listEl.innerHTML = companies
      .map(
        (c) => `
      <div class="ticker-row" data-symbol="${c.symbol}">
        <div class="symbol">${c.symbol}<span class="name">${c.name}</span></div>
        <div class="price">…</div>
        <div class="change">…</div>
      </div>`
      )
      .join("");

    const quotes = await Promise.all(companies.map((c) => fetchQuote(c.symbol)));

    quotes.forEach((q, i) => {
      const row = listEl.querySelector(`[data-symbol="${companies[i].symbol}"]`);
      if (!row) return;
      row.querySelector(".price").textContent = formatPrice(q.price);
      const changeEl = row.querySelector(".change");
      changeEl.textContent = formatChange(q.changePct);
      changeEl.classList.toggle("is-up", q.changePct >= 0);
      changeEl.classList.toggle("is-down", q.changePct < 0);
    });

    updatedEl.textContent = hasKey
      ? `Updated ${new Date().toLocaleTimeString()}`
      : "Sample data — add a Finnhub API key in js/config.js for live quotes";

    if (noteEl) {
      noteEl.textContent = hasKey
        ? "Live quotes via Finnhub, refreshed automatically."
        : "Showing sample figures. Add your free Finnhub API key in js/config.js to switch to live quotes.";
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      activeCategory = tab.dataset.tickerTab;
      renderCategory(activeCategory);
    });
  });

  renderCategory(activeCategory);
  setInterval(() => renderCategory(activeCategory), SITE_CONFIG.stockRefreshIntervalMs);
})();
