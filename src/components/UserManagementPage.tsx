import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  RotateCcw, 
  Search,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  User as UserIcon,
  Key
} from 'lucide-react';
import { User } from '../types/user';
import { UserFormData, UserUpdateData, PasswordResetResult, AdminProfileData } from '../types/userManagement';
import { UserManagementService } from '../services/userManagementService';
import { UserForm } from './UserForm';
import { AdminProfileForm } from './AdminProfileForm';

interface UserManagementPageProps {
  user: User;
  onBackToDashboard: () => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ user, onBackToDashboard }) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<PasswordResetResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'profile'>('users');

  const userManagementService = UserManagementService.getInstance();

  // Vérifier les autorisations
  const hasAccess = user.role === 'admin';

  useEffect(() => {
    if (hasAccess) {
      loadUsers();
    }
  }, [hasAccess]);

  const loadUsers = () => {
    const allUsers = userManagementService.getAllMedicalProfessionals();
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const searchResults = userManagementService.searchUsers(query);
    setFilteredUsers(searchResults);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setShowUserForm(true);
  };

  const handleSaveUser = async (userData: UserFormData) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        const updateData: UserUpdateData = {
          nom: userData.nom,
          prenom: userData.prenom,
          login: userData.login,
          role: userData.role
        };
        const updatedUser = await userManagementService.updateUser(editingUser.id, updateData);
        if (updatedUser) {
          loadUsers();
          showNotification('success', 'Utilisateur mis à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour de l\'utilisateur');
        }
      } else {
        const newUser = await userManagementService.createUser(userData);
        if (newUser) {
          loadUsers();
          showNotification('success', `Utilisateur ${newUser.prenom} ${newUser.nom} créé avec succès`);
        } else {
          showNotification('error', 'Erreur lors de la création de l\'utilisateur');
        }
      }
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const success = userManagementService.deleteUser(userId);
    if (success) {
      loadUsers();
      showNotification('success', 'Utilisateur supprimé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression de l\'utilisateur');
    }
    setShowDeleteConfirm(null);
  };

  const handleResetPassword = async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await userManagementService.resetPassword(userId);
      setResetResult(result);
      if (result.success) {
        showNotification('success', 'Mot de passe réinitialisé avec succès');
      } else {
        showNotification('error', result.error || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de la réinitialisation');
    } finally {
      setIsLoading(false);
      setShowPasswordReset(null);
    }
  };

  const handleUpdateAdminProfile = async (profileData: AdminProfileData) => {
    setIsLoading(true);
    try {
      const updatedAdmin = await userManagementService.updateAdminProfile(user.id, profileData);
      if (updatedAdmin) {
        showNotification('success', 'Profil administrateur mis à jour avec succès');
        // Recharger la page pour mettre à jour la session
        window.location.reload();
      } else {
        showNotification('error', 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setIsLoading(false);
      setShowAdminForm(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'médecin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'infirmière':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'spécialiste':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'médecin':
        return '👨‍⚕️';
      case 'infirmière':
        return '👩‍⚕️';
      case 'spécialiste':
        return '🔬';
      default:
        return '👤';
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des utilisateurs.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les administrateurs peuvent accéder à cette section.
          </p>
          <button
            onClick={onBackToDashboard}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour au tableau de bord</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <Users className="h-8 w-8 text-red-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
             <p className="text-gray-600">Administration des comptes professionnels de {clinicInfo?.nom || 'la structure'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Gestion des comptes
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserIcon className="h-4 w-4 inline mr-2" />
            Mon compte
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' ? (
          <>
            {/* Header avec recherche et bouton d'ajout */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 mb-8">
              <div className="flex items-center space-x-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom ou identifiant..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddUser}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau compte</span>
              </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total comptes</p>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Médecins</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {users.filter(u => u.role === 'médecin').length}
                    </p>
                  </div>
                  <div className="text-2xl">👨‍⚕️</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Infirmières</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter(u => u.role === 'infirmière').length}
                    </p>
                  </div>
                  <div className="text-2xl">👩‍⚕️</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Spécialistes</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {users.filter(u => u.role === 'spécialiste').length}
                    </p>
                  </div>
                  <div className="text-2xl">🔬</div>
                </div>
              </div>
            </div>

            {/* Liste des utilisateurs */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Aucun utilisateur trouvé' : 'Aucun compte professionnel'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? 'Essayez de modifier votre recherche'
                    : 'Commencez par créer votre premier compte professionnel'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleAddUser}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Créer un compte
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Professionnel</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Rôle</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Identifiant</th>
                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{getRoleIcon(userItem.role)}</div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {userItem.prenom} {userItem.nom}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(userItem.role)}`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-700 font-mono">
                            {userItem.login}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => setShowPasswordReset(userItem.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Réinitialiser le mot de passe"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => handleEditUser(userItem)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => setShowDeleteConfirm(userItem.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Profil admin */
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  <span>Mon compte administrateur</span>
                </h3>
                <button
                  onClick={() => setShowAdminForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <p className="text-gray-900 font-medium">{user.prenom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <p className="text-gray-900 font-medium">{user.nom}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
                  <p className="text-gray-900 font-mono">{user.login}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
                    Administrateur
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire utilisateur modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Formulaire admin modal */}
      {showAdminForm && (
        <AdminProfileForm
          admin={user}
          onSave={handleUpdateAdminProfile}
          onCancel={() => setShowAdminForm(false)}
          isLoading={isLoading}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supprimer le compte
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réinitialisation de mot de passe */}
      {showPasswordReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Key className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Réinitialiser le mot de passe
              </h3>
              <p className="text-gray-600 mb-6">
                Un nouveau mot de passe temporaire sera généré pour cet utilisateur.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPasswordReset(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleResetPassword(showPasswordReset)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Génération...' : 'Réinitialiser'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de résultat de réinitialisation */}
      {resetResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className={`p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
                resetResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {resetResult.success ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {resetResult.success ? 'Mot de passe réinitialisé' : 'Erreur'}
              </h3>
              {resetResult.success && resetResult.newPassword ? (
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Nouveau mot de passe temporaire :
                  </p>
                  <div className="bg-gray-100 p-3 rounded-lg border">
                    <code className="text-lg font-mono font-bold text-gray-900">
                      {resetResult.newPassword}
                    </code>
                  </div>
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ Communiquez ce mot de passe à l'utilisateur de manière sécurisée
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  {resetResult.error || 'Une erreur est survenue'}
                </p>
              )}
              <button
                onClick={() => setResetResult(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};