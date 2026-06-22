import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '../api/AuthProvider';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'Loading'>;

export default function LoadingScreen() {
  const navigation = useNavigation<Nav>();
  const { user, loading } = useAuthContext();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigation.replace('Login');
      return;
    }
    if (user.role === 'patient') {
      navigation.replace('PatientDashboard', { user });
    } else {
      navigation.replace('DoctorDashboard', { user });
    }
  }, [loading, user]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Logo size={100} text={false} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textMuted, marginTop: 20 },
});
