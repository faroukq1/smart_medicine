import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../contexts/ThemeContext';

interface AppSelectProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  error?: string;
}

export default function AppSelect({ label, selectedValue, onValueChange, items, error }: AppSelectProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerWrapper, error ? { borderColor: colors.danger } : null]}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor={colors.textMuted}>
          <Picker.Item label="Sélectionner..." value="" color={colors.textDim} />
          {items.map((item) => <Picker.Item key={item.value} label={item.label} value={item.value} color={colors.textBright} />)}
        </Picker>
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  pickerWrapper: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' },
  picker: { color: colors.textBright, backgroundColor: 'transparent', height: 48 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
});
