import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { FALLBACK_IMAGE } from '../constants/images';
import { validateImageUrl } from '../utils/validateImage';

interface Props {
  title: string;
  imageUrl?: string | null;
  onPress?: () => void;
  width?: number;
}

export default function FeaturedCard({ title, imageUrl, onPress, width }: Props) {
  const [imgError, setImgError] = useState(false);
  const safeUrl = validateImageUrl(imageUrl);

  return (
    <TouchableOpacity
      style={[styles.container, width ? { width } : null]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: imgError ? FALLBACK_IMAGE : safeUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
        onError={() => setImgError(true)}
      >
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 246,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#24170e',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  textContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'left',
  },
});
