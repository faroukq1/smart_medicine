import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { colors } from '../../constants/colors';

interface AppInputProps<T extends FieldValues> {
  label: string;
  control: Control<T>;
  name: Path<T>;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export default function AppInput<T extends FieldValues>({
  label,
  control,
  name,
  error,
  secureTextEntry,
  keyboardType = 'default',
  placeholder,
  autoCapitalize = 'none',
}: AppInputProps<T>) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              focused && styles.inputFocused,
              error ? styles.inputError : null,
            ]}
            value={value}
            onChangeText={onChange}
            onBlur={() => { setFocused(false); onBlur(); }}
            onFocus={() => setFocused(true)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={colors.textDim}
            autoCapitalize={autoCapitalize}
          />
        )}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  input: {
    fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.textBright,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.danger, marginTop: 4 },
});
