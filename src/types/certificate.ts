export interface Certificate {
  id: string;
  patient_id: string;
  consultation_id?: string;
  professionnel_id: string;
  date_emission: string;
  type_certificat: 'repos' | 'aptitude' | 'grossesse' | 'sport' | 'maladie' | 'accident' | 'autre';
  duree_repos?: number;
  commentaire: string;
  fichier_pdf?: string;
}

export interface CertificateFormData {
  patient_id: string;
  consultation_id?: string;
  professionnel_id: string;
  type_certificat: 'repos' | 'aptitude' | 'grossesse' | 'sport' | 'maladie' | 'accident' | 'autre';
  duree_repos?: number;
  commentaire: string;
}

export interface CertificateWithDetails extends Certificate {
  patient_nom: string;
  patient_prenom: string;
  professionnel_nom: string;
  professionnel_prenom: string;
  professionnel_role: string;
  consultation_diagnostic?: string;
}