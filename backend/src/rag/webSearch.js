const SERP_TIMEOUT_MS = Number(process.env.WEB_SEARCH_TIMEOUT_MS || 12000, 10);

async function fetchJson(url, options = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), SERP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/**
 * @returns {Promise<{ title: string, url: string, snippet: string }[]>}
 */
export async function searchSerpApi(query) {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) return [];
  const u = new URL("https://serpapi.com/search.json");
  u.searchParams.set("q", query);
  u.searchParams.set("api_key", key);
  u.searchParams.set("num", "10");
  const data = await fetchJson(u.toString());
  const organic = data.organic_results || [];
  return organic
    .map((r) => ({
      title: String(r.title || "").trim(),
      url: String(r.link || "").trim(),
      snippet: String(r.snippet || "").trim(),
    }))
    .filter((r) => r.url.startsWith("http"));
}

/**
 * @returns {Promise<{ title: string, url: string, snippet: string }[]>}
 */
export async function searchSerper(query) {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];
  const data = await fetchJson("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": key,
    },
    body: JSON.stringify({ q: query, num: 10 }),
  });
  const organic = data.organic || [];
  return organic
    .map((r) => ({
      title: String(r.title || "").trim(),
      url: String(r.link || "").trim(),
      snippet: String(r.snippet || "").trim(),
    }))
    .filter((r) => r.url.startsWith("http"));
}

/**
 * Prefer SerpAPI when configured, else Serper.
 * @param {string} query
 */
export async function searchWeb(query) {
  if (process.env.SERPAPI_API_KEY) {
    const a = await searchSerpApi(query);
    if (a.length) return a;
  }
  return searchSerper(query);
}
