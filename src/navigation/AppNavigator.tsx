import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '../viewmodels/useSession';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import ArticleScreen from '../screens/Article/ArticleScreen';

const Stack = createNativeStackNavigator();
const APP_BACKGROUND = '#140a05';
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: APP_BACKGROUND,
    card: APP_BACKGROUND,
    border: '#24170e',
    notification: '#FF8C5A',
    primary: '#FF8C5A',
    text: '#F5EDE7',
  },
};

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      id="authenticated-stack"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: APP_BACKGROUND },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Article" component={ArticleScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF8C5A" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {session ? <AuthenticatedStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_BACKGROUND,
  },
});
