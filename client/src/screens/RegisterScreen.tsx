import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '../api/AuthProvider';
import { useTheme } from '../contexts/ThemeContext';
import {
  registerStep1Schema, registerStep2PatientSchema, registerStep2DoctorSchema,
  RegisterStep1FormData, RegisterStep2PatientFormData, RegisterStep2DoctorFormData,
} from '../schemas/authSchemas';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import AppSelect from '../components/ui/AppSelect';
import Logo from '../components/Logo';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'Register'>;
type Role = 'patient' | 'doctor';

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuthContext();
  const { colors } = useTheme();
  const [role, setRole] = useState<Role>('patient');
  const [step, setStep] = useState<1 | 2>(1);
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const step1Form = useForm<RegisterStep1FormData>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' },
  });
  const step2Form = useForm<RegisterStep2PatientFormData | RegisterStep2DoctorFormData>({
    resolver: zodResolver(role === 'patient' ? registerStep2PatientSchema : registerStep2DoctorSchema),
    defaultValues: role === 'patient'
      ? { dob: '', gender: 'Homme', weight: '', height: '', condition: 'Diabète Type 2' }
      : { specialty: 'Médecine générale', license: '', hospital: '', city: '' },
  });

  useEffect(() => { step2Form.reset(); }, [role]);

  const handleStep1 = () => { step1Form.handleSubmit(() => setStep(2))(); };

  const handleRegister = () => {
    step2Form.handleSubmit(async (step2Data) => {
      setLoading(true); setRegisterError('');
      try {
        const step1Data = step1Form.getValues();
        const payload: Record<string, any> = {
          email: step1Data.email,
          password: step1Data.password,
          firstName: step1Data.firstName,
          lastName: step1Data.lastName,
          phone: step1Data.phone,
          role,
        };
        if (role === 'patient') {
          const p = step2Data as RegisterStep2PatientFormData;
          payload.dob = p.dob;
          payload.gender = p.gender;
          payload.condition = p.condition;
          if (p.weight) payload.weight = Number(p.weight);
          if (p.height) payload.height = Number(p.height);
        } else {
          const d = step2Data as RegisterStep2DoctorFormData;
          payload.specialty = d.specialty;
          payload.license = d.license;
          payload.hospital = d.hospital;
          if (d.city) payload.city = d.city;
        }
        await register(payload);
        setSuccessName(step1Data.firstName); setSuccess(true);
      } catch (e: any) {
        const msg = e.message || '';
        if (msg.includes('already in use') || msg.includes('EMAIL_IN_USE')) setRegisterError('Cet email est déjà utilisé.');
        else setRegisterError("Erreur lors de l'inscription. Réessayez.");
      } finally { setLoading(false); }
    })();
  };

  const goToDash = () => navigation.replace('Login');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const { control: s1Control, formState: { errors: s1Errors } } = step1Form;
  const { control: s2Control, formState: { errors: s2Errors } } = step2Form as any;

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Bienvenue sur MedPatch, {successName}</Text>
          <Text style={styles.successSub}>Votre compte a été créé avec succès.</Text>
          <View style={styles.successBtn}><AppButton label="Continuer" onPress={goToDash} /></View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoWrap}><Logo size={60} /></View>

            <View style={styles.roleToggle}>
              <TouchableOpacity style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]} onPress={() => setRole('patient')} activeOpacity={0.7}>
                <Text style={[styles.roleBtnText, role === 'patient' && styles.roleBtnTextActive]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, role === 'doctor' && styles.roleBtnActive]} onPress={() => setRole('doctor')} activeOpacity={0.7}>
                <Text style={[styles.roleBtnText, role === 'doctor' && styles.roleBtnTextActive]}>Médecin</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stepIndicator}>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}><Text style={[styles.stepDotNum, step >= 1 && styles.stepDotNumActive]}>1</Text></View>
                <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}><Text style={[styles.stepDotNum, step === 2 && styles.stepDotNumActive]}>2</Text></View>
              </View>
            </View>

            {step === 1 && (
              <>
                <AppInput label="Prénom" control={s1Control} name="firstName" error={s1Errors.firstName?.message} autoCapitalize="words" />
                <AppInput label="Nom" control={s1Control} name="lastName" error={s1Errors.lastName?.message} autoCapitalize="words" />
                <AppInput label="Email" control={s1Control} name="email" error={s1Errors.email?.message} keyboardType="email-address" />
                <AppInput label="Mot de passe" control={s1Control} name="password" error={s1Errors.password?.message} secureTextEntry />
                <AppInput label="Confirmer le mot de passe" control={s1Control} name="confirmPassword" error={s1Errors.confirmPassword?.message} secureTextEntry />
                <AppInput label="Téléphone" control={s1Control} name="phone" error={s1Errors.phone?.message} keyboardType="phone-pad" />
                <View style={styles.submitWrap}><AppButton label="Continuer" onPress={handleStep1} /></View>
              </>
            )}

            {step === 2 && role === 'patient' && (
              <>
                <AppInput label="Date de naissance" control={s2Control} name="dob" error={(s2Errors as any).dob?.message} placeholder="JJ/MM/AAAA" />
                <AppSelect label="Genre" selectedValue={step2Form.watch('gender') as string} onValueChange={(v) => step2Form.setValue('gender', v as any)}
                  items={[{ label: 'Homme', value: 'Homme' }, { label: 'Femme', value: 'Femme' }, { label: 'Autre', value: 'Autre' }]}
                  error={(s2Errors as any).gender?.message} />
                <AppInput label="Poids (kg)" control={s2Control} name="weight" error={(s2Errors as any).weight?.message} keyboardType="numeric" />
                <AppInput label="Taille (cm)" control={s2Control} name="height" error={(s2Errors as any).height?.message} keyboardType="numeric" />
                <AppSelect label="Condition" selectedValue={step2Form.watch('condition') as string} onValueChange={(v) => step2Form.setValue('condition', v as any)}
                  items={[
                    { label: 'Diabète Type 1', value: 'Diabète Type 1' }, { label: 'Diabète Type 2', value: 'Diabète Type 2' },
                    { label: 'Hypertension', value: 'Hypertension' }, { label: 'Insuffisance cardiaque', value: 'Insuffisance cardiaque' },
                    { label: 'Asthme', value: 'Asthme' }, { label: 'Autre', value: 'Autre' },
                  ]}
                  error={(s2Errors as any).condition?.message} />
              </>
            )}

            {step === 2 && role === 'doctor' && (
              <>
                <AppSelect label="Spécialité" selectedValue={step2Form.watch('specialty') as string} onValueChange={(v) => step2Form.setValue('specialty', v as any)}
                  items={[
                    { label: 'Cardiologie', value: 'Cardiologie' }, { label: 'Diabétologie', value: 'Diabétologie' },
                    { label: 'Médecine générale', value: 'Médecine générale' }, { label: 'Neurologie', value: 'Neurologie' },
                    { label: 'Pneumologie', value: 'Pneumologie' }, { label: 'Autre', value: 'Autre' },
                  ]}
                  error={(s2Errors as any).specialty?.message} />
                <AppInput label="Numéro de licence" control={s2Control} name="license" error={(s2Errors as any).license?.message} />
                <AppInput label="Hôpital" control={s2Control} name="hospital" error={(s2Errors as any).hospital?.message} autoCapitalize="words" />
                <AppInput label="Ville" control={s2Control} name="city" error={(s2Errors as any).city?.message} autoCapitalize="words" />
              </>
            )}

            {step === 2 && (
              <>
                {registerError ? <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{registerError}</Text></View> : null}
                <View style={styles.submitWrap}><AppButton label="S'inscrire" onPress={handleRegister} loading={loading} /></View>
                <TouchableOpacity onPress={() => setStep(1)} style={styles.backStep}><Text style={styles.backStepText}>← Retour</Text></TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Déjà un compte ?</Text>
              <AppButton label="Se connecter" onPress={() => navigation.navigate('Login')} variant="ghost" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  roleToggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, padding: 3, marginBottom: 20 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  roleBtnActive: { backgroundColor: colors.primary },
  roleBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.textMuted },
  roleBtnTextActive: { color: '#fff' },
  stepIndicator: { marginBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.textDim, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  stepDotNum: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.textDim },
  stepDotNumActive: { color: '#fff' },
  stepLine: { width: 40, height: 2, backgroundColor: colors.textDim, marginHorizontal: 8 },
  stepLineActive: { backgroundColor: colors.primary },
  submitWrap: { marginTop: 8 },
  errorBanner: { backgroundColor: 'rgba(255, 64, 96, 0.15)', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, padding: 12, marginBottom: 16 },
  errorBannerText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.danger, textAlign: 'center' },
  backStep: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  backStepText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 8 },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textMuted },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIcon: { fontSize: 56, color: colors.primary, marginBottom: 20 },
  successTitle: { fontFamily: 'Exo2_800ExtraBold', fontSize: 24, color: colors.textBright, textAlign: 'center', marginBottom: 8 },
  successSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  successBtn: { width: '100%', maxWidth: 300 },
});
