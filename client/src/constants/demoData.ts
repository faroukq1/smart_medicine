export interface VitalSigns {
  glucose: number;
  heartRate: number;
  temp: number;
  oxygen: number;
  pressure: string;
}

export interface HistoryEntry {
  time: string;
  glucose: number;
  heartRate: number;
  temp: number;
}

export interface Alert {
  type: 'warning' | 'info';
  msg: string;
  time: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  patchConnected: boolean;
  patchId: string;
  phone: string;
  dob: string;
  vitals: VitalSigns;
  history: HistoryEntry[];
  alerts: Alert[];
  notes: string;
}

export interface UserData {
  uid: string;
  role: 'patient' | 'doctor';
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  createdAt: string;
  dob?: string;
  gender?: string;
  weight?: string;
  height?: string;
  condition?: string;
  specialty?: string;
  license?: string;
  hospital?: string;
  city?: string;
}

export const DEMO_PATIENT: Patient = {
  id: 'P001',
  name: 'Ahmed Benali',
  age: 45,
  condition: 'Diabète Type 2',
  patchConnected: true,
  patchId: 'MP-2024-001',
  phone: '+213 555 123 456',
  dob: '12/03/1979',
  vitals: {
    glucose: 112,
    heartRate: 72,
    temp: 36.8,
    oxygen: 98,
    pressure: '120/80',
  },
  history: [
    { time: '08:00', glucose: 108, heartRate: 70, temp: 36.7 },
    { time: '10:00', glucose: 115, heartRate: 74, temp: 36.8 },
    { time: '12:00', glucose: 142, heartRate: 78, temp: 36.9 },
    { time: '14:00', glucose: 128, heartRate: 75, temp: 36.8 },
    { time: '16:00', glucose: 112, heartRate: 72, temp: 36.8 },
  ],
  alerts: [
    { type: 'warning', msg: 'Glycémie élevée à 14h00', time: '14:05' },
  ],
  notes: 'Patient stable. Suivi hebdomadaire requis.',
};

export const DEMO_PATIENTS: Patient[] = [
  DEMO_PATIENT,
  {
    id: 'P002',
    name: 'Fatima Zohra',
    age: 62,
    condition: 'Hypertension',
    patchConnected: true,
    patchId: 'MP-2024-002',
    phone: '+213 555 987 654',
    dob: '05/08/1962',
    vitals: {
      glucose: 95,
      heartRate: 88,
      temp: 37.1,
      oxygen: 96,
      pressure: '145/92',
    },
    history: [
      { time: '08:00', glucose: 92, heartRate: 85, temp: 37.0 },
      { time: '10:00', glucose: 98, heartRate: 90, temp: 37.1 },
      { time: '12:00', glucose: 95, heartRate: 88, temp: 37.2 },
      { time: '14:00', glucose: 91, heartRate: 86, temp: 37.1 },
      { time: '16:00', glucose: 95, heartRate: 88, temp: 37.1 },
    ],
    alerts: [
      { type: 'warning', msg: 'Tension artérielle élevée', time: '10:30' },
      { type: 'info', msg: 'Rappel: prise de médicament', time: '08:00' },
    ],
    notes: 'Surveillance tension artérielle hebdomadaire.',
  },
  {
    id: 'P003',
    name: 'Karim Djebari',
    age: 38,
    condition: 'Insuffisance cardiaque',
    patchConnected: false,
    patchId: 'MP-2024-003',
    phone: '+213 555 456 789',
    dob: '22/11/1986',
    vitals: {
      glucose: 105,
      heartRate: 95,
      temp: 37.5,
      oxygen: 93,
      pressure: '130/85',
    },
    history: [
      { time: '08:00', glucose: 102, heartRate: 98, temp: 37.4 },
      { time: '10:00', glucose: 108, heartRate: 92, temp: 37.5 },
      { time: '12:00', glucose: 105, heartRate: 95, temp: 37.6 },
      { time: '14:00', glucose: 101, heartRate: 97, temp: 37.5 },
      { time: '16:00', glucose: 105, heartRate: 95, temp: 37.5 },
    ],
    alerts: [
      { type: 'info', msg: 'Consultation de contrôle prévue', time: '09:00' },
    ],
    notes: 'Patient à surveiller de près. Signes de fatigue rapportés.',
  },
];
