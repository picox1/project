export interface ClinicInfo {
  nom: string;
  logo?: string;
  adresse: string;
  telephone: string;
  email: string;
  rccm: string;
  ninea: string;
  site_web?: string;
  responsable_medical_nom: string;
  responsable_medical_prenom: string;
}

export interface ClinicInfoFormData {
  nom: string;
  logo?: string;
  adresse: string;
  telephone: string;
  email: string;
  rccm: string;
  ninea: string;
  site_web?: string;
  responsable_medical_nom: string;
  responsable_medical_prenom: string;
}