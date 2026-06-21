import React, { useEffect, useState, useRef } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '../api/AuthProvider';
import { loginSchema, LoginFormData } from '../schemas/authSchemas';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import Logo from '../components/Logo';
import { colors } from '../constants/colors';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true); 
    setLoginError('');
    try {
      const user = await login(data.email.trim(), data.password);
      console.log(user);
      if (user.role === 'patient') navigation.replace('PatientDashboard', { user });
      else navigation.replace('DoctorDashboard', { user });
    } catch (e: any) {
      console.log(e)
      const msg = e.message || '';
      if (msg.includes('Invalid') || msg.includes('invalid')) setLoginError('Email ou mot de passe incorrect.');
      else setLoginError('Erreur de connexion. Réessayez.');
    } finally { 
      setLoading(false);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoWrap}><Logo size={80} /></View>
            <AppInput label="Email" control={control} name="email" error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" placeholder="vous@exemple.com" />
            <AppInput label="Mot de passe" control={control} name="password" error={errors.password?.message} secureTextEntry placeholder="Votre mot de passe" />
            {loginError ? <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{loginError}</Text></View> : null}
            <View style={styles.submitWrap}><AppButton label="Se connecter" onPress={handleSubmit(onSubmit)} loading={loading} /></View>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Pas encore de compte ?</Text>
              <AppButton label="S'inscrire" onPress={() => navigation.navigate('Register')} variant="ghost" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  errorBanner: { backgroundColor: 'rgba(255, 64, 96, 0.15)', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorBannerText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.danger, textAlign: 'center' },
  submitWrap: { marginTop: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 8 },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textMuted },
});
