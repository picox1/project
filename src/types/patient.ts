export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  sexe: 'Homme' | 'Femme';
  date_de_naissance: string;
  telephone: string;
  adresse: string;
  numero_dossier: string;
  date_d_enregistrement: string;
  groupe_sanguin: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  antecedents_medicaux: string;
}

export interface PatientFormData {
  nom: string;
  prenom: string;
  sexe: 'Homme' | 'Femme';
  date_de_naissance: string;
  telephone: string;
  adresse: string;
  groupe_sanguin: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  antecedents_medicaux: string;
}