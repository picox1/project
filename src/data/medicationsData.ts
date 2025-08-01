// src/data/medicationsData.ts
export interface MedicationData {
  nom: string;
  voie: string[];
  quantite: number[];
  unite: string[];
  frequence: string[];
  duree: string[];
  instruction: string[];
}

// Extrait minimal (générez un JSON complet depuis votre CSV)
const MEDICATIONS_DATA: MedicationData[] = [
  {
    nom: "ACFOL 5mg comprimé",
    voie: ["orale", "IM"],
    quantite: [1, 2, 3],
    unite: ["comprimé(s)"],
    frequence: ["matin", "soir", "matin et soir"],
    duree: ["5 jours", "10 jours"],
    instruction: ["après repas", "à jeun"]
  },
  // … répétez pour chaque médicament
];

export default MEDICATIONS_DATA;
