import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import FeaturedCard from '../../components/FeaturedCard';
import ArticleRow from '../../components/ArticleRow';
import { useHomeViewModel } from '../../viewmodels/useHomeViewModel';
import type { Article } from '../../services/newsService';

const screenWidth = Dimensions.get('window').width;

function articleMatchesSearch(article: Article, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }
  const title = (article.title ?? '').trim().toLowerCase();
  const description = (article.description ?? '').trim().toLowerCase();
  const rawCategory = (article as unknown as Record<string, unknown>).category;
  const category =
    typeof rawCategory === 'string' ? rawCategory.trim().toLowerCase() : '';
  return (
    title.includes(normalizedQuery) ||
    description.includes(normalizedQuery) ||
    (category.length > 0 && category.includes(normalizedQuery))
  );
}
const ITEM_WIDTH = screenWidth * 0.85;
const SPACING = 16;
const ITEM_SIZE = ITEM_WIDTH + SPACING;
const SIDE_PADDING = (screenWidth - ITEM_WIDTH) / 2;

export default function HomeScreen({ navigation }: any) {
  const { featuredArticles, articles, loading, error } = useHomeViewModel();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const featuredListRef = useRef<FlatList<any>>(null);
  const searchInputRef = useRef<TextInput>(null);
  const hasInitializedFeaturedRef = useRef(false);
  const initialFeaturedIndex = featuredArticles.length > 1 ? 1 : 0;

  useEffect(() => {
    if (!featuredArticles.length) {
      hasInitializedFeaturedRef.current = false;
      setActiveIndex(0);
      return;
    }

    if (hasInitializedFeaturedRef.current) {
      return;
    }

    setActiveIndex(initialFeaturedIndex);

    requestAnimationFrame(() => {
      featuredListRef.current?.scrollToOffset({
        offset: initialFeaturedIndex * ITEM_SIZE,
        animated: false,
      });
      hasInitializedFeaturedRef.current = true;
    });
  }, [initialFeaturedIndex]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    const id = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isSearchOpen]);

  const syncFeaturedIndex = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = Math.max(0, event.nativeEvent.contentOffset.x);
    const nextIndex = Math.min(
      featuredArticles.length - 1,
      Math.round(offsetX / ITEM_SIZE)
    );
    setActiveIndex(nextIndex);
  };

  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return articles;
    }
    return articles.filter((item) => articleMatchesSearch(item, normalizedQuery));
  }, [articles, searchQuery]);

  const collapseSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.logo}>Layman</Text>

        {isSearchOpen ? (
          <>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#8a6a5a" />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search articles"
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

      {featuredArticles?.length ? (
        <>
          <FlatList
            ref={featuredListRef}
            data={featuredArticles}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            snapToAlignment="start"
            bounces={false}
            overScrollMode="never"
            scrollEventThrottle={16}
            onScroll={syncFeaturedIndex}
            onMomentumScrollEnd={syncFeaturedIndex}
            contentContainerStyle={styles.featuredListContent}
            keyExtractor={(item, index) => `${item.title}-${index}`}
            getItemLayout={(_, index) => ({
              length: ITEM_SIZE,
              offset: ITEM_SIZE * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.featuredItemWrap}>
                <FeaturedCard
                  title={item.title}
                  imageUrl={item.urlToImage}
                  width={ITEM_WIDTH}
                  onPress={() => navigation.navigate('Article', { article: item })}
                />
              </View>
            )}
          />

          <View style={styles.sliderWrapper}>
            {featuredArticles.map((_, index) => (
              <View
                key={index}
                style={activeIndex === index ? styles.activePill : styles.dot}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Picks</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF8C5A" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((!featuredArticles || featuredArticles.length === 0) && (!articles || articles.length === 0)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No articles available right now</Text>
        </View>
      </SafeAreaView>
    );
  }

  const searchTrimmed = searchQuery.trim();
  const listEmpty =
    searchTrimmed.length > 0 && filteredArticles.length === 0 ? (
      <View style={styles.rowWrap}>
        <Text style={styles.emptyText}>No articles found</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={filteredArticles}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <ArticleRow
              title={item.title}
              imageUrl={item.urlToImage}
              onPress={() => navigation.navigate('Article', { article: item })}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#140a05',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  logo: {
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
  featuredListContent: {
    paddingHorizontal: SIDE_PADDING,
  },
  featuredItemWrap: {
    width: ITEM_WIDTH,
    marginRight: SPACING,
    alignItems: 'center',
  },
  sliderWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3a2418',
    marginHorizontal: 6,
  },
  activePill: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8C5A',
    marginHorizontal: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  viewAll: {
    color: '#FF8C5A',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  rowWrap: {
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 8,
  },
});
