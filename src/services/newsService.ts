export interface Article {
  title: string;
  urlToImage: string | null;
  description: string | null;
  url?: string | null;
  link?: string | null;
}

interface NewsDataArticle {
  title?: string | null;
  image_url?: string | null;
  description?: string | null;
  language?: string | null;
  link?: string | null;
  url?: string | null;
}

interface NewsDataResponse {
  status?: string;
  results?: NewsDataArticle[];
  message?: string;
  results_count?: number;
  nextPage?: string;
}

const API_KEY = process.env.EXPO_PUBLIC_NEWSDATA_API_KEY;
const REQUEST_TIMEOUT_MS = 20000;

function buildLatestUrl() {
  if (!API_KEY) return null;

  const params = new URLSearchParams({
    apikey: API_KEY,
    q: 'business tech startup',
    language: 'en',
  });

  return `https://newsdata.io/api/1/latest?${params.toString()}`;
}

function parseResponsePayload(rawBody: string): NewsDataResponse | null {
  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody) as NewsDataResponse;
  } catch (error) {
    console.warn('[newsService] Failed to parse JSON', error);
    return null;
  }
}

function isTitleWithinMaxLength(title: string) {
  return title.trim().length < 100;
}

function mapArticles(results: NewsDataArticle[]): Article[] {
  return results
    .filter((article) => {
      const title = article.title?.trim();
      const language = article.language?.toLowerCase();

      return (
        !!title &&
        isTitleWithinMaxLength(title) &&
        (!language || language === 'english' || language === 'en')
      );
    })
    .map((article) => {
      const rawWeb = article.link ?? article.url ?? null;
      const webUrl =
        typeof rawWeb === 'string' && rawWeb.trim().length > 0
          ? rawWeb.trim()
          : null;

      return {
        title: article.title?.trim() ?? '',
        urlToImage:
          typeof article.image_url === 'string' && article.image_url.trim().length > 0
            ? article.image_url.trim()
            : null,
        description: article.description?.trim() ?? null,
        url: webUrl,
        link: webUrl,
      };
    });
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchArticles(): Promise<{
  ok: boolean;
  status: number;
  articles: Article[];
  message: string | null;
}> {
  const url = buildLatestUrl();

  if (!url) {
    console.warn('[newsService] Missing EXPO_PUBLIC_NEWSDATA_API_KEY');
    return {
      ok: false,
      status: 0,
      articles: [],
      message: 'Missing API key',
    };
  }

  console.log('[newsService] Fetching URL:', url);

  const response = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
  const rawBody = await response.text();

  console.log('[newsService] HTTP status:', response.status);
  console.log('[newsService] Raw response:', rawBody);

  const payload = parseResponsePayload(rawBody);

  if (!response.ok) {
    const apiMessage =
      payload?.message ||
      `NewsData request failed with HTTP ${response.status}`;

    if (apiMessage.toLowerCase().includes('subscription over')) {
      return {
        ok: false,
        status: response.status,
        articles: [],
        message: 'Daily NewsData credits exhausted. Try again tomorrow or upgrade plan.',
      };
    }

    return {
      ok: false,
      status: response.status,
      articles: [],
      message: apiMessage,
    };
  }

  if (payload?.status !== 'success') {
    const apiMessage =
      payload?.message || 'NewsData returned an unsuccessful response';

    if (apiMessage.toLowerCase().includes('subscription over')) {
      return {
        ok: false,
        status: response.status,
        articles: [],
        message: 'Daily NewsData credits exhausted. Try again tomorrow or upgrade plan.',
      };
    }

    return {
      ok: false,
      status: response.status,
      articles: [],
      message: apiMessage,
    };
  }

  if (!Array.isArray(payload.results)) {
    return {
      ok: false,
      status: response.status,
      articles: [],
      message: 'NewsData response did not include a valid results array',
    };
  }

  const filteredArticles = mapArticles(payload.results);

  console.log('[newsService] Filtered articles count:', filteredArticles.length);

  return {
    ok: true,
    status: response.status,
    articles: filteredArticles,
    message: null,
  };
}

export async function getTopHeadlines(): Promise<Article[]> {
  try {
    const result = await fetchArticles();

    if (result.ok && result.articles.length > 0) {
      return result.articles;
    }

    console.warn(
      `[newsService] Fetch failed. HTTP ${result.status}. ${
        result.message ?? 'No usable articles returned.'
      }`
    );

    return [];
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.warn(
        `[newsService] Request timed out after ${REQUEST_TIMEOUT_MS}ms`
      );
    } else {
      console.warn('[newsService] Failed to fetch articles', error);
    }

    return [];
  }
}