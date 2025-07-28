import { Prescription, PrescriptionFormData, PrescriptionWithDetails, Medication } from '../types/prescription';
import { PatientService } from './patientService';
import { AuthService } from './auth';
import { ConsultationService } from './consultationService';
import { ClinicService } from './clinicService';

const PRESCRIPTIONS_STORAGE_KEY = 'cabinet_medical_prescriptions';

export class PrescriptionService {
  private static instance: PrescriptionService;
  private prescriptions: Prescription[] = [];
  private patientService: PatientService;
  private authService: AuthService;
  private consultationService: ConsultationService;
  private clinicService: ClinicService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.authService = AuthService.getInstance();
    this.consultationService = ConsultationService.getInstance();
    this.clinicService = ClinicService.getInstance();
    this.loadPrescriptions();
  }

  public static getInstance(): PrescriptionService {
    if (!PrescriptionService.instance) {
      PrescriptionService.instance = new PrescriptionService();
    }
    return PrescriptionService.instance;
  }

  private loadPrescriptions(): void {
    const storedPrescriptions = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY);
    if (storedPrescriptions) {
      this.prescriptions = JSON.parse(storedPrescriptions);
    } else {
      this.prescriptions = this.getDefaultPrescriptions();
      this.savePrescriptions();
    }
  }

  private savePrescriptions(): void {
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(this.prescriptions));
  }

  private getDefaultPrescriptions(): Prescription[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return [
      {
        id: '1',
        patient_id: '1',
        consultation_id: '1',
        professionnel_id: '1',
        date_emission: today.toISOString().split('T')[0],
        liste_medicaments: [
          {
            id: '1',
            nom: 'Amlodipine',
            dosage: '5mg',
            frequence: '1 fois par jour',
            duree: '30 jours',
            instructions: 'À prendre le matin'
          },
          {
            id: '2',
            nom: 'Aspirine',
            dosage: '100mg',
            frequence: '1 fois par jour',
            duree: '30 jours',
            instructions: 'Après le repas'
          }
        ],
        instructions_generales: 'Régime hyposodé recommandé. Contrôle tension dans 15 jours.',
        signature: 'Dr. Jean Martin'
      },
      {
        id: '2',
        patient_id: '2',
        consultation_id: '2',
        professionnel_id: '1',
        date_emission: yesterday.toISOString().split('T')[0],
        liste_medicaments: [
          {
            id: '3',
            nom: 'Metformine',
            dosage: '1000mg',
            frequence: '2 fois par jour',
            duree: '90 jours',
            instructions: 'Matin et soir avec les repas'
          }
        ],
        instructions_generales: 'Surveillance glycémique. Consultation diététicienne programmée.',
        signature: 'Dr. Jean Martin'
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getAllPrescriptions(): Prescription[] {
    return [...this.prescriptions];
  }

  public getPrescriptionsWithDetails(): PrescriptionWithDetails[] {
    const patients = this.patientService.getAllPatients();
    const users = this.authService.getAllUsers();
    const consultations = this.consultationService.getAllConsultations();

    return this.prescriptions.map(prescription => {
      const patient = patients.find(p => p.id === prescription.patient_id);
      const professionnel = users.find(u => u.id === prescription.professionnel_id);
      const consultation = prescription.consultation_id 
        ? consultations.find(c => c.id === prescription.consultation_id)
        : undefined;

      return {
        ...prescription,
        patient_nom: patient?.nom || 'Patient inconnu',
        patient_prenom: patient?.prenom || '',
        professionnel_nom: professionnel?.nom || 'Professionnel inconnu',
        professionnel_prenom: professionnel?.prenom || '',
        professionnel_role: professionnel?.role || '',
        consultation_diagnostic: consultation?.diagnostic
      };
    });
  }

  public getPrescriptionById(id: string): Prescription | null {
    return this.prescriptions.find(p => p.id === id) || null;
  }

  public addPrescription(prescriptionData: PrescriptionFormData): Prescription {
    const newPrescription: Prescription = {
      id: this.generateUniqueId(),
      ...prescriptionData,
      date_emission: new Date().toISOString().split('T')[0]
    };

    this.prescriptions.push(newPrescription);
    this.savePrescriptions();
    return newPrescription;
  }

  public updatePrescription(id: string, prescriptionData: Partial<PrescriptionFormData>): Prescription | null {
    const index = this.prescriptions.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedPrescription: Prescription = {
      ...this.prescriptions[index],
      ...prescriptionData
    };

    this.prescriptions[index] = updatedPrescription;
    this.savePrescriptions();
    return updatedPrescription;
  }

  public deletePrescription(id: string): boolean {
    const index = this.prescriptions.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.prescriptions.splice(index, 1);
    this.savePrescriptions();
    return true;
  }

  public getPrescriptionsByPatient(patientId: string): PrescriptionWithDetails[] {
    return this.getPrescriptionsWithDetails().filter(
      prescription => prescription.patient_id === patientId
    ).sort((a, b) => new Date(b.date_emission).getTime() - new Date(a.date_emission).getTime());
  }

  public getPrescriptionsByConsultation(consultationId: string): PrescriptionWithDetails[] {
    return this.getPrescriptionsWithDetails().filter(
      prescription => prescription.consultation_id === consultationId
    );
  }

  public getPrescriptionsByProfessional(professionalId: string): PrescriptionWithDetails[] {
    return this.getPrescriptionsWithDetails().filter(
      prescription => prescription.professionnel_id === professionalId
    );
  }

  public generatePDF(prescriptionId: string): string {
    const prescription = this.getPrescriptionsWithDetails().find(p => p.id === prescriptionId);
    if (!prescription) return '';

    const clinicInfo = this.clinicService.getClinicInfo();

    // Simulation de génération PDF - dans un vrai projet, utiliser une librairie comme jsPDF
    const pdfContent = `
ORDONNANCE MÉDICALE

${clinicInfo.nom || '[Nom non défini]'}
${clinicInfo.adresse || '[Adresse non définie]'}
Tél: ${clinicInfo.telephone || '[Téléphone non défini]'} | Email: ${clinicInfo.email || '[Email non défini]'}
RC: ${clinicInfo.rccm || '[RCCM non défini]'} | NINEA: ${clinicInfo.ninea || '[NINEA non défini]'}
Dr. ${prescription.professionnel_prenom} ${prescription.professionnel_nom}
${prescription.professionnel_role}

Date: ${new Date(prescription.date_emission).toLocaleDateString('fr-FR')}

PATIENT: ${prescription.patient_prenom} ${prescription.patient_nom}

PROFESSIONNEL: Dr. ${prescription.professionnel_prenom} ${prescription.professionnel_nom} (${prescription.professionnel_role})

MÉDICAMENTS PRESCRITS:
${prescription.liste_medicaments.map(med => 
  `- ${med.nom} ${med.dosage} - ${med.frequence} pendant ${med.duree}
    ${med.instructions ? '  Instructions: ' + med.instructions : ''}`
).join('\n')}

INSTRUCTIONS GÉNÉRALES:
${prescription.instructions_generales}

Signature: ${prescription.signature}
Responsable médical: ${clinicInfo.responsable_medical_prenom} ${clinicInfo.responsable_medical_nom}
Date: ${new Date(prescription.date_emission).toLocaleDateString('fr-FR')}

Imprimé via Logiciel Dib Digital
    `;

    // Dans un vrai projet, générer un vrai PDF et retourner l'URL
    return `data:text/plain;charset=utf-8,${encodeURIComponent(pdfContent)}`;
  }

  public createPrescriptionFromConsultation(
    consultationId: string, 
    prescriptionData: Omit<PrescriptionFormData, 'patient_id' | 'professionnel_id' | 'consultation_id'>
  ): Prescription | null {
    const consultation = this.consultationService.getConsultationById(consultationId);
    if (!consultation) return null;

    const fullPrescriptionData: PrescriptionFormData = {
      ...prescriptionData,
      patient_id: consultation.patient_id,
      professionnel_id: consultation.professionnel_id,
      consultation_id: consultationId
    };

    return this.addPrescription(fullPrescriptionData);
  }
}