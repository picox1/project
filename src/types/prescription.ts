export interface Medication {
  id: string;
  nom: string;
  dosage: string;
  frequence: string;
  duree: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  consultation_id?: string;
  professionnel_id: string;
  date_emission: string;
  liste_medicaments: Medication[];
  instructions_generales: string;
  signature: string;
  fichier_pdf?: string;
}

export interface PrescriptionFormData {
  patient_id: string;
  consultation_id?: string;
  professionnel_id: string;
  liste_medicaments: Medication[];
  instructions_generales: string;
  signature: string;
}

export interface PrescriptionWithDetails extends Prescription {
  patient_nom: string;
  patient_prenom: string;
  professionnel_nom: string;
  professionnel_prenom: string;
  professionnel_role: string;
  consultation_diagnostic?: string;
}