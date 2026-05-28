import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../constants/colors";

interface FallAlertModalProps {
  visible: boolean;
  onDismiss: () => void;
  patientName?: string;
}

export default function FallAlertModal({ visible, onDismiss, patientName }: FallAlertModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={styles.title}>Chute détectée !</Text>
          {patientName ? (
            <Text style={styles.patientName}>{patientName}</Text>
          ) : null}
          <Text style={styles.subtitle}>
            Une chute a été détectée par le patch médical. Veuillez vérifier
            l'état du patient immédiatement.
          </Text>
          <TouchableOpacity
            style={styles.button}
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

const styles = StyleSheet.create({
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
    borderColor: colors.danger,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,64,96,0.15)",
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
    color: colors.danger,
    textAlign: "center",
    marginBottom: 12,
  },
  patientName: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 18,
    color: colors.textBright,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textBright,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.danger,
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
