import { Consultation, ConsultationFormData, ConsultationWithDetails } from '../types/consultation';
import { PatientService } from './patientService';
import { AuthService } from './auth';
import { AppointmentService } from './appointmentService';

const CONSULTATIONS_STORAGE_KEY = 'cabinet_medical_consultations';

export class ConsultationService {
  private static instance: ConsultationService;
  private consultations: Consultation[] = [];
  private patientService: PatientService;
  private authService: AuthService;
  private appointmentService: AppointmentService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.authService = AuthService.getInstance();
    this.appointmentService = AppointmentService.getInstance();
    this.loadConsultations();
  }

  public static getInstance(): ConsultationService {
    if (!ConsultationService.instance) {
      ConsultationService.instance = new ConsultationService();
    }
    return ConsultationService.instance;
  }

  private loadConsultations(): void {
    const storedConsultations = localStorage.getItem(CONSULTATIONS_STORAGE_KEY);
    if (storedConsultations) {
      this.consultations = JSON.parse(storedConsultations);
    } else {
      this.consultations = this.getDefaultConsultations();
      this.saveConsultations();
    }
  }

  private saveConsultations(): void {
    localStorage.setItem(CONSULTATIONS_STORAGE_KEY, JSON.stringify(this.consultations));
  }

  private getDefaultConsultations(): Consultation[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
      {
        id: '1',
        patient_id: '1',
        professionnel_id: '1',
        date_consultation: today.toISOString().split('T')[0],
        lien_rendezvous: '1',
        symptomes: 'Fatigue persistante, maux de tête fréquents, tension artérielle élevée',
        diagnostic: 'Hypertension artérielle grade 1, stress chronique',
        traitement: 'Amlodipine 5mg 1x/jour, régime hyposodé, activité physique régulière',
        notes: 'Contrôle dans 1 mois. Patient motivé pour changements hygiéno-diététiques.'
      },
      {
        id: '2',
        patient_id: '2',
        professionnel_id: '1',
        date_consultation: yesterday.toISOString().split('T')[0],
        lien_rendezvous: '2',
        symptomes: 'Glycémie élevée au réveil, soif excessive, vision floue',
        diagnostic: 'Diabète type 2 déséquilibré',
        traitement: 'Ajustement Metformine 1000mg 2x/jour, consultation diététicienne',
        notes: 'HbA1c à 8.2%. Objectif < 7%. RDV endocrinologue programmé.'
      },
      {
        id: '3',
        patient_id: '3',
        professionnel_id: '2',
        date_consultation: lastWeek.toISOString().split('T')[0],
        symptomes: 'Toux sèche nocturne, essoufflement à l\'effort',
        diagnostic: 'Exacerbation asthme allergique',
        traitement: 'Ventoline 2 bouffées si besoin, Seretide 25/125 2x/jour',
        notes: 'Éviter allergènes identifiés. Technique inhalation vérifiée.'
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getAllConsultations(): Consultation[] {
    return [...this.consultations];
  }

  public getConsultationsWithDetails(): ConsultationWithDetails[] {
    const patients = this.patientService.getAllPatients();
    const users = this.authService.getAllUsers();
    const appointments = this.appointmentService.getAllAppointments();

    return this.consultations.map(consultation => {
      const patient = patients.find(p => p.id === consultation.patient_id);
      const professionnel = users.find(u => u.id === consultation.professionnel_id);
      const rendezvous = consultation.lien_rendezvous 
        ? appointments.find(a => a.id === consultation.lien_rendezvous)
        : undefined;

      return {
        ...consultation,
        patient_nom: patient?.nom || 'Patient inconnu',
        patient_prenom: patient?.prenom || '',
        professionnel_nom: professionnel?.nom || 'Professionnel inconnu',
        professionnel_prenom: professionnel?.prenom || '',
        professionnel_role: professionnel?.role || '',
        rendezvous_motif: rendezvous?.motif
      };
    });
  }

  public getConsultationById(id: string): Consultation | null {
    return this.consultations.find(c => c.id === id) || null;
  }

  public addConsultation(consultationData: ConsultationFormData): Consultation {
    const newConsultation: Consultation = {
      id: this.generateUniqueId(),
      ...consultationData,
      date_consultation: new Date().toISOString().split('T')[0]
    };

    this.consultations.push(newConsultation);
    this.saveConsultations();
    return newConsultation;
  }

  public updateConsultation(id: string, consultationData: Partial<ConsultationFormData>): Consultation | null {
    const index = this.consultations.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedConsultation: Consultation = {
      ...this.consultations[index],
      ...consultationData
    };

    this.consultations[index] = updatedConsultation;
    this.saveConsultations();
    return updatedConsultation;
  }

  public deleteConsultation(id: string): boolean {
    const index = this.consultations.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.consultations.splice(index, 1);
    this.saveConsultations();
    return true;
  }

  public getConsultationsByPatient(patientId: string): ConsultationWithDetails[] {
    return this.getConsultationsWithDetails().filter(
      consultation => consultation.patient_id === patientId
    ).sort((a, b) => new Date(b.date_consultation).getTime() - new Date(a.date_consultation).getTime());
  }

  public getConsultationsByProfessional(professionalId: string): ConsultationWithDetails[] {
    return this.getConsultationsWithDetails().filter(
      consultation => consultation.professionnel_id === professionalId
    );
  }

  public getConsultationsByDate(date: string): ConsultationWithDetails[] {
    return this.getConsultationsWithDetails().filter(
      consultation => consultation.date_consultation === date
    );
  }

  public getConsultationsByDateRange(startDate: string, endDate: string): ConsultationWithDetails[] {
    return this.getConsultationsWithDetails().filter(consultation => {
      const consultationDate = consultation.date_consultation;
      return consultationDate >= startDate && consultationDate <= endDate;
    });
  }

  public searchConsultations(query: string): ConsultationWithDetails[] {
    if (!query.trim()) return this.getConsultationsWithDetails();

    const searchTerm = query.toLowerCase().trim();
    return this.getConsultationsWithDetails().filter(consultation =>
      consultation.patient_nom.toLowerCase().includes(searchTerm) ||
      consultation.patient_prenom.toLowerCase().includes(searchTerm) ||
      consultation.professionnel_nom.toLowerCase().includes(searchTerm) ||
      consultation.professionnel_prenom.toLowerCase().includes(searchTerm) ||
      consultation.diagnostic.toLowerCase().includes(searchTerm) ||
      consultation.symptomes.toLowerCase().includes(searchTerm)
    );
  }

  public getTodayConsultations(): ConsultationWithDetails[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getConsultationsByDate(today);
  }

  public getWeekConsultations(): ConsultationWithDetails[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.getConsultationsByDateRange(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }

  public getMonthConsultations(): ConsultationWithDetails[] {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.getConsultationsByDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
  }

  public createConsultationFromAppointment(appointmentId: string, consultationData: Omit<ConsultationFormData, 'patient_id' | 'professionnel_id' | 'lien_rendezvous'>): Consultation | null {
    const appointment = this.appointmentService.getAppointmentById(appointmentId);
    if (!appointment) return null;

    const fullConsultationData: ConsultationFormData = {
      ...consultationData,
      patient_id: appointment.patient_id,
      professionnel_id: appointment.professionnel_id,
      lien_rendezvous: appointmentId
    };

    return this.addConsultation(fullConsultationData);
  }
}