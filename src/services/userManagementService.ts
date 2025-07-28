import bcrypt from 'bcryptjs';
import { User } from '../types/user';
import { UserFormData, UserUpdateData, PasswordResetResult, AdminProfileData } from '../types/userManagement';
import { AuthService } from './auth';

export class UserManagementService {
  private static instance: UserManagementService;
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getUsers(): User[] {
    const storedUsers = localStorage.getItem('cabinet_medical_users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem('cabinet_medical_users', JSON.stringify(users));
  }

  public async createUser(userData: UserFormData): Promise<User | null> {
    try {
      // Récupérer tous les utilisateurs depuis le localStorage
      const storedUsers = localStorage.getItem('cabinet_medical_users');
      const existingUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Vérifier l'unicité du login
      const loginExists = existingUsers.some(user => user.login === userData.login);
      
      if (loginExists) {
        throw new Error('Cet identifiant existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.mot_de_passe, 10);

      const newUser: User = {
        id: this.generateUniqueId(),
        nom: userData.nom,
        prenom: userData.prenom,
        login: userData.login,
        mot_de_passe: hashedPassword,
        role: userData.role
      };
      // Ajouter l'utilisateur à la liste existante
      existingUsers.push(newUser);
      localStorage.setItem('cabinet_medical_users', JSON.stringify(existingUsers));

      return { ...newUser, mot_de_passe: '' }; // Retourner sans le mot de passe
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return null;
    }
  }

  public async updateUser(userId: string, userData: UserUpdateData): Promise<User | null> {
    try {
      const storedUsers = localStorage.getItem('cabinet_medical_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier l'unicité du login (sauf pour l'utilisateur actuel)
      const loginExists = users.some(user => user.login === userData.login && user.id !== userId);
      if (loginExists) {
        throw new Error('Cet identifiant existe déjà');
      }

      // Mettre à jour l'utilisateur
      users[userIndex] = {
        ...users[userIndex],
        nom: userData.nom,
        prenom: userData.prenom,
        login: userData.login,
        role: userData.role
      };

      this.saveUsers(users);
      localStorage.setItem('cabinet_medical_users', JSON.stringify(users));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return null;
    }
  }

  public deleteUser(userId: string): boolean {
    try {
      const storedUsers = localStorage.getItem('cabinet_medical_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        return false;
      }

      // Ne pas permettre la suppression du dernier admin
      const user = users[userIndex];
      if (user.role === 'admin') {
        const adminCount = users.filter(u => u.role === 'admin').length;
        if (adminCount <= 1) {
          throw new Error('Impossible de supprimer le dernier administrateur');
        }
      }

      users.splice(userIndex, 1);
      localStorage.setItem('cabinet_medical_users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return false;
    }
  }

  public async resetPassword(userId: string): Promise<PasswordResetResult> {
    try {
      const storedUsers = localStorage.getItem('cabinet_medical_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      // Générer un nouveau mot de passe
      const newPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe
      users[userIndex].mot_de_passe = hashedPassword;
      localStorage.setItem('cabinet_medical_users', JSON.stringify(users));

      return { success: true, newPassword };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { success: false, error: 'Erreur lors de la réinitialisation' };
    }
  }

  public async updateAdminProfile(adminId: string, profileData: AdminProfileData): Promise<User | null> {
    try {
      const storedUsers = localStorage.getItem('cabinet_medical_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const adminIndex = users.findIndex(user => user.id === adminId);
      
      if (adminIndex === -1) {
        throw new Error('Administrateur non trouvé');
      }

      // Vérifier l'unicité du login (sauf pour l'admin actuel)
      const loginExists = users.some(user => user.login === profileData.login && user.id !== adminId);
      if (loginExists) {
        throw new Error('Cet identifiant existe déjà');
      }

      // Mettre à jour les informations de base
      users[adminIndex].nom = profileData.nom;
      users[adminIndex].prenom = profileData.prenom;
      users[adminIndex].login = profileData.login;

      // Mettre à jour le mot de passe si fourni
      if (profileData.mot_de_passe) {
        const hashedPassword = await bcrypt.hash(profileData.mot_de_passe, 10);
        users[adminIndex].mot_de_passe = hashedPassword;
      }

      localStorage.setItem('cabinet_medical_users', JSON.stringify(users));
      
      // Mettre à jour la session si c'est l'utilisateur connecté
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.id === adminId) {
        const updatedUser = { ...users[adminIndex], mot_de_passe: '' };
        localStorage.setItem('cabinet_medical_current_user', JSON.stringify(updatedUser));
      }

      return { ...users[adminIndex], mot_de_passe: '' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil admin:', error);
      return null;
    }
  }

  public getAllMedicalProfessionals(): User[] {
    const storedUsers = localStorage.getItem('cabinet_medical_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    return users
      .filter(user => ['médecin', 'infirmière', 'spécialiste'].includes(user.role))
      .map(user => ({ ...user, mot_de_passe: '' }));
  }

  public getPrescribingProfessionals(): User[] {
    const storedUsers = localStorage.getItem('cabinet_medical_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    return users
      .filter(user => ['médecin', 'spécialiste'].includes(user.role))
      .map(user => ({ ...user, mot_de_passe: '' }));
  }

  public searchUsers(query: string): User[] {
    if (!query.trim()) return this.getAllMedicalProfessionals();

    const searchTerm = query.toLowerCase().trim();
    return this.getAllMedicalProfessionals().filter(user =>
      user.nom.toLowerCase().includes(searchTerm) ||
      user.prenom.toLowerCase().includes(searchTerm) ||
      user.login.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  }

  public validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public isLoginUnique(login: string, excludeUserId?: string): boolean {
    const storedUsers = localStorage.getItem('cabinet_medical_users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    return !users.some(user => user.login === login && user.id !== excludeUserId);
  }
}