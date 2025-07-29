// src/types/prescription.ts

/**
 * Une seule ligne de prescription,
 * correspondant à un médicament et ses modalités.
 */
export interface PrescriptionLine {
  nom: string;
  voie: string;
  quantite: number;
  unite: string;
  frequence: string;
  duree: string;
  instruction: string;
}

/**
 * Données envoyées depuis le formulaire d’ordonnance
 * vers le service/API pour création ou mise à jour.
 */
export interface PrescriptionFormData {
  patient_id: string;
  professional_id: string;
  consultation_id: string;
  lines: PrescriptionLine[];
  instructions: string;
}

/**
 * Représentation complète d’une ordonnance
 * telle que stockée ou renvoyée par l’API.
 */
export interface Prescription extends PrescriptionFormData {
  id: string;
  date_creation: string;      // ISO string
  date_prescription: string;  // ISO string
  // Optionnel : qui a créé, etc.
  created_by?: string;
}
