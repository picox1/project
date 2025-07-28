export interface Consultation {
  id: string;
  patient_id: string;
  professionnel_id: string;
  date_consultation: string;
  lien_rendezvous?: string;
  symptomes: string;
  diagnostic: string;
  traitement: string;
  notes?: string;
}

export interface ConsultationFormData {
  patient_id: string;
  professionnel_id: string;
  lien_rendezvous?: string;
  symptomes: string;
  diagnostic: string;
  traitement: string;
  notes?: string;
}

export interface ConsultationWithDetails extends Consultation {
  patient_nom: string;
  patient_prenom: string;
  professionnel_nom: string;
  professionnel_prenom: string;
  professionnel_role: string;
  rendezvous_motif?: string;
}

export type ConsultationFilter = 'all' | 'today' | 'week' | 'month';