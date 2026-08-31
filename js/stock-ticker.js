async function fetchQuote(symbol) {
  try {
    const res = await fetch(
      `${SITE_CONFIG.stockApiUrl}/?symbol=${encodeURIComponent(symbol)}`
    );

    if (!res.ok) {
      throw new Error(`Stock API returned ${res.status}`);
    }

    const data = await res.json();

    if (
      !data ||
      typeof data.price !== "number" ||
      data.price === 0
    ) {
      throw new Error("Invalid quote data");
    }

    return {
      price: data.price,
      changePct: data.changePct
    };

  } catch (err) {
    console.warn(
      `Ticker: falling back to sample data for ${symbol}`,
      err
    );

    return sampleQuote(symbol);
  }
}
