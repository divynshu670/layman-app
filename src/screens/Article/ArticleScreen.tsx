import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  BackHandler,
  Alert,
  Share,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import ContentCard from '../../components/ContentCard';
import ChatBottomSheet from '../../components/ChatBottomSheet';
import { useArticleViewModel } from '../../viewmodels/useArticleViewModel';
import { validateImageUrl } from '../../utils/validateImage';
import { saveArticle } from '../../services/savedArticlesService';

function isValidArticleWebUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Supports `urlToImage` (app) and `image_url` (API). */
function pickArticleImageCandidate(article: unknown): string | null {
  if (!article || typeof article !== 'object') {
    return null;
  }

  const r = article as Record<string, unknown>;
  const urlToImage =
    typeof r.urlToImage === 'string' ? r.urlToImage.trim() : '';
  const imageUrl =
    typeof r.image_url === 'string' ? r.image_url.trim() : '';

  if (urlToImage) {
    return urlToImage;
  }

  if (imageUrl) {
    return imageUrl;
  }

  return null;
}

export default function ArticleScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height: windowHeight } = useWindowDimensions();

  const article = route?.params?.article || {
    title: 'Loading Analysis...',
    description: 'We are preparing the structure of this article right now.',
    urlToImage: null,
  };

  const { cards, loading } = useArticleViewModel(article);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWebViewVisible, setWebViewVisible] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(false);
  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false);
  const chatSheetRef = useRef<BottomSheetModal>(null);

  const rawArticleUrl = article?.url || article?.link || '';
  const articleWebUri = useMemo(() => {
    const normalized =
      typeof rawArticleUrl === 'string' ? rawArticleUrl.trim() : '';
    return isValidArticleWebUrl(normalized) ? normalized : null;
  }, [rawArticleUrl]);

  const layout = useMemo(() => {
    const horizontalPadding = width < 375 ? 16 : width >= 430 ? 24 : 20;
    const topBarMinHeight = width < 375 ? 46 : width >= 430 ? 54 : 50;

    const headlineTopMargin = width < 375 ? 2 : width >= 430 ? 8 : 4;
    const headlineBottomMargin = width < 375 ? 12 : width >= 430 ? 16 : 14;
    const headlineFontSize = width < 375 ? 19 : width >= 430 ? 24 : 22;
    const headlineLineHeight = width < 375 ? 25 : width >= 430 ? 31 : 28;

    const imageBottomMargin = width < 375 ? 12 : width >= 430 ? 16 : 14;
    const rawImageHeight = Math.round(Math.min(windowHeight * 0.23, width * 0.62));
    const imageHeight = Math.min(
      width >= 430 ? 230 : 210,
      Math.max(width < 375 ? 120 : 132, rawImageHeight)
    );

    const cardTopInset = windowHeight < 700 ? 0 : width >= 430 ? 2 : 0;
    const cardBottomInset = windowHeight < 700 ? 0 : width >= 430 ? 4 : 2;

    const paginationTop = windowHeight < 700 ? 6 : width >= 430 ? 8 : 6;
    const paginationBottom = windowHeight < 700 ? 10 : width >= 430 ? 14 : 12;

    const footerTopPadding = width < 375 ? 2 : 4;
    const footerBottomPadding = Math.max(insets.bottom, width < 375 ? 10 : 12);
    const askButtonHeight = width < 375 ? 52 : width >= 430 ? 58 : 56;

    return {
      horizontalPadding,
      topBarMinHeight,
      headlineTopMargin,
      headlineBottomMargin,
      headlineFontSize,
      headlineLineHeight,
      imageBottomMargin,
      imageHeight,
      cardTopInset,
      cardBottomInset,
      paginationTop,
      paginationBottom,
      footerTopPadding,
      footerBottomPadding,
      askButtonHeight,
    };
  }, [width, windowHeight, insets.bottom]);

  const closeWebModal = useCallback(() => {
    setWebViewVisible(false);
    setWebViewLoading(false);
  }, []);

  const openWebModal = useCallback(() => {
    setWebViewVisible(true);
    if (articleWebUri) {
      setWebViewLoading(true);
    } else {
      setWebViewLoading(false);
    }
  }, [articleWebUri]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = Math.max(0, event.nativeEvent.contentOffset.x);
    setActiveIndex(Math.round(offset / width));
  };

  const handleBackPress = () => {
    if (isWebViewVisible) {
      closeWebModal();
      return true;
    }

    if (isChatSheetOpen) {
      chatSheetRef.current?.dismiss();
      return true;
    }

    return false;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      subscription.remove();
    };
  }, [isChatSheetOpen, isWebViewVisible, closeWebModal]);

  useEffect(() => {
    return () => {
      chatSheetRef.current?.dismiss();
    };
  }, []);

  const safeImageUrl = validateImageUrl(pickArticleImageCandidate(article));

  const handleSharePress = useCallback(async () => {
    const title = (article?.title ?? '').trim() || 'Article';
    const message = articleWebUri ? `${title}\n\n${articleWebUri}` : title;

    try {
      await Share.share({ message });
    } catch (e) {
      console.warn('[share]', e);
    }
  }, [article, articleWebUri]);

  const handleBookmarkPress = useCallback(async () => {
    if (!article?.title?.trim()) {
      Alert.alert('Unable to save', 'Article title is missing.');
      return;
    }

    try {
      const candidate = pickArticleImageCandidate(article);

      const { error, alreadySaved } = await saveArticle({
        title: article.title,
        urlToImage: candidate,
        description: article.description ?? null,
        url: article?.url ?? article?.link ?? null,
        link: article?.link ?? article?.url ?? null,
      });

      if (error) {
        console.warn('[saveArticle]', error);
        Alert.alert('Save failed', error.message || 'Could not save article.');
        return;
      }

      if (alreadySaved) {
        Alert.alert('Already saved', 'This article is already in your saved list.');
        return;
      }

      Alert.alert('Saved', 'Article saved successfully.');
    } catch (e) {
      console.warn('[saveArticle]', e);
      Alert.alert('Save failed', 'Something went wrong while saving.');
    }
  }, [article]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View
        style={[
          styles.topBar,
          {
            paddingHorizontal: layout.horizontalPadding,
            minHeight: layout.topBarMinHeight,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (!handleBackPress()) {
              navigation?.goBack();
            }
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={openWebModal}
            activeOpacity={0.85}
          >
            <Ionicons name="link" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleBookmarkPress}
            activeOpacity={0.85}
          >
            <Ionicons name="bookmark-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSharePress}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <View
          style={[
            styles.headlineWrapper,
            {
              paddingHorizontal: layout.horizontalPadding,
              marginTop: layout.headlineTopMargin,
              marginBottom: layout.headlineBottomMargin,
            },
          ]}
        >
          <Text
            style={[
              styles.headline,
              {
                fontSize: layout.headlineFontSize,
                lineHeight: layout.headlineLineHeight,
              },
            ]}
            numberOfLines={3}
          >
            {article.title}
          </Text>
        </View>

        <View
          style={[
            styles.imageWrapper,
            {
              paddingHorizontal: layout.horizontalPadding,
              marginBottom: layout.imageBottomMargin,
            },
          ]}
        >
          <Image
            source={{ uri: safeImageUrl }}
            style={[styles.image, { height: layout.imageHeight }]}
            resizeMode="cover"
          />
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#FF8C5A" />
          </View>
        ) : (
          <>
            <View style={styles.cardsOuter}>
              <FlatList
                data={cards}
                horizontal
                pagingEnabled
                snapToInterval={width}
                snapToAlignment="start"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(_, index) => `card-${String(index)}`}
                style={styles.cardsList}
                contentContainerStyle={styles.cardsListContent}
                nestedScrollEnabled={Platform.OS === 'android'}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.cardWrapper,
                      {
                        width,
                        paddingHorizontal: layout.horizontalPadding,
                      },
                    ]}
                  >
                    <ScrollView
                      style={styles.cardScroll}
                      contentContainerStyle={[
                        styles.cardScrollContent,
                        {
                          paddingTop: layout.cardTopInset,
                          paddingBottom: layout.cardBottomInset,
                        },
                      ]}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      bounces={Platform.OS === 'ios'}
                      nestedScrollEnabled={Platform.OS === 'android'}
                    >
                      <ContentCard text={item} />
                    </ScrollView>
                  </View>
                )}
              />
            </View>

            <View
              style={[
                styles.paginationWrapper,
                {
                  marginTop: layout.paginationTop,
                  marginBottom: layout.paginationBottom,
                },
              ]}
            >
              {cards.map((_, index) => (
                <View
                  key={index}
                  style={activeIndex === index ? styles.activeDot : styles.inactiveDot}
                />
              ))}
            </View>
          </>
        )}
      </View>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: layout.footerTopPadding,
            paddingBottom: layout.footerBottomPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.askButton,
            {
              height: layout.askButtonHeight,
              borderRadius: layout.askButtonHeight / 2,
            },
          ]}
          activeOpacity={0.85}
          onPress={() => chatSheetRef.current?.present()}
        >
          <Text style={styles.askButtonText}>✦ Ask Layman</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isWebViewVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeWebModal}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View
            style={[
              styles.modalHeader,
              { paddingHorizontal: layout.horizontalPadding },
            ]}
          >
            <TouchableOpacity style={styles.iconButton} onPress={closeWebModal}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Original Article</Text>

            <View style={{ width: 40 }} />
          </View>

          {articleWebUri ? (
            <View style={styles.webViewShell}>
              {webViewLoading ? (
                <View style={styles.webViewLoadingOverlay} pointerEvents="none">
                  <ActivityIndicator size="large" color="#FF8C5A" />
                </View>
              ) : null}

              <WebView
                source={{ uri: articleWebUri }}
                style={styles.webView}
                onLoadStart={() => setWebViewLoading(true)}
                onLoadEnd={() => setWebViewLoading(false)}
                onError={() => setWebViewLoading(false)}
                originWhitelist={['http://*', 'https://*']}
              />
            </View>
          ) : (
            <View style={styles.modalEmpty}>
              <Text style={styles.modalFallbackTitle}>Link unavailable</Text>
              <Text style={styles.modalFallbackSub}>
                This article does not have a valid web address.
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      <ChatBottomSheet
        ref={chatSheetRef}
        articleContext={article.description || ''}
        articleTitle={article.title}
        onOpenChange={setIsChatSheetOpen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 2,
  },
  container: {
    flex: 1,
    minHeight: 0,
  },
  headlineWrapper: {
    flexShrink: 0,
  },
  headline: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  imageWrapper: {
    flexShrink: 0,
  },
  image: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#3a2418',
  },
  cardsOuter: {
    flex: 1,
    minHeight: 0,
  },
  cardsList: {
    flex: 1,
  },
  cardsListContent: {
    flexGrow: 1,
    alignItems: 'stretch',
  },
  cardWrapper: {
    alignSelf: 'stretch',
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  paginationWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3a2418',
    marginHorizontal: 6,
  },
  activeDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8C5A',
    marginHorizontal: 6,
  },
  footer: {
    backgroundColor: '#140a05',
    flexShrink: 0,
  },
  askButton: {
    backgroundColor: '#E48349',
    justifyContent: 'center',
    alignItems: 'center',
  },
  askButtonText: {
    color: '#140a05',
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    backgroundColor: '#140a05',
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webViewShell: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  webView: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  webViewLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#140a05',
    zIndex: 1,
  },
  modalEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalFallbackTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalFallbackSub: {
    color: '#cabfb7',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
  },
});