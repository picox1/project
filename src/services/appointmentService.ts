import { Appointment, AppointmentFormData, AppointmentWithDetails } from '../types/appointment';
import { PatientService } from './patientService';
import { AuthService } from './auth';

const APPOINTMENTS_STORAGE_KEY = 'cabinet_medical_appointments';

export class AppointmentService {
  private static instance: AppointmentService;
  private appointments: Appointment[] = [];
  private patientService: PatientService;
  private authService: AuthService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.authService = AuthService.getInstance();
    this.loadAppointments();
  }

  public static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  private loadAppointments(): void {
    const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (storedAppointments) {
      this.appointments = JSON.parse(storedAppointments);
    } else {
      this.appointments = this.getDefaultAppointments();
      this.saveAppointments();
    }
  }

  private saveAppointments(): void {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(this.appointments));
  }

  private getDefaultAppointments(): Appointment[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: '1',
        patient_id: '1',
        professionnel_id: '1',
        date_du_rendez_vous: today.toISOString().split('T')[0],
        heure_du_rendez_vous: '09:00',
        duree: 30,
        motif: 'Consultation générale',
        statut: 'Confirmé',
        note: 'Contrôle de routine',
        date_creation: today.toISOString().split('T')[0]
      },
      {
        id: '2',
        patient_id: '2',
        professionnel_id: '1',
        date_du_rendez_vous: today.toISOString().split('T')[0],
        heure_du_rendez_vous: '14:30',
        duree: 45,
        motif: 'Suivi diabète',
        statut: 'Confirmé',
        note: 'Vérification glycémie',
        date_creation: today.toISOString().split('T')[0]
      },
      {
        id: '3',
        patient_id: '3',
        professionnel_id: '2',
        date_du_rendez_vous: tomorrow.toISOString().split('T')[0],
        heure_du_rendez_vous: '10:15',
        duree: 20,
        motif: 'Prise de sang',
        statut: 'Confirmé',
        note: '',
        date_creation: today.toISOString().split('T')[0]
      },
      {
        id: '4',
        patient_id: '1',
        professionnel_id: '3',
        date_du_rendez_vous: nextWeek.toISOString().split('T')[0],
        heure_du_rendez_vous: '16:00',
        duree: 60,
        motif: 'Examen spécialisé',
        statut: 'Confirmé',
        note: 'Examen cardiologique',
        date_creation: today.toISOString().split('T')[0]
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getAllAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public getAppointmentsWithDetails(): AppointmentWithDetails[] {
    const patients = this.patientService.getAllPatients();
    const users = this.authService.getAllUsers();

    return this.appointments.map(appointment => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      const professionnel = users.find(u => u.id === appointment.professionnel_id);

      return {
        ...appointment,
        patient_nom: patient?.nom || 'Patient inconnu',
        patient_prenom: patient?.prenom || '',
        professionnel_nom: professionnel?.nom || 'Professionnel inconnu',
        professionnel_prenom: professionnel?.prenom || '',
        professionnel_role: professionnel?.role || ''
      };
    });
  }

  public getAppointmentById(id: string): Appointment | null {
    return this.appointments.find(a => a.id === id) || null;
  }

  public addAppointment(appointmentData: AppointmentFormData): Appointment {
    const newAppointment: Appointment = {
      id: this.generateUniqueId(),
      ...appointmentData,
      date_creation: new Date().toISOString().split('T')[0]
    };

    this.appointments.push(newAppointment);
    this.saveAppointments();
    return newAppointment;
  }

  public updateAppointment(id: string, appointmentData: Partial<AppointmentFormData>): Appointment | null {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updatedAppointment: Appointment = {
      ...this.appointments[index],
      ...appointmentData
    };

    this.appointments[index] = updatedAppointment;
    this.saveAppointments();
    return updatedAppointment;
  }

  public deleteAppointment(id: string): boolean {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.appointments.splice(index, 1);
    this.saveAppointments();
    return true;
  }

  public updateAppointmentStatus(id: string, statut: 'Confirmé' | 'Terminé' | 'Annulé'): boolean {
    const appointment = this.appointments.find(a => a.id === id);
    if (!appointment) return false;

    appointment.statut = statut;
    this.saveAppointments();
    return true;
  }

  public getAppointmentsByDate(date: string): AppointmentWithDetails[] {
    return this.getAppointmentsWithDetails().filter(
      appointment => appointment.date_du_rendez_vous === date
    );
  }

  public getAppointmentsByDateRange(startDate: string, endDate: string): AppointmentWithDetails[] {
    return this.getAppointmentsWithDetails().filter(appointment => {
      const appointmentDate = appointment.date_du_rendez_vous;
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  }

  public searchAppointments(query: string): AppointmentWithDetails[] {
    if (!query.trim()) return this.getAppointmentsWithDetails();

    const searchTerm = query.toLowerCase().trim();
    return this.getAppointmentsWithDetails().filter(appointment =>
      appointment.patient_nom.toLowerCase().includes(searchTerm) ||
      appointment.patient_prenom.toLowerCase().includes(searchTerm) ||
      appointment.professionnel_nom.toLowerCase().includes(searchTerm) ||
      appointment.professionnel_prenom.toLowerCase().includes(searchTerm) ||
      appointment.motif.toLowerCase().includes(searchTerm)
    );
  }

  public getUpcomingAppointments(): AppointmentWithDetails[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsWithDetails()
      .filter(appointment => appointment.date_du_rendez_vous >= today)
      .sort((a, b) => {
        const dateA = new Date(`${a.date_du_rendez_vous}T${a.heure_du_rendez_vous}`);
        const dateB = new Date(`${b.date_du_rendez_vous}T${b.heure_du_rendez_vous}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  public getTodayAppointments(): AppointmentWithDetails[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }

  public getWeekAppointments(): AppointmentWithDetails[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.getAppointmentsByDateRange(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }

  public isTimeSlotAvailable(
    professionnelId: string,
    date: string,
    heure: string,
    duree: number,
    excludeAppointmentId?: string
  ): boolean {
    const appointmentStart = new Date(`${date}T${heure}`);
    const appointmentEnd = new Date(appointmentStart.getTime() + duree * 60000);

    const conflictingAppointments = this.appointments.filter(appointment => {
      if (appointment.professionnel_id !== professionnelId) return false;
      if (appointment.date_du_rendez_vous !== date) return false;
      if (appointment.statut === 'Annulé') return false;
      if (excludeAppointmentId && appointment.id === excludeAppointmentId) return false;

      const existingStart = new Date(`${appointment.date_du_rendez_vous}T${appointment.heure_du_rendez_vous}`);
      const existingEnd = new Date(existingStart.getTime() + appointment.duree * 60000);

      return (appointmentStart < existingEnd && appointmentEnd > existingStart);
    });

    return conflictingAppointments.length === 0;
  }
}