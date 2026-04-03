import { useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FALLBACK_IMAGE } from '../constants/images';
import { validateImageUrl } from '../utils/validateImage';

interface Props {
  title: string;
  imageUrl?: string | null;
  category?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onRemovePress?: () => void;
}

export default function ArticleRow({
  title,
  imageUrl,
  onPress,
  onLongPress,
}: Props) {
  const [imgError, setImgError] = useState(false);
  const safeUrl = validateImageUrl(imageUrl);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.rowPress}
        activeOpacity={0.85}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Image
          source={{ uri: imgError ? FALLBACK_IMAGE : safeUrl }}
          style={styles.image}
          onError={() => setImgError(true)}
        />

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={3}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#24170e',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  rowPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  removeBtn: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: '#3a2418',
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
});
