// src/data/medicationsData.ts

export interface MedicationData {
  nom: string;
  voie?: string;
  quantite?: number;
  unite?: string;
  frequence?: string;
  duree?: string;
  instruction?: string;
}

const MEDICATIONS_DATA: MedicationData[] = [
  { nom: "A CERUMEN sol auriculaire", voie: "DIS", unite: "." },
  { nom: "ABILIFY 10 mg cp", voie: "par voie IM", quantite: 1, unite: "comprimé(s)", frequence: "toutes les 6 heures", duree: "pendant 3", instruction: "le matin à jeun" },
  { nom: "ACEFYL SP" },
  { nom: "ACFOL 5mg comprimé" },
  { nom: "ACIDE TRANEXAMIQUE 500 mg", voie: "par voie cutanée", quantite: 2, unite: "sachet(s)", frequence: "matin-midi-soir", duree: "pendant 4", instruction: "le matin apres repas" },
  // … et ainsi de suite pour toutes les lignes du CSV
];

export default MEDICATIONS_DATA;
