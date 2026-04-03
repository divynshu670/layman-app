import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SwipeButton from '../../components/SwipeButton';
import { AuthStackParamList } from '../../navigation/types';

type WelcomeNavigation = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavigation>();
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    navigation.preload('Auth');
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setResetKey((prev) => prev + 1);
    }, [])
  );

  return (
    <LinearGradient
      colors={['#5a2d16', '#1a0d06', '#000000', '#1a0d06', '#5a2d16']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.brand}>Layman</Text>

        <View style={styles.textWrapper}>
          <Text style={styles.line1}>Business,</Text>
          <Text style={styles.line1}>tech & startups</Text>
          <Text style={styles.line2}>made simple</Text>
        </View>

        <View style={styles.bottom}>
          <SwipeButton
            title="Swipe to get started"
            onComplete={() => navigation.navigate('Auth')}
            resetTrigger={resetKey}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  brand: {
    marginTop: 20,
    textAlign: 'center',
    color: '#F5EDE7',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textWrapper: {
    alignItems: 'center',
  },
  line1: {
    color: '#F5EDE7',
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 40,
  },
  line2: {
    color: '#FF8C5A',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: -4,
  },
  bottom: {
    marginBottom: 20,
  },
});
