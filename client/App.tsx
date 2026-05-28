import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/api/AuthProvider';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
