export interface UserFormData {
  nom: string;
  prenom: string;
  login: string;
  mot_de_passe: string;
  confirmer_mot_de_passe: string;
  role: 'médecin' | 'infirmière' | 'spécialiste';
}

export interface UserUpdateData {
  nom: string;
  prenom: string;
  login: string;
  role: 'médecin' | 'infirmière' | 'spécialiste';
}

export interface PasswordResetResult {
  success: boolean;
  newPassword?: string;
  error?: string;
}

export interface AdminProfileData {
  nom: string;
  prenom: string;
  login: string;
  mot_de_passe?: string;
  confirmer_mot_de_passe?: string;
}