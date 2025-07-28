import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { ClinicSettingsForm } from './ClinicSettingsForm';
import { ClinicInfo, ClinicInfoFormData } from '../types/clinic';
import { User } from '../types/user';

interface SettingsPageProps {
  user: User;
  onBackToDashboard: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBackToDashboard }) => {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const clinicService = ClinicService.getInstance();

  // Vérifier les autorisations - seuls les admins peuvent modifier
  const hasAccess = user.role === 'admin';

  useEffect(() => {
    if (hasAccess) {
      loadClinicInfo();
    }
  }, [hasAccess]);

  const loadClinicInfo = () => {
    const info = clinicService.getClinicInfo();
    setClinicInfo(info);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveClinicInfo = async (clinicData: ClinicInfoFormData) => {
    setIsLoading(true);
    try {
      const updatedInfo = clinicService.updateClinicInfo(clinicData);
      setClinicInfo(updatedInfo);
      showNotification('success', 'Informations de la structure mises à jour avec succès');
    } catch (error) {
      showNotification('error', 'Erreur lors de la mise à jour des informations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetClinicInfo = () => {
    try {
      const defaultInfo = clinicService.resetToDefault();
      setClinicInfo(defaultInfo);
      showNotification('success', 'Informations restaurées aux valeurs par défaut');
    } catch (error) {
      showNotification('error', 'Erreur lors de la restauration');
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
            Vous n'avez pas les permissions nécessaires pour accéder aux paramètres.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les administrateurs peuvent modifier les paramètres de la structure.
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
            <div className="bg-gray-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <Settings className="h-8 w-8 text-gray-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
             <p className="text-gray-600">Configuration de {clinicInfo?.nom || 'la structure médicale'}</p>
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

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {clinicInfo && (
          <ClinicSettingsForm
            clinicInfo={clinicInfo}
            onSave={handleSaveClinicInfo}
            onReset={handleResetClinicInfo}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};