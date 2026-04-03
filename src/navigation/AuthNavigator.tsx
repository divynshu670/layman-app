import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/Auth/AuthScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();
const AUTH_FLOW_BACKGROUND = '#140a05';

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      id="auth-stack"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: AUTH_FLOW_BACKGROUND },
      }}
    >
      <Stack.Screen component={WelcomeScreen} name="Welcome" />
      <Stack.Screen component={AuthScreen} name="Auth" />
    </Stack.Navigator>
  );
}
