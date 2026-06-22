import { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect, Polyline, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface LogoProps { size?: number; text?: boolean; }

export default function Logo({ size = 120, text = true }: LogoProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
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

  const vw = 100;
  const s = size / vw;

  return (
    <View style={[styles.container, { width: size, height: text ? 'auto' : size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${vw} ${vw}`}>
        {/* Patch body */}
        <Rect x="20" y="18" width="60" height="64" rx="14" fill="#0a1e35" stroke={colors.primary} strokeWidth="1.5" />

        {/* Inner screen */}
        <Rect x="25" y="24" width="50" height="44" rx="8" fill="#050d1a" />

        {/* LIVE indicator */}
        <AnimatedCircle cx="32" cy="31" r="3" fill={colors.primary} opacity={pulseAnim} />
        <SvgText x="38" y="34.5" fontSize="7" fill={colors.primary} fontFamily="monospace" fontWeight="700">LIVE</SvgText>

        {/* Bluetooth icon placeholder */}
        <Rect x="63" y="25" width="10" height="10" rx="3" fill="#1a2e4a" />
        <SvgText x="65.5" y="33" fontSize="7" fill="#6b8fa8">ᛒ</SvgText>

        {/* Waveform */}
        <Polyline
          points="28,52 34,52 37,42 41,62 45,38 49,58 53,52 58,52 61,44 64,52 70,52"
          fill="none"
          stroke={colors.primary}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bottom label bar */}
        <Rect x="36" y="58" width="28" height="12" rx="2" fill="#0d1e30" stroke="#1a3050" strokeWidth="1" />

        {/* Connection lines left */}
        <Line x1="30" y1="61" x2="36" y2="61" stroke="#1a3050" strokeWidth="1" />
        <Line x1="30" y1="64" x2="36" y2="64" stroke="#1a3050" strokeWidth="1" />
        <Line x1="30" y1="67" x2="36" y2="67" stroke="#1a3050" strokeWidth="1" />

        {/* Connection lines right */}
        <Line x1="64" y1="61" x2="70" y2="61" stroke="#1a3050" strokeWidth="1" />
        <Line x1="64" y1="64" x2="70" y2="64" stroke="#1a3050" strokeWidth="1" />
        <Line x1="64" y1="67" x2="70" y2="67" stroke="#1a3050" strokeWidth="1" />

        {/* nRF52 label */}
        <SvgText x="50" y="67" fontSize="5.5" fill="#4a7fa5" fontFamily="monospace" textAnchor="middle">nRF52</SvgText>

        {/* Heart */}
        <SvgText x="18" y="76" fontSize="9" fill="#ec4899">♥</SvgText>

        {/* Bluetooth dot */}
        <Circle cx="82" cy="72" r="3" fill="#3b82f6" />
      </Svg>

      {text && (
        <View style={styles.textWrap}>
          <Text style={[styles.brandName, { fontSize: size * 0.16 }]}>MedPatch.io</Text>
          <Text style={[styles.tagline, { fontSize: size * 0.08 }]}>Surveillance médicale intelligente</Text>
          <View style={styles.badges}>
            {['Temps réel', 'Sécurisé'].map((b) => (
              <View key={b} style={[styles.badge, { borderColor: colors.primary, backgroundColor: 'rgba(0, 229, 196, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  container: { alignItems: 'center' },
  textWrap: { alignItems: 'center', marginTop: 12 },
  brandName: { fontFamily: 'Exo2_800ExtraBold', color: colors.primary },
  tagline: { fontFamily: 'Inter_400Regular', color: colors.textMuted, marginTop: 4 },
  badges: { flexDirection: 'row', marginTop: 8, gap: 8 },
  badge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: 'Inter_400Regular', fontSize: 9 },
});
