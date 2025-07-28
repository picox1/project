export interface StatisticsPeriod {
  label: string;
  value: 'today' | 'week' | 'month' | 'year' | 'custom';
}

export interface CabinetStatistics {
  patientsVus: number;
  consultationsEffectuees: number;
  rendezVousPlanifies: number;
  rendezVousHonores: number;
  rendezVousAnnules: number;
  tauxPresence: number;
  certificatsEmis: number;
  bulletinsAnalyse: number;
  totalEncaisse: number;
  facturesImpayees: number;
  montantDu: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface ConsultationsByDoctor {
  doctorName: string;
  consultations: number;
  color: string;
}

export interface WeeklyAttendance {
  day: string;
  consultations: number;
}

export interface RevenueEvolution {
  date: string;
  amount: number;
}