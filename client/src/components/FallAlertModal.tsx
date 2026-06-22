import React, { useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface FallAlertModalProps {
  visible: boolean;
  onDismiss: () => void;
  patientName?: string;
}

export default function FallAlertModal({ visible, onDismiss, patientName }: FallAlertModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { borderColor: colors.danger }]}>
          <View style={[styles.iconCircle, { backgroundColor: "rgba(255,64,96,0.15)" }]}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={[styles.title, { color: colors.danger }]}>Chute détectée !</Text>
          {patientName ? (
            <Text style={[styles.patientName, { color: colors.textBright }]}>{patientName}</Text>
          ) : null}
          <Text style={[styles.subtitle, { color: colors.textBright }]}>
            Une chute a été détectée par le patch médical. Veuillez vérifier
            l'état du patient immédiatement.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.danger }]}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>J'ai pris connaissance</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  patientName: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
