import React, { useCallback, useEffect, useRef } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const THRESHOLD = 0.92;
const SNAP_SPRING = { damping: 18, stiffness: 220, mass: 0.8 };

function maxTranslateForWidth(containerWidth: number) {
  return Math.max(0, containerWidth - 60);
}

type SwipeButtonProps = {
  title: string;
  onComplete: () => void;
  resetTrigger?: number;
};

export default function SwipeButton({
  title,
  onComplete,
  resetTrigger = 0,
}: SwipeButtonProps) {
  const hasCompletedRef = useRef(false);
  const translateX = useSharedValue(0);
  const maxDrag = useSharedValue(0);
  const dragStartX = useSharedValue(0);

  const emitComplete = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    hasCompletedRef.current = false;
    translateX.value = withSpring(0, SNAP_SPRING);
  }, [resetTrigger, translateX]);

  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      maxDrag.value = maxTranslateForWidth(e.nativeEvent.layout.width);
    },
    [maxDrag]
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((e) => {
      const max = maxDrag.value;
      const next = dragStartX.value + e.translationX;
      translateX.value = Math.min(Math.max(0, next), max);
    })
    .onEnd(() => {
      const max = maxDrag.value;

      if (max <= 0) {
        translateX.value = withSpring(0, SNAP_SPRING);
        return;
      }

      if (translateX.value >= max * THRESHOLD) {
        translateX.value = withSpring(max, SNAP_SPRING);
        runOnJS(emitComplete)();
      } else {
        translateX.value = withSpring(0, SNAP_SPRING);
      }
    });

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <Text style={styles.text}>{title}</Text>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.icon, iconAnimatedStyle]}>
          <Ionicons name="chevron-forward" size={24} color="#FF8C5A" />
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#FF8C5A"
            style={styles.secondArrow}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 58,
    borderRadius: 30,
    backgroundColor: '#FF8C5A',
    justifyContent: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  icon: {
    position: 'absolute',
    left: 8,
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: '#1a0d06',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  secondArrow: {
    marginLeft: -10,
  },
  text: {
    color: '#1a0d06',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 56,
  },
});
