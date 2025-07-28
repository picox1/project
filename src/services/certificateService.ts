import { Certificate, CertificateFormData, CertificateWithDetails } from '../types/certificate';
import { PatientService } from './patientService';
import { AuthService } from './auth';
import { ConsultationService } from './consultationService';
import { ClinicService } from './clinicService';
import { ClinicService } from './clinicService';

const CERTIFICATES_STORAGE_KEY = 'cabinet_medical_certificates';

export class CertificateService {
  private static instance: CertificateService;
  private certificates: Certificate[] = [];
  private patientService: PatientService;
  private authService: AuthService;
  private consultationService: ConsultationService;
  private clinicService: ClinicService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.authService = AuthService.getInstance();
    this.consultationService = ConsultationService.getInstance();
    this.clinicService = ClinicService.getInstance();
    this.loadCertificates();
  }

  public static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }

  private loadCertificates(): void {
    const storedCertificates = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
    if (storedCertificates) {
      this.certificates = JSON.parse(storedCertificates);
    } else {
      this.certificates = this.getDefaultCertificates();
      this.saveCertificates();
    }
  }

  private saveCertificates(): void {
    localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(this.certificates));
  }

  private getDefaultCertificates(): Certificate[] {
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
        type_certificat: 'repos',
        duree_repos: 7,
        commentaire: 'Arrêt de travail suite à syndrome grippal. Repos complet recommandé.'
      },
      {
        id: '2',
        patient_id: '2',
        consultation_id: '2',
        professionnel_id: '1',
        date_emission: yesterday.toISOString().split('T')[0],
        type_certificat: 'aptitude',
        commentaire: 'Apte à la pratique sportive. Aucune contre-indication médicale.'
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getAllCertificates(): Certificate[] {
    return [...this.certificates];
  }

  public getCertificatesWithDetails(): CertificateWithDetails[] {
    const patients = this.patientService.getAllPatients();
    const users = this.authService.getAllUsers();
    const consultations = this.consultationService.getAllConsultations();

    return this.certificates.map(certificate => {
      const patient = patients.find(p => p.id === certificate.patient_id);
      const professionnel = users.find(u => u.id === certificate.professionnel_id);
      const consultation = certificate.consultation_id 
        ? consultations.find(c => c.id === certificate.consultation_id)
        : undefined;

      return {
        ...certificate,
        patient_nom: patient?.nom || 'Patient inconnu',
        patient_prenom: patient?.prenom || '',
        professionnel_nom: professionnel?.nom || 'Professionnel inconnu',
        professionnel_prenom: professionnel?.prenom || '',
        professionnel_role: professionnel?.role || '',
        consultation_diagnostic: consultation?.diagnostic
      };
    });
  }

  public getCertificateById(id: string): Certificate | null {
    return this.certificates.find(c => c.id === id) || null;
  }

  public addCertificate(certificateData: CertificateFormData): Certificate {
    const newCertificate: Certificate = {
      id: this.generateUniqueId(),
      ...certificateData,
      date_emission: new Date().toISOString().split('T')[0]
    };

    this.certificates.push(newCertificate);
    this.saveCertificates();
    return newCertificate;
  }

  public updateCertificate(id: string, certificateData: Partial<CertificateFormData>): Certificate | null {
    const index = this.certificates.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedCertificate: Certificate = {
      ...this.certificates[index],
      ...certificateData
    };

    this.certificates[index] = updatedCertificate;
    this.saveCertificates();
    return updatedCertificate;
  }

  public deleteCertificate(id: string): boolean {
    const index = this.certificates.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.certificates.splice(index, 1);
    this.saveCertificates();
    return true;
  }

  public getCertificatesByPatient(patientId: string): CertificateWithDetails[] {
    return this.getCertificatesWithDetails().filter(
      certificate => certificate.patient_id === patientId
    ).sort((a, b) => new Date(b.date_emission).getTime() - new Date(a.date_emission).getTime());
  }

  public generatePDF(certificateId: string): string {
    const certificate = this.getCertificatesWithDetails().find(c => c.id === certificateId);
    if (!certificate) return '';

    const clinicInfo = this.clinicService.getClinicInfo();

    const pdfContent = `
CERTIFICAT MÉDICAL

${clinicInfo.nom || '[Nom non défini]'}
${clinicInfo.adresse || '[Adresse non définie]'}
Tél: ${clinicInfo.telephone || '[Téléphone non défini]'} | Email: ${clinicInfo.email || '[Email non défini]'}
RC: ${clinicInfo.rccm || '[RCCM non défini]'} | NINEA: ${clinicInfo.ninea || '[NINEA non défini]'}
Dr. ${certificate.professionnel_prenom} ${certificate.professionnel_nom}
${certificate.professionnel_role}

Date: ${new Date(certificate.date_emission).toLocaleDateString('fr-FR')}

Je soussigné(e), Dr. ${certificate.professionnel_prenom} ${certificate.professionnel_nom}, 
${certificate.professionnel_role}, certifie avoir examiné ce jour :

PATIENT: ${certificate.patient_prenom} ${certificate.patient_nom}

TYPE DE CERTIFICAT: ${certificate.type_certificat.toUpperCase()}

${certificate.duree_repos ? `DURÉE DE REPOS: ${certificate.duree_repos} jours` : ''}

COMMENTAIRE MÉDICAL:
${certificate.commentaire}

${certificate.consultation_diagnostic ? `Diagnostic associé: ${certificate.consultation_diagnostic}` : ''}

Fait pour servir et valoir ce que de droit.

Signature: Dr. ${certificate.professionnel_prenom} ${certificate.professionnel_nom}
Responsable médical: ${clinicInfo.responsable_medical_prenom} ${clinicInfo.responsable_medical_nom}
Date: ${new Date(certificate.date_emission).toLocaleDateString('fr-FR')}

Imprimé via Logiciel Dib Digital
    `;

    return `data:text/plain;charset=utf-8,${encodeURIComponent(pdfContent)}`;
  }

  public createCertificateFromConsultation(
    consultationId: string, 
    certificateData: Omit<CertificateFormData, 'patient_id' | 'professionnel_id' | 'consultation_id'>
  ): Certificate | null {
    const consultation = this.consultationService.getConsultationById(consultationId);
    if (!consultation) return null;

    const fullCertificateData: CertificateFormData = {
      ...certificateData,
      patient_id: consultation.patient_id,
      professionnel_id: consultation.professionnel_id,
      consultation_id: consultationId
    };

    return this.addCertificate(fullCertificateData);
  }
}