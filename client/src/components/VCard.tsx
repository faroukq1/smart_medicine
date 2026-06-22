import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Spark from './Spark';
import { useTheme } from '../contexts/ThemeContext';

interface VCardProps {
  label: string; value: string | number; unit: string; icon: string;
  color?: string; spark?: number[]; warn?: boolean;
}

export default function VCard({ label, value, unit, icon, color = '#00e5c4', spark, warn }: VCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.card, warn && { borderColor: colors.danger }]}>
      {warn && <View style={[styles.warnBar, { backgroundColor: colors.danger }]} />}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {spark ? <View style={styles.sparkWrap}><Spark data={spark} color={color} height={32} /></View> : null}
        </View>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', flex: 1, minWidth: '48%', minHeight: 130 },
  warnBar: { height: 3 },
  content: { padding: 14, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 16, marginRight: 6 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontFamily: 'Exo2_800ExtraBold', fontSize: 26, color: colors.textBright },
  sparkWrap: { marginLeft: 4 },
  unit: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
