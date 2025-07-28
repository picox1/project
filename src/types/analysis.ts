export interface AnalysisResult {
  id: string;
  parametre: string;
  valeur: string;
  unite?: string;
  valeur_normale?: string;
  statut: 'normal' | 'anormal' | 'critique';
}

export interface Analysis {
  id: string;
  patient_id: string;
  consultation_id?: string;
  professionnel_id: string;
  date_analyse: string;
  type_analyse: string;
  resultats: AnalysisResult[];
  conclusion: string;
  fichier_pdf?: string;
}

export interface AnalysisFormData {
  patient_id: string;
  consultation_id?: string;
  professionnel_id: string;
  type_analyse: string;
  resultats: AnalysisResult[];
  conclusion: string;
}

export interface AnalysisWithDetails extends Analysis {
  patient_nom: string;
  patient_prenom: string;
  professionnel_nom: string;
  professionnel_prenom: string;
  professionnel_role: string;
  consultation_diagnostic?: string;
}