import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useCallback,
  memo,
} from 'react';
import { BlurView } from 'expo-blur';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatViewModel, Message } from '../viewmodels/useChatViewModel';

interface Props {
  articleContext: string;
  articleTitle?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

interface FooterProps {
  onSend: (text: string) => void;
  loading: boolean;
  promptLimitReached: boolean;
  onLayout?: (height: number) => void;
}

const ChatFooter = memo(({ onSend, loading, promptLimitReached, onLayout }: FooterProps) => {
  const [localText, setLocalText] = useState('');
  const [footerHeight, setFooterHeight] = useState(0);

  const handleSend = useCallback(() => {
    const trimmed = localText.trim();
    if (trimmed && !loading && !promptLimitReached) {
      onSend(trimmed);
      setLocalText('');
    }
  }, [localText, loading, promptLimitReached, onSend]);

  const handleSubmitEditing = useCallback(() => {
    handleSend();
  }, [handleSend]);

  const onFooterLayout = useCallback(
    (event: any) => {
      const { height } = event.nativeEvent.layout;
      if (height !== footerHeight) {
        setFooterHeight(height);
        onLayout?.(height);
      }
    },
    [footerHeight, onLayout]
  );

  return (
    <View onLayout={onFooterLayout} style={styles.footerContainer}>
      <BlurView
        pointerEvents="none"
        intensity={20}
        tint="dark"
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        style={styles.footerBlur}
      />

      <View style={styles.inputContainer}>
        <BottomSheetTextInput
          style={styles.input}
          placeholder={
            promptLimitReached
              ? '3-question limit reached for this article'
              : 'Type your question...'
          }
          placeholderTextColor="#8F7A6E"
          value={localText}
          onChangeText={setLocalText}
          multiline
          editable={!promptLimitReached}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={handleSubmitEditing}
        />

        <TouchableOpacity style={styles.micButton} activeOpacity={0.85}>
          <Ionicons name="mic-outline" size={21} color="#D7C1B2" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            localText.trim() && !loading && !promptLimitReached ? styles.sendActive : null,
          ]}
          onPress={handleSend}
          disabled={!localText.trim() || loading || promptLimitReached}
          activeOpacity={0.85}
        >
          <Ionicons
            name="paper-plane-outline"
            size={20}
            color={
              localText.trim() && !loading && !promptLimitReached ? '#1A0A04' : '#8F7A6E'
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const ChatBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ articleContext, onOpenChange }, ref) => {
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<BottomSheetFlatListMethods>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [footerHeight, setFooterHeight] = useState(80); // fallback

    const {
      messages,
      loading,
      sendMessage,
      generateSuggestions,
      promptLimitReached,
    } = useChatViewModel(articleContext);

    const displayMessages: Message[] = useMemo(
      () => [
        { id: 'intro', text: "Hi, I'm Layman!\nWhat can I answer for you?", role: 'bot' },
        ...messages,
      ],
      [messages]
    );

    const suggestions = useMemo(() => generateSuggestions().slice(0, 3), [generateSuggestions]);

    const scrollToBottom = useCallback((animated = true, delay = 0) => {
      const scroll = () => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated });
        });
      };
      if (delay > 0) {
        setTimeout(scroll, delay);
      } else {
        scroll();
      }
    }, []);

    // Auto-scroll on new messages – delay ensures list layout is updated
    useEffect(() => {
      if (displayMessages.length > 1) {
        scrollToBottom(true, 100);
      }
    }, [displayMessages.length, scrollToBottom]);

    // When footer height changes (e.g., input expands), scroll to bottom
    useEffect(() => {
      if (footerHeight > 0) {
        scrollToBottom(true, 100);
      }
    }, [footerHeight, scrollToBottom]);

    // Keyboard handling – adjust padding and scroll
    useEffect(() => {
      const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        setTimeout(() => scrollToBottom(true, 100), 50);
      });

      const hideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
        setTimeout(() => scrollToBottom(true, 100), 50);
      });

      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }, [scrollToBottom]);

    const handleSheetStateChange = useCallback(
      (index: number) => {
        const nextIsOpen = index >= 0;
        setIsSheetOpen(nextIsOpen);
        onOpenChange?.(nextIsOpen);
        if (nextIsOpen) {
          setTimeout(() => scrollToBottom(false, 350), 350);
        }
      },
      [onOpenChange, scrollToBottom]
    );

    const handleFooterLayout = useCallback(
      (height: number) => {
        setFooterHeight(height);
      },
      []
    );

    const handleSendMessage = useCallback(
      (text: string) => {
        sendMessage(text);
        // Scroll after message is added and footer height may have changed
        setTimeout(() => scrollToBottom(true, 150), 50);
      },
      [sendMessage, scrollToBottom]
    );

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <ChatFooter
            onSend={handleSendMessage}
            loading={loading}
            promptLimitReached={promptLimitReached}
            onLayout={handleFooterLayout}
          />
        </BottomSheetFooter>
      ),
      [loading, promptLimitReached, handleSendMessage, handleFooterLayout]
    );

    // Bottom padding: footer height + extra gap (16) + keyboard height
    const bottomPadding = footerHeight + 16 + keyboardHeight;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['68%']}
        enableDynamicSizing={false}
        enableDismissOnClose
        enablePanDownToClose
        enableOverDrag={false}
        topInset={insets.top}
        bottomInset={0}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        onChange={handleSheetStateChange}
        onDismiss={() => {
          setIsSheetOpen(false);
          onOpenChange?.(false);
        }}
        backdropComponent={(props) =>
          !isSheetOpen ? null : (
            <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
              <BlurView
                pointerEvents="none"
                intensity={90}
                tint="dark"
                experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
                style={StyleSheet.absoluteFillObject}
              />
              <View pointerEvents="none" style={styles.backdropTint} />
              <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.05}
                pressBehavior="close"
              />
            </View>
          )
        }
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        footerComponent={renderFooter}
        style={styles.sheetModal}
      >
        <View style={styles.container}>
          <BottomSheetFlatList<Message>
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: bottomPadding },
            ]}
            onContentSizeChange={() => scrollToBottom(true, 100)}
            onLayout={() => scrollToBottom(false, 100)}
            ListFooterComponent={
              messages.length === 0 ? (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionLabel}>Question Suggestions:</Text>
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={`suggestion-${index}`}
                      activeOpacity={0.9}
                      style={[
                        styles.suggestionChip,
                        index === 0 ? styles.suggestionChipPrimary : null,
                        promptLimitReached ? styles.suggestionChipDisabled : null,
                      ]}
                      disabled={promptLimitReached}
                      onPress={() => sendMessage(item)}
                    >
                      <Text style={styles.suggestionText} numberOfLines={2}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{ height: 30 }} />
              )
            }
            renderItem={({ item }) => {
              const isUser = item.role === 'user';
              const isIntro = item.id === 'intro';

              return (
                <View
                  style={[
                    styles.bubbleRow,
                    isUser ? styles.userRow : styles.botRow,
                    isIntro ? styles.introRow : null,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.botAvatar}>
                      <Ionicons name="sparkles" size={15} color="#150A05" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.botBubble,
                      isIntro ? styles.introBubble : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.botText,
                        isIntro ? styles.introText : null,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>

                  {isUser && (
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={20} color="#F28C52" />
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090302', overflow: 'hidden' },
  sheetBackground: {
    backgroundColor: '#090302',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  sheetModal: { overflow: 'hidden' },
  backdropTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 4, 2, 0.45)' },
  handleIndicator: { backgroundColor: '#30241E', width: 46, height: 5, borderRadius: 999 },
  listContent: { flexGrow: 1, paddingTop: 14, paddingHorizontal: 16 },
  bubbleRow: { width: '100%', marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' },
  introRow: { marginBottom: 20 },
  botRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F28C52',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#4A301E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 2,
    backgroundColor: '#120803',
  },
  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14 },
  introBubble: { maxWidth: '81%', paddingTop: 14, paddingBottom: 14 },
  botBubble: { backgroundColor: '#4A290F', borderTopLeftRadius: 10 },
  userBubble: {
    backgroundColor: '#1A0D07',
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: '#24140D',
  },
  messageText: { fontSize: 15, lineHeight: 23 },
  introText: { fontSize: 16, lineHeight: 24 },
  botText: { color: '#FFF6EE', fontWeight: '500' },
  userText: { color: '#FFF6EE', fontWeight: '500', textDecorationLine: 'underline' },
  suggestionsSection: { paddingTop: 2, paddingLeft: 2 },
  suggestionLabel: { color: '#E1D1C4', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  suggestionChip: {
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: '#E68549',
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
    width: '73%',
  },
  suggestionChipPrimary: { backgroundColor: '#F6AA97' },
  suggestionChipDisabled: { opacity: 0.55 },
  suggestionText: { color: '#4A2415', fontSize: 15, lineHeight: 21, fontWeight: '700' },
  footerContainer: {
    backgroundColor: '#090302',
    borderTopWidth: 1,
    borderTopColor: '#20110B',
    paddingTop: 10,
    paddingHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  footerBlur: { position: 'absolute', top: 0, left: 0, right: 0, height: 24 },
  inputContainer: {
    minHeight: 64,
    borderRadius: 32,
    backgroundColor: '#1B0E08',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: '#FFF3EA',
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontWeight: '500',
    maxHeight: 120,
  },
  micButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4E2F1B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 2,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4A2B18',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 2,
  },
  sendActive: { backgroundColor: '#F28C52' },
});

export default ChatBottomSheet;