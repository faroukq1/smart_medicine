import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface DotProps { on: boolean; size?: number; }

export default function Dot({ on, size = 10 }: DotProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 2.4, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [on]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {on && (
        <Animated.View style={[styles.ring, {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: colors.primary,
          transform: [{ scale: pulseAnim }],
          opacity: pulseAnim.interpolate({ inputRange: [1, 2.4], outputRange: [0.6, 0] }),
        }]} />
      )}
      <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: on ? colors.primary : colors.textDim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  dot: {},
});
