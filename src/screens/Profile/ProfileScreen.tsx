import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@supabase/supabase-js';

import { supabase } from '../../services/supabase';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF8C5A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <View style={styles.topBlock}>
          <Text style={styles.screenTitle}>Profile</Text>

          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>Email</Text>
            <Text style={styles.emailValue}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.85}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#140a05',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#140a05',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  topBlock: {
    width: '100%',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 28,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  emailCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#24170e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 32,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a6a5a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emailValue: {
    fontSize: 16,
    color: '#FFF6EE',
    fontWeight: '500',
    lineHeight: 22,
  },
  signOutButton: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#FF8C5A',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutText: {
    color: '#140a05',
    fontWeight: '700',
    fontSize: 16,
  },
});
