import bcrypt from 'bcryptjs';
import { User, LoginCredentials } from '../types/user';
import { initializeDefaultUsers } from '../data/seedData';

const USERS_STORAGE_KEY = 'cabinet_medical_users';
const CURRENT_USER_KEY = 'cabinet_medical_current_user';

export class AuthService {
  private static instance: AuthService;
  private users: User[] = [];

  private constructor() {
    this.initializeUsers();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeUsers(): Promise<void> {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    } else {
      // Initialiser avec des utilisateurs par défaut
      this.users = await initializeDefaultUsers();
      this.saveUsers();
    }
  }

  private saveUsers(): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
  }

  public async login(credentials: LoginCredentials): Promise<User | null> {
    const user = this.users.find(u => u.login === credentials.login);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(credentials.mot_de_passe, user.mot_de_passe);
    
    if (isPasswordValid) {
      // Stocker l'utilisateur connecté (sans le mot de passe)
      const userWithoutPassword = { ...user, mot_de_passe: '' };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }

    return null;
  }

  public logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  public getCurrentUser(): User | null {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public getAllUsers(): User[] {
    // Toujours recharger depuis le localStorage pour avoir les données à jour
    this.loadUsers();
    const users = this.users;
    return users.map((user: User) => ({ ...user, mot_de_passe: '' }));
  }

  private loadUsers(): void {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }
}