export interface Appointment {
  id: string;
  patient_id: string;
  professionnel_id: string;
  date_du_rendez_vous: string;
  heure_du_rendez_vous: string;
  duree: number; // en minutes
  motif: string;
  statut: 'Confirmé' | 'Terminé' | 'Annulé';
  note?: string;
  date_creation: string;
}

export interface AppointmentFormData {
  patient_id: string;
  professionnel_id: string;
  date_du_rendez_vous: string;
  heure_du_rendez_vous: string;
  duree: number;
  motif: string;
  statut: 'Confirmé' | 'Terminé' | 'Annulé';
  note?: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient_nom: string;
  patient_prenom: string;
  professionnel_nom: string;
  professionnel_prenom: string;
  professionnel_role: string;
}

export type AppointmentFilter = 'all' | 'today' | 'week' | 'month';
export type AppointmentView = 'list' | 'calendar';