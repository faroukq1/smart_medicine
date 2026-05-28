import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuthContext } from "../api/AuthProvider";
import * as api from "../api/api";
import { DEMO_PATIENTS } from "../constants/demoData";
import HLogo from "../components/HLogo";
import VCard from "../components/VCard";
import Dot from "../components/Dot";
import FallAlertModal from "../components/FallAlertModal";
import { colors } from "../constants/colors";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Nav = StackNavigationProp<RootStackParamList, "DoctorDashboard">;
type Route = RouteProp<RootStackParamList, "DoctorDashboard">;
type PatientTab = "vitals" | "history" | "alerts" | "notes";
const patientTabLabels: Record<PatientTab, string> = {
  vitals: "Signes vitaux",
  history: "Historique",
  alerts: "Alertes",
  notes: "Notes",
};

const PAGE_SIZE = 15;

export default function DoctorDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const routeUser = route.params.user;
  const { user: authUser, logout } = useAuthContext();
  const user = routeUser || authUser;
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<PatientTab>("vitals");
  const [showPatientList, setShowPatientList] = useState(false);
  const [apiPatients, setApiPatients] = useState<any[]>([]);
  const [patientsCursor, setPatientsCursor] = useState<string | null>(null);
  const [patientsHasMore, setPatientsHasMore] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const [selectedVitals, setSelectedVitals] = useState<any[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedAlerts, setSelectedAlerts] = useState<any[]>([]);
  const [alertsCursor, setAlertsCursor] = useState<string | null>(null);
  const [alertsHasMore, setAlertsHasMore] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [selectedLatest, setSelectedLatest] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [showFallModal, setShowFallModal] = useState(false);
  const lastFallIdRef = useRef<string | null>(null);
  const fallDismissedRef = useRef<Set<string>>(new Set());
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchPatientsPage = useCallback(async (cursor?: string | null) => {
    setPatientsLoading(true);
    try {
      const result = await api.getPatients(cursor ?? undefined, PAGE_SIZE);
      const newData = result.data ?? [];
      if (cursor) {
        setApiPatients((prev) => [...prev, ...newData]);
      } else {
        setApiPatients(newData);
      }
      setPatientsCursor(result.nextCursor);
      setPatientsHasMore(result.hasMore);
    } catch {
    } finally {
      setPatientsLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPatientsPage();
  }, []);

  const fetchPatientOverview = useCallback(async (patientId: string) => {
    try {
      const [vitalsRes, latest, fallAlertsRes] = await Promise.all([
        api.getVitals(patientId, undefined, 10),
        api.getLatestVitals(patientId),
        api.getPatientAlerts(patientId, undefined, 1, 'fall'),
      ]);
      if (vitalsRes?.data?.length) setSelectedVitals(vitalsRes.data);
      if (latest) setSelectedLatest(latest);

      if (!fallDismissedRef.current.has(patientId)) {
        const latestFall = fallAlertsRes?.data?.[0];
        if (latestFall && !latestFall.resolved && latestFall.id !== lastFallIdRef.current) {
          lastFallIdRef.current = latestFall.id;
          setShowFallModal(true);
        }
      }
    } catch {}
  }, []);

  const fetchHistoryPage = useCallback(async (patientId: string, cursor?: string | null) => {
    setHistoryLoading(true);
    try {
      const res = await api.getVitals(patientId, cursor ?? undefined, PAGE_SIZE);
      const newData = res.data ?? [];
      if (cursor) {
        setSelectedVitals((prev) => [...prev, ...newData]);
      } else {
        setSelectedVitals(newData);
      }
      setHistoryCursor(res.nextCursor);
      setHistoryHasMore(res.hasMore);
    } catch {
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const getApiMetric = (filter: string) => {
    if (filter === "all") return undefined;
    if (filter === "pressure") return "systolic,diastolic";
    return filter;
  };

  const fetchAlertsPage = useCallback(async (patientId: string, cursor?: string | null, metric?: string) => {
    setAlertsLoading(true);
    try {
      const res = await api.getPatientAlerts(patientId, cursor ?? undefined, PAGE_SIZE, metric);
      const newData = res.data ?? [];
      if (cursor) {
        setSelectedAlerts((prev) => [...prev, ...newData]);
      } else {
        setSelectedAlerts(newData);
      }
      setAlertsCursor(res.nextCursor);
      setAlertsHasMore(res.hasMore);
    } catch {
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedPatient?.id) return;
    fetchPatientOverview(selectedPatient.id);
    const interval = setInterval(() => fetchPatientOverview(selectedPatient.id), 2000);
    return () => clearInterval(interval);
  }, [selectedPatient?.id]);

  useEffect(() => {
    if (activeTab === "alerts" && selectedPatient?.id && selectedAlerts.length === 0) {
      fetchAlertsPage(selectedPatient.id, null, getApiMetric(alertFilter));
    }
  }, [activeTab, selectedPatient?.id]);

  useEffect(() => {
    if (!selectedPatient?.id) return;
    setSelectedAlerts([]);
    setAlertsCursor(null);
    setAlertsHasMore(false);
    fetchAlertsPage(selectedPatient.id, null, getApiMetric(alertFilter));
  }, [alertFilter, selectedPatient?.id]);

  const selectPatient = (p: any) => {
    setSelectedPatient(p);
    setShowPatientList(false);
    setSelectedVitals([]);
    setSelectedAlerts([]);
    setSelectedLatest(null);
    setHistoryCursor(null);
    setHistoryHasMore(false);
    setAlertsCursor(null);
    setAlertsHasMore(false);
    setActiveTab("vitals");
    setAlertFilter("all");
    if (p.id) {
      fetchPatientOverview(p.id);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const handleDismissFall = async () => {
    setShowFallModal(false);
    if (selectedPatient?.id) {
      fallDismissedRef.current.add(selectedPatient.id);
    }
    const fallAlert = selectedAlerts.find(
      (a: any) => a.metric === "fall" && !a.resolved,
    );
    if (fallAlert) {
      try { await api.resolveAlert(fallAlert.id); } catch {}
    }
  };

  const useApi = apiPatients.length > 0;
  const allPatients = useApi
    ? apiPatients.map((p: any) => ({
        id: p.id,
        name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim(),
        age: p.dob
          ? new Date().getFullYear() - new Date(p.dob).getFullYear()
          : 0,
        condition: p.condition,
        gender: p.gender || "—",
        weight: p.weight != null ? `${p.weight} kg` : "—",
        height: p.height != null ? `${p.height} cm` : "—",
        patchConnected: p.device?.connected ?? false,
        patchId: p.device?.patchId || "—",
        battery: p.device?.batteryPct != null ? `${p.device.batteryPct}%` : "—",
        lastSeen: p.device?.lastSeen
          ? new Date(p.device.lastSeen).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "—",
        firmwareVer: p.device?.firmwareVer || "—",
        phone: p.user?.phone || "—",
        dob: p.dob || "—",
        vitals: selectedLatest
          ? {
              glucose: selectedLatest.glucose ?? 0,
              heartRate: selectedLatest.heartRate ?? 0,
              temp: selectedLatest.temperature ?? 0,
              oxygen: selectedLatest.oxygen ?? 0,
              pressure: `${selectedLatest.systolic || "—"}/${selectedLatest.diastolic || "—"}`,
            }
          : { glucose: 0, heartRate: 0, temp: 0, oxygen: 0, pressure: "—" },
        history: selectedVitals.map((v: any) => ({
          id: v.id,
          time: new Date(v.recordedAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          glucose: v.glucose,
          heartRate: v.heartRate,
          temp: v.temperature,
        })),
        alerts: selectedAlerts.map((a: any) => ({
          id: a.id,
          metric: a.metric,
          type: a.metric === "fall" ? "fall" : a.type === "critical" ? "critical" : "warning",
          msg: a.message,
          time: new Date(a.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
        notes: p.notes || "Aucune note.",
      }))
    : DEMO_PATIENTS;

  const selectedData: any = selectedPatient
    ? allPatients.find((p: any) => p.id === selectedPatient.id) ||
      allPatients[0]
    : null;

  const connectedCount = useApi
    ? apiPatients.filter((p: any) => p.device?.connected).length
    : DEMO_PATIENTS.filter((p) => p.patchConnected).length;
  const alertCount = useApi
    ? apiPatients.reduce((s: number, p: any) => s + (p._count?.alerts || 0), 0)
    : DEMO_PATIENTS.reduce((s, p) => s + p.alerts.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HLogo role="doctor" />
        <View style={styles.headerRight}>
          <Text style={styles.userName}>Dr. {user?.lastName || ""}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{connectedCount}</Text>
          <Text style={styles.statLabel}>Patients connectés</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.warning }]}>
            {alertCount}
          </Text>
          <Text style={styles.statLabel}>Alertes</Text>
        </View>
      </View>
      <View style={styles.patientBar}>
        <TouchableOpacity
          style={styles.patientListBtn}
          onPress={() => setShowPatientList(true)}
        >
          <Text style={styles.patientListBtnText}>
            {selectedPatient ? selectedData?.name : "Sélectionner un patient"}
          </Text>
          <Text style={styles.patientListArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {selectedData ? (
        <Animated.View style={[styles.detailContent, { opacity: fadeAnim }]}>
          <View style={styles.tabRow}>
            {(Object.keys(patientTabLabels) as PatientTab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && styles.tabActive]}
                onPress={() => setActiveTab(t)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === t && styles.tabTextActive,
                  ]}
                >
                  {patientTabLabels[t]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "vitals" && (
              <View style={styles.vcardGrid}>
                <VCard
                  label="Glucose"
                  value={selectedData.vitals.glucose}
                  unit="mg/dL"
                  icon="🩸"
                  spark={selectedData.history.map((h: any) => h.glucose)}
                  warn={selectedData.vitals.glucose > 130}
                  color={
                    selectedData.vitals.glucose > 130
                      ? colors.danger
                      : colors.primary
                  }
                />
                <VCard
                  label="Fréquence cardiaque"
                  value={selectedData.vitals.heartRate}
                  unit="bpm"
                  icon="❤️"
                  color={colors.secondary}
                  spark={selectedData.history.map((h: any) => h.heartRate)}
                />
                <VCard
                  label="Température"
                  value={selectedData.vitals.temp}
                  unit="°C"
                  icon="🌡️"
                  color={colors.warning}
                  spark={selectedData.history.map((h: any) => h.temp)}
                />
                <VCard
                  label="Oxygène"
                  value={selectedData.vitals.oxygen}
                  unit="%"
                  icon="🫁"
                  color={colors.primary}
                />
                <VCard
                  label="Pression"
                  value={selectedData.vitals.pressure}
                  unit="mmHg"
                  icon="💓"
                  color={colors.secondary}
                />
              </View>
            )}
            {activeTab === "history" && (
              <>
                {selectedData.history.map((item: any, i: number) => (
                  <View key={item.id || i} style={styles.historyRow}>
                    <Text style={styles.historyTime}>{item.time}</Text>
                    <Text style={styles.historyVal}>{item.glucose} mg/dL</Text>
                    <Text style={styles.historyVal}>{item.heartRate} bpm</Text>
                    <Text style={styles.historyVal}>{item.temp}°C</Text>
                  </View>
                ))}
                {historyHasMore && (
                  <TouchableOpacity
                    style={styles.loadMore}
                    onPress={() => fetchHistoryPage(selectedPatient.id, historyCursor)}
                    disabled={historyLoading}
                    activeOpacity={0.7}
                  >
                    {historyLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.loadMoreText}>
                        Charger plus d'historique
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
            {activeTab === "alerts" && (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterRow}
                  contentContainerStyle={styles.filterRowContent}
                >
                  {[
                    { key: "all",         label: "Tout" },
                    { key: "fall",        label: "🚨 Chute" },
                    { key: "glucose",     label: "🩸 Glucose" },
                    { key: "heartRate",   label: "❤️ Cardiaque" },
                    { key: "temperature", label: "🌡️ Température" },
                    { key: "oxygen",      label: "🫁 Oxygène" },
                    { key: "pressure",    label: "💓 Pression" },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[styles.filterBtn, alertFilter === f.key && styles.filterBtnActive]}
                      onPress={() => setAlertFilter(f.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.filterBtnText, alertFilter === f.key && styles.filterBtnTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {selectedData.alerts.filter((a: any) => {
                  if (alertFilter === "all") return true;
                  if (alertFilter === "pressure") return a.metric === "systolic" || a.metric === "diastolic";
                  return a.metric === alertFilter;
                }).length === 0 && (
                  <Text style={styles.emptyText}>Aucune alerte pour ce filtre.</Text>
                )}
                {selectedData.alerts.filter((a: any) => {
                  if (alertFilter === "all") return true;
                  if (alertFilter === "pressure") return a.metric === "systolic" || a.metric === "diastolic";
                  return a.metric === alertFilter;
                }).map((alert: any, i: number) => (
                  <View key={alert.id || i} style={[styles.alertCard, alert.type === "fall" && styles.alertCardFall]}>
                    <View
                      style={[
                        styles.alertBadge,
                        alert.type === "fall"    ? styles.alertBadgeFall :
                        alert.type === "critical" ? styles.alertBadgeCrit :
                        styles.alertBadgeWarn,
                      ]}
                    >
                      <Text style={styles.alertBadgeText}>
                        {alert.type === "fall" ? "🚨" : alert.type === "critical" ? "🔴" : "⚠️"}
                      </Text>
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={[styles.alertMsg, alert.type === "fall" && { color: colors.danger }]}>
                        {alert.msg}
                      </Text>
                      <Text style={styles.alertTime}>{alert.time}</Text>
                    </View>
                  </View>
                ))}
                {alertsHasMore && (
                  <TouchableOpacity
                    style={styles.loadMore}
                    onPress={() => fetchAlertsPage(selectedPatient.id, alertsCursor, getApiMetric(alertFilter))}
                    disabled={alertsLoading}
                    activeOpacity={0.7}
                  >
                    {alertsLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.loadMoreText}>
                        Charger plus d'alertes
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
            {activeTab === "notes" && (
              <>
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Profil patient</Text>
                  {[
                    ["Nom complet",  selectedData.name],
                    ["Date de naissance", selectedData.dob],
                    ["Âge",          `${selectedData.age} ans`],
                    ["Genre",        selectedData.gender],
                    ["Condition",    selectedData.condition],
                    ["Poids",        selectedData.weight],
                    ["Taille",       selectedData.height],
                    ["Téléphone",    selectedData.phone],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{label}</Text>
                      <Text style={styles.infoValue}>{value}</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.infoCard, { marginTop: 10 }]}>
                  <Text style={styles.infoCardTitle}>Dispositif (patch)</Text>
                  {[
                    ["ID patch",     selectedData.patchId],
                    ["Connecté",     selectedData.patchConnected ? "Oui ✅" : "Non ❌"],
                    ["Batterie",     selectedData.battery],
                    ["Dernière vue", selectedData.lastSeen],
                    ["Firmware",     selectedData.firmwareVer],
                  ].map(([label, value]) => (
                    <View key={label} style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{label}</Text>
                      <Text style={styles.infoValue}>{value}</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.infoCard, { marginTop: 10 }]}>
                  <Text style={styles.infoCardTitle}>Notes cliniques</Text>
                  <Text style={styles.notesText}>{selectedData.notes}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      ) : (
        <View style={styles.noPatient}>
          <Text style={styles.noPatientText}>
            Sélectionnez un patient pour voir ses données
          </Text>
        </View>
      )}

      <Modal
        visible={showPatientList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPatientList(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Patients</Text>
            <TouchableOpacity onPress={() => setShowPatientList(false)}>
              <Text style={styles.modalClose}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {allPatients.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.patientRow,
                  selectedPatient?.id === p.id && styles.patientRowSel,
                ]}
                onPress={() => selectPatient(p)}
                activeOpacity={0.7}
              >
                <View style={styles.patientRowLeft}>
                  <Dot on={p.patchConnected} size={8} />
                  <View style={styles.patientRowInfo}>
                    <Text style={styles.patientRowName}>{p.name}</Text>
                    <Text style={styles.patientRowCond}>
                      {p.condition} · {p.age} ans
                    </Text>
                  </View>
                </View>
                <Text style={styles.patientRowArrow}>→</Text>
              </TouchableOpacity>
            ))}
            {patientsHasMore && (
              <TouchableOpacity
                style={styles.loadMore}
                onPress={() => fetchPatientsPage(patientsCursor)}
                disabled={patientsLoading}
                activeOpacity={0.7}
              >
                {patientsLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>
                    Charger plus de patients
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <FallAlertModal visible={showFallModal} onDismiss={handleDismissFall} patientName={selectedData?.name} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  userName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.textBright,
  },
  logout: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.danger,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: "center",
  },
  statNum: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 28,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  patientBar: { marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  patientListBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
  },
  patientListBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.textBright,
  },
  patientListArrow: { fontSize: 10, color: colors.textMuted },
  detailContent: { flex: 1, paddingHorizontal: 20 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: colors.card },
  tabText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  tabTextActive: { fontFamily: "Inter_600SemiBold", color: colors.primary },
  scroll: { flex: 1 },
  vcardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  historyRow: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    alignItems: "center",
    gap: 12,
  },
  historyTime: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
    width: 50,
  },
  historyVal: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textBright,
    flex: 1,
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  loadMoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.primary,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  alertBadgeWarn: { backgroundColor: "rgba(245, 158, 11, 0.15)" },
  alertBadgeInfo: { backgroundColor: "rgba(0, 119, 255, 0.15)" },
  alertBadgeText: { fontSize: 14 },
  alertContent: { flex: 1 },
  alertMsg: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textBright,
    marginBottom: 4,
  },
  alertTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: colors.textMuted,
  },
  notesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  notesTitle: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 18,
    color: colors.textBright,
    marginBottom: 12,
  },
  notesText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textDim,
    lineHeight: 22,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  infoCardTitle: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 15,
    color: colors.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textBright,
    flexShrink: 1,
    textAlign: "right",
    maxWidth: "60%",
  },
  alertCardFall: {
    borderColor: colors.danger,
    borderWidth: 2,
    backgroundColor: "rgba(255, 64, 96, 0.08)",
  },
  alertBadgeFall: { backgroundColor: "rgba(255, 64, 96, 0.25)" },
  alertBadgeCrit: { backgroundColor: "rgba(255, 64, 96, 0.15)" },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 24,
  },
  filterRow: { marginBottom: 12 },
  filterRowContent: { gap: 8, paddingRight: 4 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  filterBtnTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: colors.bg,
  },
  noPatient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  noPatientText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  modalContainer: { flex: 1, backgroundColor: colors.bg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 20,
    color: colors.textBright,
  },
  modalClose: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
  modalList: { padding: 20 },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientRowSel: { borderColor: colors.primary },
  patientRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  patientRowInfo: {},
  patientRowName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: colors.textBright,
    marginBottom: 2,
  },
  patientRowCond: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  patientRowArrow: { fontSize: 16, color: colors.textMuted },
});
