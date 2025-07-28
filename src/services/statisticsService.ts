import { formatCurrency } from '../utils/currency';
import { formatCurrency } from '../utils/currency';
import { CabinetStatistics, ConsultationsByDoctor, WeeklyAttendance, RevenueEvolution } from '../types/statistics';
import { PatientService } from './patientService';
import { AppointmentService } from './appointmentService';
import { ConsultationService } from './consultationService';
import { PrescriptionService } from './prescriptionService';
import { CertificateService } from './certificateService';
import { AnalysisService } from './analysisService';
import { AuthService } from './auth';

export class StatisticsService {
  private static instance: StatisticsService;
  private patientService: PatientService;
  private appointmentService: AppointmentService;
  private consultationService: ConsultationService;
  private prescriptionService: PrescriptionService;
  private certificateService: CertificateService;
  private analysisService: AnalysisService;
  private authService: AuthService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.appointmentService = AppointmentService.getInstance();
    this.consultationService = ConsultationService.getInstance();
    this.prescriptionService = PrescriptionService.getInstance();
    this.certificateService = CertificateService.getInstance();
    this.analysisService = AnalysisService.getInstance();
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  private getDateRange(period: string, customStart?: string, customEnd?: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let endDate = new Date(now);
    let startDate = new Date(now);

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate = new Date(customEnd);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { startDate, endDate };
  }

  private isDateInRange(dateString: string, startDate: Date, endDate: Date): boolean {
    const date = new Date(dateString);
    return date >= startDate && date <= endDate;
  }

  public getCabinetStatistics(period: string, customStart?: string, customEnd?: string): CabinetStatistics {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);

    // Récupérer toutes les données
    const consultations = this.consultationService.getConsultationsWithDetails();
    const appointments = this.appointmentService.getAppointmentsWithDetails();
    const certificates = this.certificateService.getCertificatesWithDetails();
    const analyses = this.analysisService.getAnalysesWithDetails();

    // Filtrer par période
    const consultationsInPeriod = consultations.filter(c => 
      this.isDateInRange(c.date_consultation, startDate, endDate)
    );
    
    const appointmentsInPeriod = appointments.filter(a => 
      this.isDateInRange(a.date_du_rendez_vous, startDate, endDate)
    );

    const certificatesInPeriod = certificates.filter(c => 
      this.isDateInRange(c.date_emission, startDate, endDate)
    );

    const analysesInPeriod = analyses.filter(a => 
      this.isDateInRange(a.date_analyse, startDate, endDate)
    );

    // Calculer les statistiques
    const patientsVus = new Set(consultationsInPeriod.map(c => c.patient_id)).size;
    const consultationsEffectuees = consultationsInPeriod.length;
    const rendezVousPlanifies = appointmentsInPeriod.length;
    const rendezVousHonores = appointmentsInPeriod.filter(a => a.statut === 'Terminé').length;
    const rendezVousAnnules = appointmentsInPeriod.filter(a => a.statut === 'Annulé').length;
    const tauxPresence = rendezVousPlanifies > 0 ? Math.round((rendezVousHonores / rendezVousPlanifies) * 100) : 0;
    const certificatsEmis = certificatesInPeriod.length;
    const bulletinsAnalyse = analysesInPeriod.length;

    // Simulation des données financières
    const totalEncaisse = consultationsEffectuees * 50000 + Math.floor(Math.random() * 100000);
    const facturesImpayees = Math.floor(Math.random() * 10) + 1;
    const montantDu = facturesImpayees * 75000 + Math.floor(Math.random() * 50000);

