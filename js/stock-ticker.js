/**
 * STOCK-TICKER.JS
 * -----------------------------------------------------------------------
 * Loads stock quotes through the Cloudflare Worker defined in config.js.
 * Supports switching between Biotech and Health Tech watchlists.
 * Uses the latest cached quote from the Worker and falls back to
 * sample data only if the live endpoint fails.
 * -----------------------------------------------------------------------
 */

(function stockTickerModule() {
  const root = document.querySelector("[data-ticker-root]");

  if (!root) {
    console.warn("Stock ticker root not found.");
    return;
  }

  if (typeof SITE_CONFIG === "undefined") {
    console.error("SITE_CONFIG is not loaded.");
    return;
  }

  const listEl = root.querySelector("[data-ticker-list]");
  const updatedEl = root.querySelector("[data-ticker-updated]");
  const noteEl = root.querySelector("[data-ticker-note]");
  const tabs = root.querySelectorAll("[data-ticker-tab]");

  if (!listEl) {
    console.error("Stock ticker list element not found.");
    return;
  }

  let activeCategory = "biotech";


  // ---------------------------------------------------------------------
  // FALLBACK SAMPLE DATA
  // ---------------------------------------------------------------------

  function sampleQuote(symbol) {
    let hash = 0;

    for (const char of symbol) {
      hash = (hash * 31 + char.charCodeAt(0)) % 9973;
    }

    const base = 40 + (hash % 400);
    const changePct = ((hash % 700) / 100) - 3.5;

    return {
      price: base,
      changePct,
      isSample: true,
      cachedAt: null
    };
  }


  // ---------------------------------------------------------------------
  // FETCH QUOTE FROM CLOUDFLARE WORKER
  // ---------------------------------------------------------------------

  async function fetchQuote(symbol) {
    try {
      const url =
        `${SITE_CONFIG.stockApiUrl}/?symbol=${encodeURIComponent(symbol)}`;

      const res = await fetch(url, {
        method: "GET",
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error(`Stock API returned ${res.status}`);
      }

      const data = await res.json();

      if (
        !data ||
        typeof data.price !== "number" ||
        data.price <= 0
      ) {
        throw new Error("Invalid quote data");
      }

      return {
        price: data.price,
        changePct:
          typeof data.changePct === "number"
            ? data.changePct
            : 0,

        isSample: false,

        cachedAt:
          typeof data.cachedAt === "number"
            ? data.cachedAt
            : null
      };

    } catch (err) {
      console.warn(
        `Could not load live quote for ${symbol}. Using sample data.`,
        err
      );

      return sampleQuote(symbol);
    }
  }


  // ---------------------------------------------------------------------
  // FORMATTING
  // ---------------------------------------------------------------------

  function formatPrice(price) {
    return `$${price.toFixed(2)}`;
  }

  function formatChange(changePct) {
    const sign = changePct >= 0 ? "+" : "";

    return `${sign}${changePct.toFixed(2)}%`;
  }

  function formatUpdatedTime(timestamp) {
    if (!timestamp) {
      return null;
    }

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }


  // ---------------------------------------------------------------------
  // CREATE STOCK ROWS
  // ---------------------------------------------------------------------

  function createRows(companies) {
    listEl.innerHTML = companies
      .map(
        company => `
          <div class="ticker-row" data-symbol="${company.symbol}">
            <div class="symbol">
              ${company.symbol}
              <span class="name">${company.name}</span>
            </div>

            <div class="price">
              Loading...
            </div>

            <div class="change">
              —
            </div>
          </div>
        `
      )
      .join("");
  }


  // ---------------------------------------------------------------------
  // RENDER CATEGORY
  // ---------------------------------------------------------------------

  async function renderCategory(category) {
    const companies =
      SITE_CONFIG.stockWatchlists[category];

    if (!companies || companies.length === 0) {
      listEl.innerHTML =
        `<p class="ticker-error">No companies found.</p>`;

      return;
    }

    createRows(companies);

    if (updatedEl) {
      updatedEl.textContent = "Loading latest quotes...";
    }

    const quotes = await Promise.all(
      companies.map(company =>
        fetchQuote(company.symbol)
      )
    );

    let sampleDataUsed = false;
    let newestCachedAt = null;

    quotes.forEach((quote, index) => {
      const company = companies[index];

      const row = listEl.querySelector(
        `[data-symbol="${company.symbol}"]`
      );

      if (!row) {
        return;
      }

      const priceEl =
        row.querySelector(".price");

      const changeEl =
        row.querySelector(".change");

      priceEl.textContent =
        formatPrice(quote.price);

      changeEl.textContent =
        formatChange(quote.changePct);

      changeEl.classList.remove(
        "is-up",
        "is-down"
      );

      if (quote.changePct >= 0) {
        changeEl.classList.add("is-up");
      } else {
        changeEl.classList.add("is-down");
      }

      if (quote.isSample) {
        sampleDataUsed = true;
      }

      if (
        quote.cachedAt &&
        (!newestCachedAt || quote.cachedAt > newestCachedAt)
      ) {
        newestCachedAt = quote.cachedAt;
      }
    });


    // -------------------------------------------------------------------
    // STATUS
    // -------------------------------------------------------------------

    if (updatedEl) {
      if (sampleDataUsed) {
        updatedEl.textContent =
          "Some quotes unavailable";
      } else {
        const time =
          formatUpdatedTime(newestCachedAt);

        updatedEl.textContent =
          time
            ? `Latest pull: ${time}`
            : "Live market data";
      }
    }


    if (noteEl) {
      if (sampleDataUsed) {
        noteEl.textContent =
          "Some live quotes could not be loaded. Sample figures are shown where necessary.";
      } else {
        noteEl.textContent =
          "Latest cached market data. Quotes refresh approximately every 15 minutes.";
      }
    }
  }


  // ---------------------------------------------------------------------
  // TAB SWITCHING
  // ---------------------------------------------------------------------

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const category =
        tab.dataset.tickerTab;

      if (
        !category ||
        !SITE_CONFIG.stockWatchlists[category]
      ) {
        console.warn(
          `Unknown ticker category: ${category}`
        );

        return;
      }

      tabs.forEach(button =>
        button.classList.remove("is-active")
      );

      tab.classList.add("is-active");

      activeCategory = category;

      renderCategory(activeCategory);
    });
  });


  // ---------------------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------------------

  renderCategory(activeCategory);


  // ---------------------------------------------------------------------
  // AUTOMATIC REFRESH
  // ---------------------------------------------------------------------

  setInterval(
    () => {
      renderCategory(activeCategory);
    },
    SITE_CONFIG.stockRefreshIntervalMs
  );

})();
