import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Building, MapPin, Phone, Mail, FileText, Globe, User, Upload, X } from 'lucide-react';
import { ClinicInfo, ClinicInfoFormData } from '../types/clinic';

interface ClinicSettingsFormProps {
  clinicInfo: ClinicInfo;
  onSave: (clinicData: ClinicInfoFormData) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const ClinicSettingsForm: React.FC<ClinicSettingsFormProps> = ({
  clinicInfo,
  onSave,
  onReset,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ClinicInfoFormData>({
    nom: '',
    logo: '',
    adresse: '',
    telephone: '',
    email: '',
    rccm: '',
    ninea: '',
    site_web: '',
    responsable_medical_nom: '',
    responsable_medical_prenom: ''
  });

  const [errors, setErrors] = useState<Partial<ClinicInfoFormData>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setFormData(clinicInfo);
  }, [clinicInfo]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ClinicInfoFormData> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom de la structure est requis';
    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.rccm.trim()) newErrors.rccm = 'Le numéro RCCM est requis';
    if (!formData.ninea.trim()) newErrors.ninea = 'Le NINEA est requis';
    if (!formData.responsable_medical_nom.trim()) newErrors.responsable_medical_nom = 'Le nom du responsable médical est requis';
    if (!formData.responsable_medical_prenom.trim()) newErrors.responsable_medical_prenom = 'Le prénom du responsable médical est requis';

    // Validation email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
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

  const handleInputChange = (field: keyof ClinicInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleInputChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetConfirm = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Building className="h-6 w-6 text-blue-600" />
          <span>Informations de la structure</span>
        </h3>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Restaurer par défaut</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom et logo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>Nom de la structure *</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Cabinet Médical de Warang"
            />
            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>Logo (optionnel)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Choisir un fichier</span>
              </label>
              {formData.logo && (
                <div className="flex items-center space-x-2">
                  <img src={formData.logo} alt="Logo" className="h-8 w-8 object-contain" />
                  <button
                    type="button"
                    onClick={() => handleInputChange('logo', '')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>Adresse complète *</span>
          </label>
          <textarea
            value={formData.adresse}
            onChange={(e) => handleInputChange('adresse', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
              errors.adresse ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Quartier, rue, ville, pays..."
          />
          {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>}
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>Téléphone *</span>
            </label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.telephone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+221 33 XXX XX XX"
            />
            {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>Email *</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contact@cabinetwarang.sn"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Informations légales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Numéro RCCM *</span>
            </label>
            <input
              type="text"
              value={formData.rccm}
              onChange={(e) => handleInputChange('rccm', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.rccm ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="SN-DKR-2024-A-XXXX"
            />
            {errors.rccm && <p className="text-red-500 text-sm mt-1">{errors.rccm}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>NINEA *</span>
            </label>
            <input
              type="text"
              value={formData.ninea}
              onChange={(e) => handleInputChange('ninea', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.ninea ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="XXXXXXXXX"
            />
            {errors.ninea && <p className="text-red-500 text-sm mt-1">{errors.ninea}</p>}
          </div>
        </div>

        {/* Site web */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <Globe className="h-4 w-4" />
            <span>Site web (optionnel)</span>
          </label>
          <input
            type="url"
            value={formData.site_web}
            onChange={(e) => handleInputChange('site_web', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="https://www.cabinetwarang.sn"
          />
        </div>

        {/* Responsable médical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Prénom du responsable médical *</span>
            </label>
            <input
              type="text"
              value={formData.responsable_medical_prenom}
              onChange={(e) => handleInputChange('responsable_medical_prenom', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.responsable_medical_prenom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dr. Amadou"
            />
            {errors.responsable_medical_prenom && <p className="text-red-500 text-sm mt-1">{errors.responsable_medical_prenom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Nom du responsable médical *</span>
            </label>
            <input
              type="text"
              value={formData.responsable_medical_nom}
              onChange={(e) => handleInputChange('responsable_medical_nom', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.responsable_medical_nom ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="DIOP"
            />
            {errors.responsable_medical_nom && <p className="text-red-500 text-sm mt-1">{errors.responsable_medical_nom}</p>}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>

      {/* Modal de confirmation reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RotateCcw className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Restaurer les valeurs par défaut
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir restaurer les informations par défaut ? Toutes les modifications seront perdues.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Restaurer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};