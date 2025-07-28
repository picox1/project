import React, { useState, useEffect } from 'react';
import { Save, X, User, Phone, MapPin, Calendar, Droplets, FileText } from 'lucide-react';
import { Patient, PatientFormData } from '../types/patient';

interface PatientFormProps {
  patient?: Patient | null;
  onSave: (patientData: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    nom: '',
    prenom: '',
    sexe: 'Homme',
    date_de_naissance: '',
    telephone: '',
    adresse: '',
    groupe_sanguin: 'A+',
    antecedents_medicaux: ''
  });

  const [errors, setErrors] = useState<Partial<PatientFormData>>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        nom: patient.nom,
        prenom: patient.prenom,
        sexe: patient.sexe,
        date_de_naissance: patient.date_de_naissance,
        telephone: patient.telephone,
        adresse: patient.adresse,
        groupe_sanguin: patient.groupe_sanguin,
        antecedents_medicaux: patient.antecedents_medicaux
      });
    }
  }, [patient]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.date_de_naissance) newErrors.date_de_naissance = 'La date de naissance est requise';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';

    // Validation de la date de naissance (ne doit pas être dans le futur)
    if (formData.date_de_naissance) {
      const birthDate = new Date(formData.date_de_naissance);
      const today = new Date();
      if (birthDate > today) {
        newErrors.date_de_naissance = 'La date de naissance ne peut pas être dans le futur';
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

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <span>{patient ? 'Modifier le patient' : 'Nouveau patient'}</span>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.prenom ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Prénom"
              />
              {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexe *
              </label>
              <select
                value={formData.sexe}
                onChange={(e) => handleInputChange('sexe', e.target.value as 'Homme' | 'Femme')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Date de naissance *</span>
              </label>
              <input
                type="date"
                value={formData.date_de_naissance}
                onChange={(e) => handleInputChange('date_de_naissance', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.date_de_naissance ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date_de_naissance && <p className="text-red-500 text-sm mt-1">{errors.date_de_naissance}</p>}
            </div>
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
                placeholder="01 23 45 67 89"
              />
              {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Droplets className="h-4 w-4" />
                <span>Groupe sanguin</span>
              </label>
              <select
                value={formData.groupe_sanguin}
                onChange={(e) => handleInputChange('groupe_sanguin', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {groupesSanguins.map(groupe => (
                  <option key={groupe} value={groupe}>{groupe}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Adresse *</span>
            </label>
            <textarea
              value={formData.adresse}
              onChange={(e) => handleInputChange('adresse', e.target.value)}
              rows={2}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.adresse ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Adresse complète"
            />
            {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>}
          </div>

          {/* Antécédents médicaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Antécédents médicaux</span>
            </label>
            <textarea
              value={formData.antecedents_medicaux}
              onChange={(e) => handleInputChange('antecedents_medicaux', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Allergies, maladies chroniques, antécédents familiaux..."
            />
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{patient ? 'Mettre à jour' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};