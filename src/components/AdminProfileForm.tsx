import React, { useState, useEffect } from 'react';
import { Save, X, User, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types/user';
import { AdminProfileData } from '../types/userManagement';
import { UserManagementService } from '../services/userManagementService';

interface AdminProfileFormProps {
  admin: UserType;
  onSave: (profileData: AdminProfileData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AdminProfileForm: React.FC<AdminProfileFormProps> = ({
  admin,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AdminProfileData>({
    nom: '',
    prenom: '',
    login: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: ''
  });

  const [errors, setErrors] = useState<Partial<AdminProfileData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: false,
    errors: []
  });

  const userManagementService = UserManagementService.getInstance();

  useEffect(() => {
    setFormData({
      nom: admin.nom,
      prenom: admin.prenom,
      login: admin.login,
      mot_de_passe: '',
      confirmer_mot_de_passe: ''
    });
  }, [admin]);

  useEffect(() => {
    if (formData.mot_de_passe) {
      const validation = userManagementService.validatePassword(formData.mot_de_passe);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength({ isValid: false, errors: [] });
    }
  }, [formData.mot_de_passe]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminProfileData> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.login.trim()) newErrors.login = 'L\'identifiant est requis';

    // Validation du login (unicité)
    if (formData.login && !userManagementService.isLoginUnique(formData.login, admin.id)) {
      newErrors.login = 'Cet identifiant existe déjà';
    }

    // Validation du mot de passe (optionnel pour modification)
    if (formData.mot_de_passe) {
      if (!passwordStrength.isValid) {
        newErrors.mot_de_passe = 'Le mot de passe ne respecte pas les critères de sécurité';
      }
      
      if (formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
        newErrors.confirmer_mot_de_passe = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof AdminProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span>Modifier mon profil administrateur</span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  errors.nom ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom de famille"
              />
              {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  errors.prenom ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Prénom"
              />
              {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
            </div>
          </div>

          {/* Identifiant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Identifiant de connexion *</span>
            </label>
            <input
              type="text"
              value={formData.login}
              onChange={(e) => handleInputChange('login', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-mono ${
                errors.login ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="identifiant_unique"
            />
            {errors.login && <p className="text-red-500 text-sm mt-1">{errors.login}</p>}
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Lock className="h-4 w-4" />
              <span>Nouveau mot de passe (optionnel)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.mot_de_passe}
                onChange={(e) => handleInputChange('mot_de_passe', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  errors.mot_de_passe ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Laisser vide pour ne pas changer"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.mot_de_passe && <p className="text-red-500 text-sm mt-1">{errors.mot_de_passe}</p>}
            
            {/* Indicateur de force du mot de passe */}
            {formData.mot_de_passe && (
              <div className="mt-2">
                <div className={`text-xs p-2 rounded ${
                  passwordStrength.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {passwordStrength.isValid ? (
                    '✅ Mot de passe sécurisé'
                  ) : (
                    <div>
                      <p className="font-medium mb-1">Critères manquants :</p>
                      <ul className="list-disc list-inside space-y-1">
                        {passwordStrength.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirmation mot de passe */}
          {formData.mot_de_passe && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmer_mot_de_passe}
                  onChange={(e) => handleInputChange('confirmer_mot_de_passe', e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                    errors.confirmer_mot_de_passe ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirmer le nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmer_mot_de_passe && <p className="text-red-500 text-sm mt-1">{errors.confirmer_mot_de_passe}</p>}
            </div>
          )}

          {/* Note de sécurité */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">⚠️ Attention :</p>
                <p>La modification de vos identifiants vous déconnectera automatiquement. Vous devrez vous reconnecter avec vos nouveaux identifiants.</p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>Mettre à jour mon profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};