    return {
      patientsVus,
      consultationsEffectuees,
      rendezVousPlanifies,
      rendezVousHonores,
      rendezVousAnnules,
      tauxPresence,
      certificatsEmis,
      bulletinsAnalyse,
      totalEncaisse,
      facturesImpayees,
      montantDu
    };
  }

  public getConsultationsByDoctor(period: string, customStart?: string, customEnd?: string): ConsultationsByDoctor[] {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);
    const consultations = this.consultationService.getConsultationsWithDetails();
    const users = this.authService.getAllUsers();

    const consultationsInPeriod = consultations.filter(c => 
      this.isDateInRange(c.date_consultation, startDate, endDate)
    );

    const doctorStats: { [key: string]: number } = {};
    
    consultationsInPeriod.forEach(consultation => {
      const doctorKey = `${consultation.professionnel_prenom} ${consultation.professionnel_nom}`;
      doctorStats[doctorKey] = (doctorStats[doctorKey] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
    
    return Object.entries(doctorStats).map(([doctorName, consultations], index) => ({
      doctorName,
      consultations,
      color: colors[index % colors.length]
    }));
  }

  public getWeeklyAttendance(period: string, customStart?: string, customEnd?: string): WeeklyAttendance[] {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);
    const consultations = this.consultationService.getConsultationsWithDetails();

    const consultationsInPeriod = consultations.filter(c => 
      this.isDateInRange(c.date_consultation, startDate, endDate)
    );

    const dayStats: { [key: string]: number } = {
      'Lundi': 0,
      'Mardi': 0,
      'Mercredi': 0,
      'Jeudi': 0,
      'Vendredi': 0,
      'Samedi': 0,
      'Dimanche': 0
    };

    consultationsInPeriod.forEach(consultation => {
      const date = new Date(consultation.date_consultation);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      if (dayStats[capitalizedDay] !== undefined) {
        dayStats[capitalizedDay]++;
      }
    });

    return Object.entries(dayStats).map(([day, consultations]) => ({
      day,
      consultations
    }));
  }

  public getRevenueEvolution(period: string, customStart?: string, customEnd?: string): RevenueEvolution[] {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);
    const consultations = this.consultationService.getConsultationsWithDetails();

    const consultationsInPeriod = consultations.filter(c => 
      this.isDateInRange(c.date_consultation, startDate, endDate)
    );

    const revenueByDate: { [key: string]: number } = {};

    consultationsInPeriod.forEach(consultation => {
      const date = consultation.date_consultation;
      const revenue = 50000 + Math.floor(Math.random() * 100000); // Simulation en F CFA
      revenueByDate[date] = (revenueByDate[date] || 0) + revenue;
    });

    return Object.entries(revenueByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public getConsultationEvolution(period: string, customStart?: string, customEnd?: string): { date: string; consultations: number }[] {
    const { startDate, endDate } = this.getDateRange(period, customStart, customEnd);
    const consultations = this.consultationService.getConsultationsWithDetails();

    const consultationsInPeriod = consultations.filter(c => 
      this.isDateInRange(c.date_consultation, startDate, endDate)
    );

    const consultationsByDate: { [key: string]: number } = {};

    consultationsInPeriod.forEach(consultation => {
      const date = consultation.date_consultation;
      consultationsByDate[date] = (consultationsByDate[date] || 0) + 1;
    });

    return Object.entries(consultationsByDate)
      .map(([date, consultations]) => ({ date, consultations }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public exportToCSV(statistics: CabinetStatistics, period: string): string {
    const csvContent = [
      'Statistique,Valeur',
      `Période,${period}`,
      `Patients vus,${statistics.patientsVus}`,
      `Consultations effectuées,${statistics.consultationsEffectuees}`,
      `Rendez-vous planifiés,${statistics.rendezVousPlanifies}`,
      `Rendez-vous honorés,${statistics.rendezVousHonores}`,
      `Rendez-vous annulés,${statistics.rendezVousAnnules}`,
      `Taux de présence,${statistics.tauxPresence}%`,
      `Certificats émis,${statistics.certificatsEmis}`,
      `Bulletins d'analyse,${statistics.bulletinsAnalyse}`,
      `Total encaissé,"${formatCurrency(statistics.totalEncaisse)}"`,
      `Factures impayées,${statistics.facturesImpayees}`,
      `Montant dû,"${formatCurrency(statistics.montantDu)}"`
    ].join('\n');

    return csvContent;
  }
}