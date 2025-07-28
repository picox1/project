/**
 * Utilitaires de validation pour les documents
 */

import { InvoiceWithDetails } from '../types/billing';
import { PrescriptionWithDetails } from '../types/prescription';
import { ConsultationWithDetails } from '../types/consultation';
import { AnalysisWithDetails } from '../types/analysis';
import { CertificateWithDetails } from '../types/certificate';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateInvoiceForPrint = (invoice: InvoiceWithDetails): ValidationResult => {
  const errors: string[] = [];

  if (!invoice) {
    errors.push('Facture non trouvée');
    return { isValid: false, errors };
  }

  if (!invoice.patient_nom || !invoice.patient_prenom) {
    errors.push('Informations patient manquantes');
  }

  if (!invoice.montant_total || invoice.montant_total <= 0) {
    errors.push('Montant total invalide');
  }

  if (!invoice.date_facture) {
    errors.push('Date de facture manquante');
  }

  if (!invoice.description) {
    errors.push('Description des services manquante');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePrescriptionForPrint = (prescription: PrescriptionWithDetails): ValidationResult => {
  const errors: string[] = [];

  if (!prescription) {
    errors.push('Ordonnance non trouvée');
    return { isValid: false, errors };
  }

  if (!prescription.patient_nom || !prescription.patient_prenom) {
    errors.push('Informations patient manquantes');
  }

  if (!prescription.professionnel_nom || !prescription.professionnel_prenom) {
    errors.push('Informations prescripteur manquantes');
  }

  if (!prescription.liste_medicaments || prescription.liste_medicaments.length === 0) {
    errors.push('Aucun médicament prescrit');
  } else {
    prescription.liste_medicaments.forEach((med, index) => {
      if (!med.nom) errors.push(`Nom du médicament ${index + 1} manquant`);
      if (!med.dosage) errors.push(`Dosage du médicament ${index + 1} manquant`);
      if (!med.frequence) errors.push(`Fréquence du médicament ${index + 1} manquante`);
      if (!med.duree) errors.push(`Durée du médicament ${index + 1} manquante`);
    });
  }

  if (!prescription.date_emission) {
    errors.push('Date d\'émission manquante');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateConsultationForPrint = (consultation: ConsultationWithDetails): ValidationResult => {
  const errors: string[] = [];

  if (!consultation) {
    errors.push('Consultation non trouvée');
    return { isValid: false, errors };
  }

  if (!consultation.patient_nom || !consultation.patient_prenom) {
    errors.push('Informations patient manquantes');
  }

  if (!consultation.professionnel_nom || !consultation.professionnel_prenom) {
    errors.push('Informations médecin manquantes');
  }

  if (!consultation.diagnostic) {
    errors.push('Diagnostic manquant');
  }

  if (!consultation.date_consultation) {
    errors.push('Date de consultation manquante');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAnalysisForPrint = (analysis: AnalysisWithDetails): ValidationResult => {
  const errors: string[] = [];

  if (!analysis) {
    errors.push('Bulletin d\'analyses non trouvé');
    return { isValid: false, errors };
  }

  if (!analysis.patient_nom || !analysis.patient_prenom) {
    errors.push('Informations patient manquantes');
  }

  if (!analysis.professionnel_nom || !analysis.professionnel_prenom) {
    errors.push('Informations professionnel manquantes');
  }

  if (!analysis.type_analyse) {
    errors.push('Type d\'analyse manquant');
  }

  if (!analysis.resultats || analysis.resultats.length === 0) {
    errors.push('Aucun résultat d\'analyse');
  } else {
    analysis.resultats.forEach((result, index) => {
      if (!result.parametre) errors.push(`Paramètre ${index + 1} manquant`);
      if (!result.valeur) errors.push(`Valeur ${index + 1} manquante`);
    });
  }

  if (!analysis.date_analyse) {
    errors.push('Date d\'analyse manquante');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCertificateForPrint = (certificate: CertificateWithDetails): ValidationResult => {
  const errors: string[] = [];

  if (!certificate) {
    errors.push('Certificat non trouvé');
    return { isValid: false, errors };
  }

  if (!certificate.patient_nom || !certificate.patient_prenom) {
    errors.push('Informations patient manquantes');
  }

  if (!certificate.professionnel_nom || !certificate.professionnel_prenom) {
    errors.push('Informations médecin manquantes');
  }

  if (!certificate.commentaire) {
    errors.push('Commentaire médical manquant');
  }

  if (!certificate.date_emission) {
    errors.push('Date d\'émission manquante');
  }

  if (certificate.type_certificat === 'repos' && (!certificate.duree_repos || certificate.duree_repos <= 0)) {
    errors.push('Durée de repos manquante pour un certificat d\'arrêt de travail');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const canUserPrint = (userRole: string): boolean => {
  return ['admin', 'médecin', 'spécialiste'].includes(userRole);
};