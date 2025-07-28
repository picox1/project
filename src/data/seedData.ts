import bcrypt from 'bcryptjs';
import { User } from '../types/user';

// Fonction pour créer des utilisateurs avec mots de passe hashés
export const createUser = async (userData: Omit<User, 'id' | 'mot_de_passe'> & { mot_de_passe: string }): Promise<User> => {
  const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 10);
  return {
    ...userData,
    id: Math.random().toString(36).substr(2, 9),
    mot_de_passe: hashedPassword,
  };
};

// Utilisateurs par défaut pour la démonstration
export const initializeDefaultUsers = async (): Promise<User[]> => {
  const defaultUsers = [
    {
      nom: 'Martin',
      prenom: 'Dr. Jean',
      login: 'jmartin',
      mot_de_passe: 'medecin123',
      role: 'médecin' as const,
    },
    {
      nom: 'Dubois',
      prenom: 'Marie',
      login: 'mdubois',
      mot_de_passe: 'infirmiere123',
      role: 'infirmière' as const,
    },
    {
      nom: 'Bernard',
      prenom: 'Dr. Pierre',
      login: 'pbernard',
      mot_de_passe: 'specialiste123',
      role: 'spécialiste' as const,
    },
    {
      nom: 'Leroy',
      prenom: 'Sophie',
      login: 'sleroy',
      mot_de_passe: 'admin123',
      role: 'admin' as const,
    },
  ];

  const users = await Promise.all(
    defaultUsers.map(userData => createUser(userData))
  );

  return users;
};