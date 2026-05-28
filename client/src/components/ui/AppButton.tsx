import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

export default function AppButton({ label, onPress, loading = false, variant = 'primary' }: AppButtonProps) {
  if (variant === 'ghost') {
    return (
      <TouchableOpacity style={styles.ghostBtn} onPress={onPress} disabled={loading} activeOpacity={0.7}>
        {loading ? <ActivityIndicator color={colors.primary} size="small" /> : <Text style={styles.ghostText}>{label}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8}>
      <LinearGradient colors={['#00e5c4', '#0077ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.primaryText}>{label}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },
  ghostBtn: {
    borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent',
  },
  ghostText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.primary },
});
