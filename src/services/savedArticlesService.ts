import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Article } from './newsService';

export interface SavedArticleRow {
  id: string;
  user_id: string;
  title: string;
  image_url?: string | null;
  description: string | null;
  created_at: string;
}

const DUPLICATE_KEY_CODE = '23505';

type SavedArticleInsert = {
  user_id: string;
  title: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
};

export async function saveArticle(
  article: Article
): Promise<{
  data: SavedArticleRow | null;
  error: PostgrestError | Error | null;
  alreadySaved?: boolean;
}> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return { data: null, error: authError };
    }

    if (!authData?.user?.id) {
      return { data: null, error: new Error('Not signed in') };
    }

    const title = article.title?.trim() ?? '';

    if (!title) {
      return { data: null, error: new Error('Article title is required') };
    }

    console.log('Saving article:', article.title);
    console.log('User ID:', authData.user.id);

    const row: SavedArticleInsert = {
      user_id: authData.user.id,
      title,
      image_url: article.urlToImage ?? null,
      description: article.description ?? null,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from('saved_articles')
      .insert(row)
      .select('*')
      .maybeSingle();

    if (error) {
      if (error.code === DUPLICATE_KEY_CODE) {
        return { data: null, error: null, alreadySaved: true };
      }

      return { data: null, error };
    }

    return {
      data: (inserted as SavedArticleRow | null) ?? null,
      error: null,
      alreadySaved: false,
    };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { data: null, error: err };
  }
}

export async function getSavedArticles(): Promise<{
  data: SavedArticleRow[];
  error: PostgrestError | Error | null;
}> {
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError) {
    return { data: [], error: authError };
  }

  const userId = userData.user?.id;

  if (!userId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('saved_articles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error };
  }

  return { data: (data ?? []) as SavedArticleRow[], error: null };
}

export async function removeArticle(
  id: string
): Promise<{ error: PostgrestError | Error | null }> {
  if (!id?.trim()) {
    return { error: new Error('Missing article id') };
  }

  const { error } = await supabase.from('saved_articles').delete().eq('id', id);

  return { error: error ?? null };
}
