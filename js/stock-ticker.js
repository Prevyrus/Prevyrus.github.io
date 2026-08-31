/**
 * STOCK-TICKER.JS
 * -----------------------------------------------------------------------
 * Loads stock quotes through the Cloudflare Worker.
 * Displays the selected watchlist immediately on page load.
 * Refreshes approximately every 15 minutes.
 * -----------------------------------------------------------------------
 */

(function () {
  const root = document.querySelector("[data-ticker-root]");
  const listEl = document.querySelector("[data-ticker-list]");
  const updatedEl = document.querySelector("[data-ticker-updated]");
  const noteEl = document.querySelector("[data-ticker-note]");
  const tabs = document.querySelectorAll("[data-ticker-tab]");

  if (!root || !listEl) {
    console.error("Stock ticker HTML elements not found.");
    return;
  }

  if (typeof SITE_CONFIG === "undefined") {
    console.error("SITE_CONFIG is not available.");
    return;
  }

  let activeCategory = "biotech";

  // --------------------------------------------------
  // FETCH ONE STOCK
  // --------------------------------------------------

  async function fetchQuote(symbol) {
    const url =
      `${SITE_CONFIG.stockApiUrl}/?symbol=${encodeURIComponent(symbol)}`;

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Stock API returned ${response.status} for ${symbol}`
      );
    }

    const data = await response.json();

    if (
      typeof data.price !== "number" ||
      typeof data.changePct !== "number"
    ) {
      throw new Error(
        `Invalid stock data returned for ${symbol}`
      );
    }

    return data;
  }

  // --------------------------------------------------
  // CREATE ROW
  // --------------------------------------------------

  function createRow(company) {
    return `
      <div class="ticker-row" data-symbol="${company.symbol}">

        <div class="symbol">
          ${company.symbol}

          <span class="name">
            ${company.name}
          </span>
        </div>

        <div class="price">
          Loading...
        </div>

        <div class="change">
          —
        </div>

      </div>
    `;
  }

  // --------------------------------------------------
  // RENDER WATCHLIST
  // --------------------------------------------------

  async function renderCategory(category) {
    console.log("Rendering stock category:", category);

    const companies =
      SITE_CONFIG.stockWatchlists[category];

    if (!companies) {
      console.error(
        `Stock category does not exist: ${category}`
      );

      return;
    }

    // Immediately create visible rows.
    listEl.innerHTML =
      companies.map(createRow).join("");

    if (updatedEl) {
      updatedEl.textContent =
        "Loading latest market data...";
    }

    if (noteEl) {
      noteEl.textContent =
        "Retrieving latest available quotes...";
    }

    // Fetch stocks individually so one failed company
    // does not break the entire watchlist.
    const results = await Promise.allSettled(
      companies.map(company =>
        fetchQuote(company.symbol)
      )
    );

    let successfulQuotes = 0;

    results.forEach((result, index) => {
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

      if (result.status === "fulfilled") {
        const quote = result.value;

        successfulQuotes++;

        priceEl.textContent =
          `$${quote.price.toFixed(2)}`;

        const sign =
          quote.changePct >= 0 ? "+" : "";

        changeEl.textContent =
          `${sign}${quote.changePct.toFixed(2)}%`;

        changeEl.classList.remove(
          "is-up",
          "is-down"
        );

        if (quote.changePct >= 0) {
          changeEl.classList.add("is-up");
        } else {
          changeEl.classList.add("is-down");
        }

      } else {
        console.error(
          `Could not load ${company.symbol}:`,
          result.reason
        );

        priceEl.textContent =
          "Unavailable";

        changeEl.textContent =
          "—";
      }
    });

    // ------------------------------------------------
    // STATUS
    // ------------------------------------------------

    const now =
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

    if (updatedEl) {
      updatedEl.textContent =
        `Updated ${now}`;
    }

    if (noteEl) {
      if (successfulQuotes === companies.length) {
        noteEl.textContent =
          "Latest available market data. Quotes are cached and refreshed approximately every 15 minutes.";
      } else {
        noteEl.textContent =
          `${successfulQuotes} of ${companies.length} quotes loaded successfully.`;
      }
    }
  }

  // --------------------------------------------------
  // TAB BUTTONS
  // --------------------------------------------------

  tabs.forEach(tab => {
    tab.addEventListener("click", function () {
      const category =
        this.dataset.tickerTab;

      if (
        !SITE_CONFIG.stockWatchlists[category]
      ) {
        console.error(
          "Invalid ticker category:",
          category
        );

        return;
      }

      tabs.forEach(button => {
        button.classList.remove("is-active");
      });

      this.classList.add("is-active");

      activeCategory = category;

      renderCategory(activeCategory);
    });
  });

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  console.log("Stock ticker initialized.");

  renderCategory(activeCategory);

  // --------------------------------------------------
  // AUTO REFRESH
  // --------------------------------------------------

  setInterval(
    function () {
      renderCategory(activeCategory);
    },
    SITE_CONFIG.stockRefreshIntervalMs
  );

})();
