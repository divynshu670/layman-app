import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';

export default function AuthScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    name,
    email,
    password,
    loading,
    error,
    isLogin,
    setName,
    setEmail,
    setPassword,
    toggleMode,
    submit,
  } = useAuthViewModel();

  return (
    <LinearGradient
      colors={['#1a0d06', '#24170e', '#2d1512']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.topSection}>
            <Text style={styles.logoText}>Layman</Text>
          </View>

          <View style={styles.centerSection}>
            <Text style={styles.title}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Login to continue' : 'Sign up to get started'}
            </Text>

            <View style={styles.inputsContainer}>
              {!isLogin ? (
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#cabfb7"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              ) : null}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#cabfb7"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor="#cabfb7"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  activeOpacity={0.8}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#cabfb7"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.9}
              disabled={loading}
              onPress={() => {
                void submit();
              }}
            >
              {loading ? (
                <ActivityIndicator color="#1a0d06" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isLogin ? 'Login' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.bottomText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.bottomTextHighlight} onPress={toggleMode}>
                {isLogin ? 'Sign up' : 'Login'}
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoText: {
    color: '#FF8C5A',
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
  },
  centerSection: {
    alignItems: 'center',
  },
  title: {
    color: '#fff3ea',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#cabfb7',
    fontSize: 16,
    marginBottom: 28,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  inputsContainer: {
    width: '100%',
    marginBottom: 22,
    gap: 16,
  },
  errorText: {
    width: '100%',
    color: '#ffb4a8',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  input: {
    width: '100%',
    backgroundColor: '#1a0d06',
    color: '#fff9f3',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    letterSpacing: 0.2,
    borderWidth: 1,
    borderColor: '#23190e',
  },
  passwordWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#FF8C5A',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#FF8C5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.23,
    shadowRadius: 16,
    elevation: 6,
  },
  loginButtonText: {
    color: '#1a0d06',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomText: {
    color: '#cabfb7',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  bottomTextHighlight: {
    color: '#FF8C5A',
    fontWeight: '700',
  },
});
