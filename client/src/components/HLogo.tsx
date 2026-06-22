import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Polyline, Circle } from 'react-native-svg';
import Dot from './Dot';
import { useTheme } from '../contexts/ThemeContext';

interface HLogoProps { role?: 'patient' | 'doctor'; }

export default function HLogo({ role }: HLogoProps) {
  const { colors } = useTheme();
  const s = 38;
  const accent = role === 'doctor' ? colors.secondary : colors.primary;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={styles.container}>
      <Svg width={s} height={s} viewBox="0 0 100 100">
        {/* Patch body */}
        <Rect x="20" y="18" width="60" height="64" rx="14" fill="#0a1e35" stroke={accent} strokeWidth="1.5" />

        {/* Inner screen */}
        <Rect x="25" y="24" width="50" height="44" rx="8" fill="#050d1a" />

        {/* LIVE indicator */}
        <AnimatedCircle cx="32" cy="31" r="3" fill={accent} opacity={pulseAnim} />

        {/* Waveform */}
        <Polyline
          points="28,52 34,52 37,42 41,62 45,38 49,58 53,52 58,52 61,44 64,52 70,52"
          fill="none"
          stroke={accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bottom label bar */}
        <Rect x="36" y="58" width="28" height="12" rx="2" fill="#0d1e30" stroke="#1a3050" strokeWidth="1" />

        {/* Heart */}
        <Circle cx="82" cy="72" r="3" fill="#3b82f6" />
      </Svg>
      {role ? (
        <View style={styles.roleWrap}>
          <Dot on size={7} />
          <Text style={[styles.roleText, { color: accent }]}>{role === 'doctor' ? 'Médecin' : 'Patient'}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  roleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
  roleText: { fontFamily: 'Inter_400Regular', fontSize: 11, marginLeft: 4 },
});
