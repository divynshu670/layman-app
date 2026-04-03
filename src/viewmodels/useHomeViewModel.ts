import { useState, useEffect, useCallback, useRef } from 'react';
import { getTopHeadlines, Article } from '../services/newsService';

export function useHomeViewModel() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const hasLoadedArticlesRef = useRef(false);

  const fetchArticles = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const hasExistingArticles = hasLoadedArticlesRef.current;

    if (!hasExistingArticles) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getTopHeadlines();

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (data.length > 0) {
        setFeaturedArticles(data.slice(0, 3));
        setArticles(data.slice(3));
        hasLoadedArticlesRef.current = true;
        return;
      }

      if (!hasExistingArticles) {
        setFeaturedArticles([]);
        setArticles([]);
      } else {
        console.warn(
          '[useHomeViewModel] Ignoring empty refresh response to preserve previously loaded articles'
        );
      }
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!hasExistingArticles) {
        setError('An error occurred while fetching articles.');
      } else {
        console.warn(
          '[useHomeViewModel] Refresh failed, preserving previously loaded articles'
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    featuredArticles,
    articles,
    loading,
    error,
    fetchArticles,
  };
}
