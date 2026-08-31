/**
 * NEWS-FEED.JS
 * -----------------------------------------------------------------------
 * Displays exactly 10 recent PubMed items:
 *
 *   5 Oncology & Biotech
 *   5 Health Technology & AI
 *
 * PubMed is used for both categories.
 *
 * This removes the unreliable rss2json dependency and avoids requiring
 * another API key.
 * -----------------------------------------------------------------------
 */

(function newsFeedModule() {

  const grid =
    document.querySelector(
      "[data-news-grid]"
    );

  if (!grid) {
    return;
  }


  if (
    typeof SITE_CONFIG ===
    "undefined"
  ) {

    console.error(
      "SITE_CONFIG is not loaded."
    );

    return;
  }


  const PUBMED_BASE =
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";


  // ---------------------------------------------------------------------
  // ESCAPE HTML
  // ---------------------------------------------------------------------

  function escapeHtml(
    value = ""
  ) {

    return String(value)

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );
  }


  // ---------------------------------------------------------------------
  // CREATE NEWS CARD
  // ---------------------------------------------------------------------

  function cardHtml(item) {

    return `
      <article
        class="glass news-card"
        data-reveal
      >

        <div class="source-row">

          <span>
            ${escapeHtml(
              item.category
            )}
          </span>

          <span>
            ${escapeHtml(
              item.date
            )}
          </span>

        </div>


        <h4>
          ${escapeHtml(
            item.title
          )}
        </h4>


        <p>

          ${escapeHtml(
            item.source
          )}

          ${
            item.authors
              ? ` · ${escapeHtml(
                  item.authors
                )}`
              : ""
          }

        </p>


        <a
          href="${item.url}"
          target="_blank"
          rel="noopener"
        >
          View on PubMed
        </a>

      </article>
    `;
  }


  // ---------------------------------------------------------------------
  // FETCH PUBMED CATEGORY
  // ---------------------------------------------------------------------

  async function fetchPubMedFeed(
    feed
  ) {

    const searchUrl =
      `${PUBMED_BASE}/esearch.fcgi` +

      `?db=pubmed` +

      `&retmode=json` +

      `&sort=date` +

      `&retmax=${feed.maxResults}` +

      `&term=${encodeURIComponent(
        feed.query
      )}`;


    const searchResponse =
      await fetch(
        searchUrl
      );


    if (
      !searchResponse.ok
    ) {

      throw new Error(
        `PubMed search failed with ${searchResponse.status}`
      );
    }


    const searchData =
      await searchResponse.json();


    const ids =
      searchData
        ?.esearchresult
        ?.idlist || [];


    if (
      ids.length === 0
    ) {

      return [];
    }


    // -------------------------------------------------------------------
    // FETCH ARTICLE SUMMARIES
    // -------------------------------------------------------------------

    const summaryUrl =
      `${PUBMED_BASE}/esummary.fcgi` +

      `?db=pubmed` +

      `&retmode=json` +

      `&id=${ids.join(",")}`;


    const summaryResponse =
      await fetch(
        summaryUrl
      );


    if (
      !summaryResponse.ok
    ) {

      throw new Error(
        `PubMed summary failed with ${summaryResponse.status}`
      );
    }


    const summaryData =
      await summaryResponse.json();


    return ids

      .map(
        id =>
          summaryData
            .result
            ?.[id]
      )

      .filter(Boolean)

      .slice(
        0,
        feed.maxResults
      )

      .map(
        item => ({

          category:
            feed.label,

          date:
            item.pubdate || "",

          title:
            item.title ||
            "Untitled",

          source:
            item.fulljournalname ||
            item.source ||
            "PubMed",

          authors:
            (
              item.authors ||
              []
            )

              .slice(
                0,
                3
              )

              .map(
                author =>
                  author.name
              )

              .join(", "),

          url:
            `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`
        })
      );
  }


  // ---------------------------------------------------------------------
  // RENDER NEWS FEED
  // ---------------------------------------------------------------------

  async function render() {

    grid.innerHTML =
      `
        <p class="news-loading">
          Loading recent oncology, biotech,
          and health-technology updates…
        </p>
      `;


    try {

      const feeds =
        SITE_CONFIG
          .researchFeeds ||
        [];


      const results =
        await Promise.all(

          feeds.map(
            feed =>

              fetchPubMedFeed(
                feed
              )

                .catch(
                  error => {

                    console.warn(
                      `Could not load ${feed.label} feed:`,
                      error
                    );

                    return [];
                  }
                )
          )
        );


      // Exactly 10 maximum.
      const combined =
        results
          .flat()
          .slice(
            0,
            10
          );


      if (
        combined.length ===
        0
      ) {

        grid.innerHTML =
          `
            <p class="news-error">
              Recent research updates
              could not be loaded
              right now.
            </p>
          `;

        return;
      }


      grid.innerHTML =
        combined
          .map(
            cardHtml
          )
          .join("");


      // -----------------------------------------------------------------
      // REVEAL NEW CARDS
      // -----------------------------------------------------------------

      if (
        document.documentElement
          .classList
          .contains(
            "js-ready"
          ) &&

        typeof gsap !==
          "undefined"
      ) {

        gsap.utils

          .toArray(
            "[data-news-grid] [data-reveal]"
          )

          .forEach(
            el => {

              gsap.to(
                el,
                {

                  opacity: 1,

                  y: 0,

                  duration: 0.6,

                  ease:
                    "power2.out",

                  scrollTrigger: {

                    trigger: el,

                    start:
                      "top 90%"
                  }
                }
              );
            }
          );

      } else {

        grid

          .querySelectorAll(
            "[data-reveal]"
          )

          .forEach(
            el => {

              el.style.opacity =
                1;

              el.style.transform =
                "none";
            }
          );
      }

    } catch (error) {

      console.error(
        "Research feed render failed:",
        error
      );


      grid.innerHTML =
        `
          <p class="news-error">
            Something went wrong
            loading the research feed.
          </p>
        `;
    }
  }


  // ---------------------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------------------

  render();


  // ---------------------------------------------------------------------
  // AUTOMATIC REFRESH
  // ---------------------------------------------------------------------

  setInterval(
    render,
    SITE_CONFIG
      .newsRefreshIntervalMs
  );

})();
