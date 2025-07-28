// types/billing.ts

export interface Invoice {
  id: string;
  patient_id: string;
  consultation_id?: string;
  date_facture: string;
  montant_total: number;
  montant_paye: number;
  solde_restant: number;
  statut: 'Payée' | 'Partiellement payée' | 'Impayée';
  description?: string;
  date_creation: string;
  actes?: ActeMedical[]; // ← ajoute bien cette ligne !
}

export interface Payment {
  id: string;
  facture_id: string;
  date_paiement: string;
  montant: number;
  mode_paiement: 'Espèces' | 'Mobile Money' | 'Chèque' | 'Virement';
  reference?: string;
  notes?: string;
}

// --------------------- AJOUT POUR GESTION ACTES -------------------------
export interface ActeMedical {
  id?: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
}

// --------------------- Formulaires pour création/édition ----------------
export interface InvoiceFormData {
  patient_id: string;
  consultation_id?: string;
  actes: ActeMedical[]; // ← maintenant, toujours une liste d'actes
  montant_total: number;
  description?: string;
}

export interface PaymentFormData {
  facture_id: string;
  montant: number;
  mode_paiement: 'Espèces' | 'Mobile Money' | 'Chèque' | 'Virement';
  reference?: string;
  notes?: string;
}

// --------------------- Pour affichage et impression ---------------------
export interface InvoiceWithDetails extends Invoice {
  patient_nom: string;
  patient_prenom: string;
  consultation_diagnostic?: string;
  consultation_date?: string;
  payments: Payment[];
  actes?: ActeMedical[];
}

// --------------------- Filtres/Status ---------------------
export type InvoiceFilter = 'all' | 'paid' | 'partial' | 'unpaid';
export type InvoiceStatus = 'Payée' | 'Partiellement payée' | 'Impayée';
