import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';
import { colors } from '../constants/colors';

interface LogoProps { size?: number; text?: boolean; }

export default function Logo({ size = 120, text = true }: LogoProps) {
  const spinCW = useRef(new Animated.Value(0)).current;
  const spinCCW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cw = Animated.loop(Animated.timing(spinCW, { toValue: 1, duration: 12000, useNativeDriver: true }));
    const ccw = Animated.loop(Animated.timing(spinCCW, { toValue: 1, duration: 18000, useNativeDriver: true }));
    cw.start(); ccw.start();
    return () => { cw.stop(); ccw.stop(); };
  }, []);

  const rotateCW = spinCW.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateCCW = spinCCW.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const cx = size / 2; const cy = size / 2;
  const outerR = size * 0.45; const innerR = size * 0.32;

  return (
    <View style={[styles.container, { width: size, height: text ? 'auto' : size }]}>
      <View style={{ width: size, height: size }}>
        <Animated.View style={[styles.ringWrap, { width: size, height: size, transform: [{ rotate: rotateCW }] }]}>
          <Svg width={size} height={size}><Circle cx={cx} cy={cy} r={outerR} fill="none" stroke={colors.primary} strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6} /></Svg>
        </Animated.View>
        <Animated.View style={[styles.ringWrap, { width: size, height: size, transform: [{ rotate: rotateCCW }] }]}>
          <Svg width={size} height={size}><Circle cx={cx} cy={cy} r={innerR} fill="none" stroke={colors.primary} strokeWidth={1.5} strokeDasharray="4 2" opacity={0.4} /></Svg>
        </Animated.View>
        <View style={[styles.centerIcon, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <G transform={`translate(${cx - size * 0.15}, ${cy - size * 0.15})`}>
              <Rect x={0} y={0} width={size * 0.3} height={size * 0.3} rx={size * 0.05} fill="none" stroke={colors.primary} strokeWidth={2} />
              <Path d={`M${size * 0.06},${size * 0.15} L${size * 0.24},${size * 0.15}`} stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round" />
              <Path d={`M${size * 0.15},${size * 0.06} L${size * 0.15},${size * 0.24}`} stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round" />
            </G>
          </Svg>
        </View>
      </View>
      {text && (
        <View style={styles.textWrap}>
          <Text style={[styles.brandName, { fontSize: size * 0.16 }]}>MedPatch.io</Text>
          <Text style={[styles.tagline, { fontSize: size * 0.08 }]}>Surveillance médicale intelligente</Text>
          <View style={styles.badges}>
            {['Bluetooth LE', 'Temps réel', 'Sécurisé'].map((b) => (
              <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  ringWrap: { position: 'absolute', left: 0, top: 0 },
  centerIcon: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  textWrap: { alignItems: 'center', marginTop: 12 },
  brandName: { fontFamily: 'Exo2_800ExtraBold', color: colors.primary },
  tagline: { fontFamily: 'Inter_400Regular', color: colors.textMuted, marginTop: 4 },
  badges: { flexDirection: 'row', marginTop: 8, gap: 8 },
  badge: { backgroundColor: 'rgba(0, 229, 196, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 229, 196, 0.3)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: 'Inter_400Regular', fontSize: 9, color: colors.primary },
});
