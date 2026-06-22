import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
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
import { API_BASE } from "../api/config";
import { DEMO_PATIENT } from "../constants/demoData";
import { useTheme } from "../contexts/ThemeContext";
import HLogo from "../components/HLogo";
import VCard from "../components/VCard";
import PatchBar from "../components/PatchBar";
import FallAlertModal from "../components/FallAlertModal";
import type { RootStackParamList } from "../navigation/RootNavigator";

type Nav = StackNavigationProp<RootStackParamList, "PatientDashboard">;
type Route = RouteProp<RootStackParamList, "PatientDashboard">;
type Tab = "overview" | "history" | "alerts" | "profile";
const tabLabels: Record<Tab, string> = {
  overview: "Aperçu",
  history: "Historique",
  alerts: "Alertes",
  profile: "Profil",
};

const PAGE_SIZE = 15;

export default function PatientDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { user: routeUser } = route.params;
  const { user: authUser, logout } = useAuthContext();
  const { colors, mode, toggleTheme } = useTheme();
  const user = routeUser || authUser;
  const [tab, setTab] = useState<Tab>("overview");
  const [vitalsData, setVitalsData] = useState<any[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [latestVital, setLatestVital] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [showFallModal, setShowFallModal] = useState(false);

  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [alertsCursor, setAlertsCursor] = useState<string | null>(null);
  const [alertsHasMore, setAlertsHasMore] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [patchConnected, setPatchConnected] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const patientId = user?.patient?.id;
  const lastFallIdRef = useRef<string | null>(null);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  // SSE — real-time vitals + instant fall modal
  useEffect(() => {
    if (!patientId) return;
    let active = true;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    const connect = async () => {
      try {
        const token = await api.loadTokens();
        const res = await fetch(`${API_BASE}/vitals/${patientId}/stream`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        reader = res.body?.getReader() ?? null;
        if (!reader) return;

        const dec = new TextDecoder();
        let buf = "";
        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const msg = JSON.parse(line.slice(6));
              if (msg.type === "device") {
                setPatchConnected(msg.device?.connected ?? false);
                continue;
              }
              if (msg.type !== "vital") continue;
              const v = msg.vital;
              setLatestVital(v);
              setVitalsData((prev) => [v, ...prev].slice(0, 50));
              if (v.fallDetected && v.id !== lastFallIdRef.current) {
                lastFallIdRef.current = v.id;
                setShowFallModal(true);
              }
              if (msg.alerts?.length) {
                setAlertsData((prev) => [...msg.alerts, ...prev]);
              }
            } catch {}
          }
        }
      } catch {
        if (active) setTimeout(connect, 3000);
      }
    };

    connect();
    return () => {
      active = false;
      reader?.cancel();
    };
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    const check = async () => {
      try {
        const dev = await api.getPatientDevice(patientId);
        setPatchConnected(dev?.connected ?? false);
      } catch {}
    };
    check();
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, [patientId]);

  const fetchOverview = useCallback(async () => {
    if (!patientId) {
      setFetching(false);
      return;
    }
    try {
      const [vitalsRes, latest] = await Promise.all([
        api.getVitals(patientId, undefined, 10),
        api.getLatestVitals(patientId),
      ]);
      if (vitalsRes?.data?.length) setVitalsData(vitalsRes.data);
      if (latest) {
        setLatestVital(latest);
        if (latest.fallDetected && latest.id !== lastFallIdRef.current) {
          lastFallIdRef.current = latest.id;
          setShowFallModal(true);
        }
      }
    } catch {
    } finally {
      setFetching(false);
    }
  }, [patientId]);

  const fetchHistoryPage = useCallback(
    async (cursor?: string | null) => {
      if (!patientId) return;
      setHistoryLoading(true);
      try {
        const res = await api.getVitals(patientId, cursor ?? undefined, PAGE_SIZE);
        const newData = res.data ?? [];
        if (cursor) {
          setVitalsData((prev) => [...prev, ...newData]);
        } else {
          setVitalsData(newData);
        }
        setHistoryCursor(res.nextCursor);
        setHistoryHasMore(res.hasMore);
      } catch {
      } finally {
        setHistoryLoading(false);
      }
    },
    [patientId],
  );

  const fetchAlertsPage = useCallback(
    async (cursor?: string | null) => {
      if (!patientId) return;
      setAlertsLoading(true);
      try {
        const res = await api.getPatientAlerts(patientId, cursor ?? undefined, PAGE_SIZE);
        const newData = res.data ?? [];
        if (cursor) {
          setAlertsData((prev) => [...prev, ...newData]);
        } else {
          setAlertsData(newData);
        }
        setAlertsCursor(res.nextCursor);
        setAlertsHasMore(res.hasMore);
      } catch {
      } finally {
        setAlertsLoading(false);
      }
    },
    [patientId],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    fetchOverview();
    const interval = setInterval(fetchOverview, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === "history" && vitalsData.length === 0) {
      fetchHistoryPage();
    }
    if (tab === "alerts" && alertsData.length === 0) {
      fetchAlertsPage();
    }
  }, [tab]);

  useEffect(() => {
    const fallAlert = alertsData.find(
      (a: any) => a.metric === "fall" && !a.resolved,
    );
    if (fallAlert) {
      setShowFallModal(true);
    }
  }, [alertsData]);

  const handleDismissFall = async () => {
    setShowFallModal(false);
    const fallAlert = alertsData.find(
      (a: any) => a.metric === "fall" && !a.resolved,
    );
    if (fallAlert) {
      try { await api.resolveAlert(fallAlert.id); } catch {}
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const useDemo = !fetching && !latestVital && !vitalsData.length;
  const displayVitals = useDemo
    ? DEMO_PATIENT.vitals
    : {
        glucose: latestVital?.glucose ?? vitalsData[0]?.glucose ?? 0,
        heartRate: latestVital?.heartRate ?? vitalsData[0]?.heartRate ?? 0,
        temp: latestVital?.temperature ?? vitalsData[0]?.temperature ?? 0,
        oxygen: latestVital?.oxygen ?? vitalsData[0]?.oxygen ?? 0,
        pressure: latestVital
          ? `${latestVital.systolic || "—"}/${latestVital.diastolic || "—"}`
          : vitalsData[0]
            ? `${vitalsData[0].systolic || "—"}/${vitalsData[0].diastolic || "—"}`
            : "—",
      };
  const displayHistory = useDemo
    ? DEMO_PATIENT.history
    : vitalsData.map((v: any) => ({
        id: v.id,
        time: new Date(v.recordedAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        glucose: v.glucose,
        heartRate: v.heartRate,
        temp: v.temperature,
      }));
  const displayAlerts = useDemo
    ? DEMO_PATIENT.alerts
    : alertsData
        .filter((a: any) => a.metric !== "fall")
        .map((a: any) => ({
          id: a.id,
          type:
            a.type === "critical"
              ? "warning"
              : a.type === "warning"
                ? "warning"
                : "info",
          msg: a.message,
          time: new Date(a.createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

  const getName = () => user?.firstName || user?.name || "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HLogo role="patient" />
        <View style={styles.headerRight}>
          <Text style={styles.userName}>{getName()}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabRow}>
        {(Object.keys(tabLabels) as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {tabLabels[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <PatchBar connected={patchConnected} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {tab === "overview" && (
            <View style={styles.vcardGrid}>
              <VCard
                label="Glucose"
                value={displayVitals.glucose}
                unit="mg/dL"
                icon="🩸"
                spark={displayHistory.map((h: any) => h.glucose)}
                warn={displayVitals.glucose > 130}
                color={
                  displayVitals.glucose > 130 ? colors.danger : colors.primary
                }
              />
              <VCard
                label="Fréquence cardiaque"
                value={displayVitals.heartRate}
                unit="bpm"
                icon="❤️"
                color={colors.secondary}
                spark={displayHistory.map((h: any) => h.heartRate)}
              />
              <VCard
                label="Température"
                value={displayVitals.temp}
                unit="°C"
                icon="🌡️"
                color={colors.warning}
                spark={displayHistory.map((h: any) => h.temp)}
              />
              <VCard
                label="Oxygène"
                value={displayVitals.oxygen}
                unit="%"
                icon="🫁"
                color={colors.primary}
              />
              <VCard
                label="Pression"
                value={displayVitals.pressure}
                unit="mmHg"
                icon="💓"
                color={colors.secondary}
              />
            </View>
          )}

          {tab === "history" && (
            <>
              {displayHistory.map((item: any, i: number) => (
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
                  onPress={() => fetchHistoryPage(historyCursor)}
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

          {tab === "alerts" && (
            <>
              {displayAlerts.map((alert: any, i: number) => (
                <View key={alert.id || i} style={styles.alertCard}>
                  <View
                    style={[
                      styles.alertBadge,
                      alert.type === "warning"
                        ? styles.alertBadgeWarn
                        : styles.alertBadgeInfo,
                    ]}
                  >
                    <Text style={styles.alertBadgeText}>
                      {alert.type === "warning" ? "⚠️" : "ℹ️"}
                    </Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertMsg}>{alert.msg}</Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                </View>
              ))}
              {alertsHasMore && (
                <TouchableOpacity
                  style={styles.loadMore}
                  onPress={() => fetchAlertsPage(alertsCursor)}
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

          {tab === "profile" && (
            <View style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <Text style={styles.profileName}>
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.name || "—"}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Date de naissance</Text>
                <Text style={styles.profileValue}>
                  {user?.patient?.dob || user?.dob || "—"}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Condition</Text>
                <Text style={styles.profileValue}>
                  {user?.patient?.condition || user?.condition || "—"}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Téléphone</Text>
                <Text style={styles.profileValue}>{user?.phone || "—"}</Text>
              </View>
              {user?.patient?.notes ? (
                <View style={styles.profileNotes}>
                  <Text style={styles.profileLabel}>Notes</Text>
                  <Text style={styles.profileNotesText}>
                    {user.patient.notes}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>
      </Animated.View>
      <FallAlertModal visible={showFallModal} onDismiss={handleDismissFall} />
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.floatingToggle,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        activeOpacity={0.7}
      >
        <Text style={styles.floatingToggleIcon}>
          {mode === "dark" ? "☀️" : "🌙"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
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
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: colors.card },
  tabText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  tabTextActive: { fontFamily: "Inter_600SemiBold", color: colors.primary },
  content: { flex: 1, paddingHorizontal: 20 },
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
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  profileName: {
    fontFamily: "Exo2_800ExtraBold",
    fontSize: 20,
    color: colors.primary,
    flex: 1,
  },
  floatingToggle: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingToggleIcon: { fontSize: 20 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textMuted,
  },
  profileValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: colors.textBright,
  },
  profileNotes: { marginTop: 16 },
  profileNotesText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: colors.textDim,
    marginTop: 6,
    lineHeight: 20,
  },
});
