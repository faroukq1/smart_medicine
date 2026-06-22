import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PatientDashboardScreen from '../screens/PatientDashboardScreen';
import DoctorDashboardScreen from '../screens/DoctorDashboardScreen';
import { useTheme } from '../contexts/ThemeContext';

export type RootStackParamList = {
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  PatientDashboard: { user: any };
  DoctorDashboard: { user: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colors } = useTheme();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
        <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
