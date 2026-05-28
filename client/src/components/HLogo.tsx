import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import Dot from './Dot';
import { colors } from '../constants/colors';

interface HLogoProps { role?: 'patient' | 'doctor'; }

export default function HLogo({ role }: HLogoProps) {
  const s = 38;
  const accent = role === 'doctor' ? colors.secondary : colors.primary;
  return (
    <View style={styles.container}>
      <Svg width={s} height={s}>
        <Circle cx={s/2} cy={s/2} r={s*0.44} fill="none" stroke={accent} strokeWidth={1} strokeDasharray="4 2" opacity={0.5} />
        <Rect x={s*0.2} y={s*0.2} width={s*0.6} height={s*0.6} rx={s*0.08} fill="none" stroke={accent} strokeWidth={1.5} />
        <Path d={`M${s*0.32},${s*0.5} L${s*0.68},${s*0.5}`} stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
        <Path d={`M${s*0.5},${s*0.32} L${s*0.5},${s*0.68}`} stroke={accent} strokeWidth={1.2} strokeLinecap="round" />
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
