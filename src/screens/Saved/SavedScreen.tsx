import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import ArticleRow from '../../components/ArticleRow';
import { useSavedViewModel } from '../../viewmodels/useSavedViewModel';
import type { SavedArticleRow } from '../../services/savedArticlesService';

function savedRowMatchesSearch(
  row: SavedArticleRow,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const title = (row.title ?? '').trim().toLowerCase();
  const description = (row.description ?? '').trim().toLowerCase();

  return title.includes(normalizedQuery) || description.includes(normalizedQuery);
}

export default function SavedScreen() {
  const navigation = useNavigation<any>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  const {
    savedArticles,
    loading,
    error,
    fetchSavedArticles,
    removeSavedArticle,
  } = useSavedViewModel();

  useFocusEffect(
    useCallback(() => {
      fetchSavedArticles();
    }, [fetchSavedArticles])
  );

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const id = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(id);
  }, [isSearchOpen]);

  const collapseSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchOpen(false);
  }, []);

  const getRowImage = useCallback((row: SavedArticleRow) => {
    return row.image_url ?? null;
  }, []);

  const mapRowToArticleParam = useCallback(
    (row: SavedArticleRow) => {
      return {
        title: row.title ?? '',
        urlToImage: getRowImage(row),
        description: row.description ?? null,
      };
    },
    [getRowImage]
  );

  const filteredSavedArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return savedArticles;
    }

    return savedArticles.filter((item) =>
      savedRowMatchesSearch(item, normalizedQuery)
    );
  }, [savedArticles, searchQuery]);

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF8C5A" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (savedArticles.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No saved articles</Text>
        </View>
      );
    }

    const searchTrimmed = searchQuery.trim();

    const savedListEmpty =
      searchTrimmed.length > 0 && filteredSavedArticles.length === 0 ? (
        <View style={styles.rowWrap}>
          <Text style={styles.emptyText}>No saved articles found</Text>
        </View>
      ) : null;

    return (
      <FlatList
        data={filteredSavedArticles}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={savedListEmpty}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <ArticleRow
              title={item.title}
              imageUrl={getRowImage(item)}
              onPress={() =>
                navigation.navigate('Article', { article: mapRowToArticleParam(item) })
              }
              onRemovePress={() => removeSavedArticle(item.id)}
            />
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>

        {isSearchOpen ? (
          <>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#8a6a5a" />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search saved"
                placeholderTextColor="#8a6a5a"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>

            <TouchableOpacity
              style={styles.searchCloseBtn}
              onPress={collapseSearch}
              activeOpacity={0.85}
              accessibilityLabel="Close search"
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => setIsSearchOpen(true)}
            activeOpacity={0.85}
            accessibilityLabel="Open search"
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a1a10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    minWidth: 0,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a1a10',
    paddingHorizontal: 14,
  },
  searchCloseBtn: {
    width: 40,
    height: 40,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ffb4a8',
    textAlign: 'center',
  },
  emptyText: {
    color: '#cabfb7',
    textAlign: 'center',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  rowWrap: {
    paddingHorizontal: 20,
  },
});
