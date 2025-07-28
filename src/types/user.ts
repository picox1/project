export interface User {
  id: string;
  nom: string;
  prenom: string;
  login: string;
  mot_de_passe: string;
  role: 'médecin' | 'infirmière' | 'spécialiste' | 'admin';
}

export interface LoginCredentials {
  login: string;
  mot_de_passe: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}