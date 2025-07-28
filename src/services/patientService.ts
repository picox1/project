import { Patient, PatientFormData } from '../types/patient';

const PATIENTS_STORAGE_KEY = 'cabinet_medical_patients';

export class PatientService {
  private static instance: PatientService;
  private patients: Patient[] = [];

  private constructor() {
    this.loadPatients();
  }

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  private loadPatients(): void {
    const storedPatients = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (storedPatients) {
      this.patients = JSON.parse(storedPatients);
    } else {
      this.patients = this.getDefaultPatients();
      this.savePatients();
    }
  }

  private savePatients(): void {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(this.patients));
  }

  private getDefaultPatients(): Patient[] {
    return [
      {
        id: '1',
        nom: 'Dupont',
        prenom: 'Marie',
        sexe: 'Femme',
        date_de_naissance: '1985-03-15',
        telephone: '01 23 45 67 89',
        adresse: '123 Rue de la Santé, 75001 Paris',
        numero_dossier: 'DOS001',
        date_d_enregistrement: '2024-01-15',
        groupe_sanguin: 'A+',
        antecedents_medicaux: 'Hypertension artérielle, allergie aux pénicillines'
      },
      {
        id: '2',
        nom: 'Martin',
        prenom: 'Pierre',
        sexe: 'Homme',
        date_de_naissance: '1978-11-22',
        telephone: '01 98 76 54 32',
        adresse: '456 Avenue des Médecins, 69000 Lyon',
        numero_dossier: 'DOS002',
        date_d_enregistrement: '2024-01-20',
        groupe_sanguin: 'O-',
        antecedents_medicaux: 'Diabète type 2, antécédents familiaux de maladies cardiovasculaires'
      },
      {
        id: '3',
        nom: 'Leroy',
        prenom: 'Sophie',
        sexe: 'Femme',
        date_de_naissance: '1992-07-08',
        telephone: '01 11 22 33 44',
        adresse: '789 Boulevard de la Paix, 33000 Bordeaux',
        numero_dossier: 'DOS003',
        date_d_enregistrement: '2024-02-01',
        groupe_sanguin: 'B+',
        antecedents_medicaux: 'Asthme léger, aucune allergie connue'
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateDossierNumber(): string {
    const existingNumbers = this.patients.map(p => p.numero_dossier);
    let counter = 1;
    let newNumber: string;
    
    do {
      newNumber = `DOS${counter.toString().padStart(3, '0')}`;
      counter++;
    } while (existingNumbers.includes(newNumber));
    
    return newNumber;
  }

  public getAllPatients(): Patient[] {
    return [...this.patients];
  }

  public getPatientById(id: string): Patient | null {
    return this.patients.find(p => p.id === id) || null;
  }

  public addPatient(patientData: PatientFormData): Patient {
    const newPatient: Patient = {
      id: this.generateUniqueId(),
      ...patientData,
      numero_dossier: this.generateDossierNumber(),
      date_d_enregistrement: new Date().toISOString().split('T')[0]
    };

    this.patients.push(newPatient);
    this.savePatients();
    return newPatient;
  }

  public updatePatient(id: string, patientData: PatientFormData): Patient | null {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedPatient: Patient = {
      ...this.patients[index],
      ...patientData
    };

    this.patients[index] = updatedPatient;
    this.savePatients();
    return updatedPatient;
  }

  public deletePatient(id: string): boolean {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.patients.splice(index, 1);
    this.savePatients();
    return true;
  }

  public searchPatients(query: string): Patient[] {
    if (!query.trim()) return this.getAllPatients();

    const searchTerm = query.toLowerCase().trim();
    return this.patients.filter(patient => 
      patient.nom.toLowerCase().includes(searchTerm) ||
      patient.prenom.toLowerCase().includes(searchTerm) ||
      patient.numero_dossier.toLowerCase().includes(searchTerm)
    );
  }
}