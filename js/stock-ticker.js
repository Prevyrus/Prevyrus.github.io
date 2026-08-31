/**
 * STOCK-TICKER.JS
 * -----------------------------------------------------------------------
 * Two 5-company watchlists:
 *   - U.S. biotech / biopharma leaders
 *   - Global biotech / biopharma leaders
 *
 * Quotes are requested from the Cloudflare Worker, which handles the
 * private Finnhub key and caching.
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

  let activeCategory = "usBiotech";

  // Used to stop an older render if the user switches tabs quickly.
  let renderToken = 0;


  // ---------------------------------------------------------------------
  // FORMATTING
  // ---------------------------------------------------------------------

  function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function formatChange(value) {
    const number = Number(value);

    return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
  }


  // ---------------------------------------------------------------------
  // CREATE INITIAL ROWS
  // ---------------------------------------------------------------------

  function createRows(companies) {

    listEl.innerHTML = companies
      .map(
        company => `
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
        `
      )
      .join("");
  }


  // ---------------------------------------------------------------------
  // FETCH QUOTE
  // ---------------------------------------------------------------------

  async function fetchQuote(symbol) {

    const endpoint =
      `${SITE_CONFIG.stockApiUrl}/?symbol=${encodeURIComponent(symbol)}`;

    const response = await fetch(endpoint, {
      method: "GET",

      // We want Cloudflare to control caching,
      // not the visitor's browser.
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Stock API returned ${response.status}`
      );
    }

    const data = await response.json();

    if (
      !data ||
      typeof data.price !== "number" ||
      typeof data.changePct !== "number"
    ) {
      throw new Error(
        "Invalid quote returned by stock API"
      );
    }

    return data;
  }


  // ---------------------------------------------------------------------
  // FETCH WATCHLIST
  // ---------------------------------------------------------------------
  //
  // This intentionally loads stocks one at a time.
  //
  // Since there are only five stocks per tab, this avoids sending five
  // simultaneous cold-cache requests to Finnhub.
  //
  // Cached Worker responses should usually return very quickly.
  // ---------------------------------------------------------------------

  async function fetchWatchlist(companies, token) {

    const results = [];

    for (let index = 0; index < companies.length; index++) {

      // User switched tabs while we were loading.
      if (token !== renderToken) {
        return results;
      }

      const company = companies[index];

      try {

        const quote =
          await fetchQuote(company.symbol);

        results.push({
          status: "fulfilled",
          company,
          quote
        });

      } catch (error) {

        console.warn(
          `Could not load ${company.symbol}:`,
          error
        );

        results.push({
          status: "rejected",
          company,
          error
        });
      }

      // Small spacing between requests.
      if (index < companies.length - 1) {

        await new Promise(
          resolve => setTimeout(resolve, 900)
        );
      }
    }

    return results;
  }


  // ---------------------------------------------------------------------
  // UPDATE ONE ROW
  // ---------------------------------------------------------------------

  function renderQuoteResult(result) {

    const row = listEl.querySelector(
      `[data-symbol="${result.company.symbol}"]`
    );

    if (!row) {
      return;
    }

    const priceEl =
      row.querySelector(".price");

    const changeEl =
      row.querySelector(".change");


    // -----------------------------------
    // Failed quote
    // -----------------------------------

    if (result.status === "rejected") {

      priceEl.textContent =
        "Unavailable";

      changeEl.textContent =
        "—";

      changeEl.classList.remove(
        "is-up",
        "is-down"
      );

      return;
    }


    // -----------------------------------
    // Successful quote
    // -----------------------------------

    const quote =
      result.quote;

    priceEl.textContent =
      formatPrice(quote.price);

    changeEl.textContent =
      formatChange(quote.changePct);

    changeEl.classList.remove(
      "is-up",
      "is-down"
    );

    changeEl.classList.add(
      quote.changePct >= 0
        ? "is-up"
        : "is-down"
    );
  }


  // ---------------------------------------------------------------------
  // RENDER CATEGORY
  // ---------------------------------------------------------------------

  async function renderCategory(category) {

    const companies =
      SITE_CONFIG.stockWatchlists[category];

    if (!companies) {

      console.error(
        `Unknown stock category: ${category}`
      );

      return;
    }

    const token =
      ++renderToken;


    // Display the companies immediately.
    createRows(companies);


    if (updatedEl) {

      updatedEl.textContent =
        "Loading latest quotes...";
    }


    if (noteEl) {

      noteEl.textContent =
        "Loading the latest cached market data.";
    }


    // Fetch the quote data.
    const results =
      await fetchWatchlist(
        companies,
        token
      );


    // If user changed tabs while fetching,
    // ignore this old render.
    if (token !== renderToken) {
      return;
    }


    results.forEach(
      renderQuoteResult
    );


    const successCount =
      results.filter(
        item =>
          item.status === "fulfilled"
      ).length;


    // -------------------------------------------------------------------
    // UPDATED TIME
    // -------------------------------------------------------------------

    if (updatedEl) {

      updatedEl.textContent =
        `Updated ${new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )}`;
    }


    // -------------------------------------------------------------------
    // STATUS MESSAGE
    // -------------------------------------------------------------------

    if (noteEl) {

      if (
        successCount ===
        companies.length
      ) {

        noteEl.textContent =
          "Latest available market data. Quotes are cached by the portfolio API and refreshed approximately every 15 minutes.";

      } else {

        noteEl.textContent =
          `${successCount} of ${companies.length} quotes loaded. Unavailable quotes will retry on the next refresh.`;
      }
    }
  }


  // ---------------------------------------------------------------------
  // TAB SWITCHING
  // ---------------------------------------------------------------------

  tabs.forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        const category =
          tab.dataset.tickerTab;


        if (
          !SITE_CONFIG
            .stockWatchlists[
              category
            ]
        ) {

          console.error(
            `Invalid ticker category: ${category}`
          );

          return;
        }


        tabs.forEach(
          button =>
            button.classList.remove(
              "is-active"
            )
        );


        tab.classList.add(
          "is-active"
        );


        activeCategory =
          category;


        renderCategory(
          activeCategory
        );
      }
    );
  });


  // ---------------------------------------------------------------------
  // INITIAL PAGE LOAD
  // ---------------------------------------------------------------------

  renderCategory(
    activeCategory
  );


  // ---------------------------------------------------------------------
  // AUTOMATIC REFRESH
  // ---------------------------------------------------------------------

  setInterval(
    () => {

      renderCategory(
        activeCategory
      );

    },

    SITE_CONFIG
      .stockRefreshIntervalMs
  );

})();
