import { StyleSheet, Text, View } from 'react-native';
import Dot from './Dot';
import { colors } from '../constants/colors';

interface PatchBarProps {
  connected: boolean;
}

export default function PatchBar({ connected }: PatchBarProps) {
  return (
    <View style={styles.bar}>
      <Dot on={connected} size={8} />
      <Text style={styles.label}>
        {connected ? 'Patch connecté' : 'Patch déconnecté'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.textBright,
  },
});
