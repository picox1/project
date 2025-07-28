import { Analysis, AnalysisFormData, AnalysisWithDetails, AnalysisResult } from '../types/analysis';
import { PatientService } from './patientService';
import { AuthService } from './auth';
import { ConsultationService } from './consultationService';
import { ClinicService } from './clinicService';

const ANALYSES_STORAGE_KEY = 'cabinet_medical_analyses';

export class AnalysisService {
  private static instance: AnalysisService;
  private analyses: Analysis[] = [];
  private patientService: PatientService;
  private authService: AuthService;
  private consultationService: ConsultationService;
  private clinicService: ClinicService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.authService = AuthService.getInstance();
    this.consultationService = ConsultationService.getInstance();
    this.clinicService = ClinicService.getInstance();
    this.loadAnalyses();
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  private loadAnalyses(): void {
    const storedAnalyses = localStorage.getItem(ANALYSES_STORAGE_KEY);
    if (storedAnalyses) {
      this.analyses = JSON.parse(storedAnalyses);
    } else {
      this.analyses = this.getDefaultAnalyses();
      this.saveAnalyses();
    }
  }

  private saveAnalyses(): void {
    localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(this.analyses));
  }

  private getDefaultAnalyses(): Analysis[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return [
      {
        id: '1',
        patient_id: '1',
        consultation_id: '1',
        professionnel_id: '1',
        date_analyse: today.toISOString().split('T')[0],
        type_analyse: 'Bilan sanguin complet',
        resultats: [
          {
            id: '1',
            parametre: 'Hémoglobine',
            valeur: '14.2',
            unite: 'g/dL',
            valeur_normale: '12-16',
            statut: 'normal'
          },
          {
            id: '2',
            parametre: 'Glycémie',
            valeur: '1.15',
            unite: 'g/L',
            valeur_normale: '0.7-1.1',
            statut: 'anormal'
          },
          {
            id: '3',
            parametre: 'Cholestérol total',
            valeur: '2.1',
            unite: 'g/L',
            valeur_normale: '<2.0',
            statut: 'anormal'
          }
        ],
        conclusion: 'Glycémie et cholestérol légèrement élevés. Recommandations diététiques et contrôle dans 3 mois.'
      },
      {
        id: '2',
        patient_id: '2',
        consultation_id: '2',
        professionnel_id: '1',
        date_analyse: yesterday.toISOString().split('T')[0],
        type_analyse: 'Analyse d\'urine',
        resultats: [
          {
            id: '4',
            parametre: 'Protéines',
            valeur: 'Négatives',
            valeur_normale: 'Négatives',
            statut: 'normal'
          },
          {
            id: '5',
            parametre: 'Glucose',
            valeur: 'Négatif',
            valeur_normale: 'Négatif',
            statut: 'normal'
          }
        ],
        conclusion: 'Analyse d\'urine normale. Aucune anomalie détectée.'
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public getAllAnalyses(): Analysis[] {
    return [...this.analyses];
  }

  public getAnalysesWithDetails(): AnalysisWithDetails[] {
    const patients = this.patientService.getAllPatients();
    const users = this.authService.getAllUsers();
    const consultations = this.consultationService.getAllConsultations();

    return this.analyses.map(analysis => {
      const patient = patients.find(p => p.id === analysis.patient_id);
      const professionnel = users.find(u => u.id === analysis.professionnel_id);
      const consultation = analysis.consultation_id 
        ? consultations.find(c => c.id === analysis.consultation_id)
        : undefined;

      return {
        ...analysis,
        patient_nom: patient?.nom || 'Patient inconnu',
        patient_prenom: patient?.prenom || '',
        professionnel_nom: professionnel?.nom || 'Professionnel inconnu',
        professionnel_prenom: professionnel?.prenom || '',
        professionnel_role: professionnel?.role || '',
        consultation_diagnostic: consultation?.diagnostic
      };
    });
  }

  public getAnalysisById(id: string): Analysis | null {
    return this.analyses.find(a => a.id === id) || null;
  }

  public addAnalysis(analysisData: AnalysisFormData): Analysis {
    const newAnalysis: Analysis = {
      id: this.generateUniqueId(),
      ...analysisData,
      date_analyse: new Date().toISOString().split('T')[0]
    };

    this.analyses.push(newAnalysis);
    this.saveAnalyses();
    return newAnalysis;
  }

  public updateAnalysis(id: string, analysisData: Partial<AnalysisFormData>): Analysis | null {
    const index = this.analyses.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updatedAnalysis: Analysis = {
      ...this.analyses[index],
      ...analysisData
    };

    this.analyses[index] = updatedAnalysis;
    this.saveAnalyses();
    return updatedAnalysis;
  }

  public deleteAnalysis(id: string): boolean {
    const index = this.analyses.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.analyses.splice(index, 1);
    this.saveAnalyses();
    return true;
  }

  public getAnalysesByPatient(patientId: string): AnalysisWithDetails[] {
    return this.getAnalysesWithDetails().filter(
      analysis => analysis.patient_id === patientId
    ).sort((a, b) => new Date(b.date_analyse).getTime() - new Date(a.date_analyse).getTime());
  }

  public generatePDF(analysisId: string): string {
    const analysis = this.getAnalysesWithDetails().find(a => a.id === analysisId);
    if (!analysis) return '';

    const clinicInfo = this.clinicService.getClinicInfo();

    const pdfContent = `
BULLETIN D'ANALYSES MÉDICALES

${clinicInfo.nom || '[Nom non défini]'}
${clinicInfo.adresse || '[Adresse non définie]'}
Tél: ${clinicInfo.telephone || '[Téléphone non défini]'} | Email: ${clinicInfo.email || '[Email non défini]'}
RC: ${clinicInfo.rccm || '[RCCM non défini]'} | NINEA: ${clinicInfo.ninea || '[NINEA non défini]'}
Dr. ${analysis.professionnel_prenom} ${analysis.professionnel_nom}
${analysis.professionnel_role}

Date d'analyse: ${new Date(analysis.date_analyse).toLocaleDateString('fr-FR')}

PATIENT: ${analysis.patient_prenom} ${analysis.patient_nom}

PROFESSIONNEL: Dr. ${analysis.professionnel_prenom} ${analysis.professionnel_nom} (${analysis.professionnel_role})

TYPE D'ANALYSE: ${analysis.type_analyse}

RÉSULTATS:
${analysis.resultats.map(result => 
  `${result.parametre}: ${result.valeur} ${result.unite || ''} (Normal: ${result.valeur_normale || 'N/A'}) - ${result.statut.toUpperCase()}`
).join('\n')}

CONCLUSION MÉDICALE:
${analysis.conclusion}

${analysis.consultation_diagnostic ? `Diagnostic associé: ${analysis.consultation_diagnostic}` : ''}

Signature: Dr. ${analysis.professionnel_prenom} ${analysis.professionnel_nom}
Responsable médical: ${clinicInfo.responsable_medical_prenom || 'Dr.'} ${clinicInfo.responsable_medical_nom || '[Responsable non défini]'}
Date: ${new Date(analysis.date_analyse).toLocaleDateString('fr-FR')}

Imprimé via Logiciel Dib Digital
    `;

    return `data:text/plain;charset=utf-8,${encodeURIComponent(pdfContent)}`;
  }

  public createAnalysisFromConsultation(
    consultationId: string, 
    analysisData: Omit<AnalysisFormData, 'patient_id' | 'professionnel_id' | 'consultation_id'>
  ): Analysis | null {
    const consultation = this.consultationService.getConsultationById(consultationId);
    if (!consultation) return null;

    const fullAnalysisData: AnalysisFormData = {
      ...analysisData,
      patient_id: consultation.patient_id,
      professionnel_id: consultation.professionnel_id,
      consultation_id: consultationId
    };

    return this.addAnalysis(fullAnalysisData);
  }
}