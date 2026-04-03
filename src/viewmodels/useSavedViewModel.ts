import { useCallback, useEffect, useState } from 'react';
import {
  getSavedArticles,
  removeArticle,
  type SavedArticleRow,
} from '../services/savedArticlesService';

function errorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: string }).message;
    if (typeof msg === 'string' && msg.length > 0) {
      return msg;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export function useSavedViewModel() {
  const [savedArticles, setSavedArticles] = useState<SavedArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedArticles = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: fetchError } = await getSavedArticles();

      if (fetchError) {
        setSavedArticles([]);
        setError(errorMessage(fetchError, 'Failed to load saved articles'));
        return;
      }

      setSavedArticles(data ?? []);
    } catch (e) {
      setSavedArticles([]);
      setError(errorMessage(e, 'Failed to load saved articles'));
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSavedArticle = useCallback(
    async (id: string) => {
      if (!id?.trim()) {
        return;
      }

      setError(null);

      try {
        const { error: removeError } = await removeArticle(id);

        if (removeError) {
          setError(errorMessage(removeError, 'Failed to remove article'));
          return;
        }

        await fetchSavedArticles();
      } catch (e) {
        setError(errorMessage(e, 'Failed to remove article'));
      }
    },
    [fetchSavedArticles]
  );

  useEffect(() => {
    fetchSavedArticles();
  }, [fetchSavedArticles]);

  return {
    savedArticles,
    loading,
    error,
    fetchSavedArticles,
    removeSavedArticle,
  };
}
