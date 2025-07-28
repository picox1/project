import React, { useState, useEffect } from 'react';
import { Save, X, FileText, User, Users, Calendar, Award } from 'lucide-react';
import { Certificate, CertificateFormData } from '../types/certificate';
import { Patient } from '../types/patient';
import { User as UserType } from '../types/user';
import { ConsultationWithDetails } from '../types/consultation';

interface CertificateFormProps {
  certificate?: Certificate | null;
  patients: Patient[];
  professionals: UserType[];
  consultations?: ConsultationWithDetails[];
  selectedConsultation?: ConsultationWithDetails | null;
  onSave: (certificateData: CertificateFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  certificate,
  patients,
  professionals,
  consultations = [],
  selectedConsultation,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CertificateFormData>({
    patient_id: '',
    consultation_id: '',
    professionnel_id: '',
    type_certificat: 'repos',
    duree_repos: undefined,
    commentaire: ''
  });

  const [errors, setErrors] = useState<Partial<CertificateFormData>>({});

  useEffect(() => {
    if (certificate) {
      setFormData({
        patient_id: certificate.patient_id,
        consultation_id: certificate.consultation_id || '',
        professionnel_id: certificate.professionnel_id,
        type_certificat: certificate.type_certificat,
        duree_repos: certificate.duree_repos,
        commentaire: certificate.commentaire
      });
    } else if (selectedConsultation) {
      setFormData(prev => ({
        ...prev,
        patient_id: selectedConsultation.patient_id,
        professionnel_id: selectedConsultation.professionnel_id,
        consultation_id: selectedConsultation.id
      }));
    }
  }, [certificate, selectedConsultation]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CertificateFormData> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Veuillez sélectionner un patient';
    if (!formData.professionnel_id) newErrors.professionnel_id = 'Veuillez sélectionner un professionnel';
    if (!formData.commentaire.trim()) newErrors.commentaire = 'Le commentaire est requis';
    
    if (formData.type_certificat === 'repos' && (!formData.duree_repos || formData.duree_repos <= 0)) {
      newErrors.duree_repos = 'La durée de repos est requise pour un certificat de repos' as any;
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

  const handleInputChange = (field: keyof CertificateFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const certificateTypes = [
    { value: 'repos', label: 'Arrêt de travail / Repos' },
    { value: 'aptitude', label: 'Certificat d\'aptitude' },
    { value: 'grossesse', label: 'Certificat de grossesse' },
    { value: 'sport', label: 'Certificat médical sport' },
    { value: 'maladie', label: 'Certificat de maladie' },
    { value: 'accident', label: 'Certificat d\'accident' },
    { value: 'autre', label: 'Autre certificat' }
  ];

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Award className="h-6 w-6 text-blue-600" />
              <span>{certificate ? 'Modifier le certificat' : 'Nouveau certificat médical'}</span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {selectedConsultation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Certificat basé sur la consultation :</strong> {selectedConsultation.diagnostic} - 
                {new Date(selectedConsultation.date_consultation).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sélection patient et professionnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Patient *</span>
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                disabled={!!selectedConsultation}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.patient_id ? 'border-red-500' : 'border-gray-300'
                } ${selectedConsultation ? 'bg-gray-100' : ''}`}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.prenom} {patient.nom} - {patient.numero_dossier}
                  </option>
                ))}
              </select>
              {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}
              
              {selectedPatient && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Âge:</strong> {new Date().getFullYear() - new Date(selectedPatient.date_de_naissance).getFullYear()} ans | 
                    <strong> Sexe:</strong> {selectedPatient.sexe}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Professionnel *</span>
              </label>
              <select
                value={formData.professionnel_id}
                onChange={(e) => handleInputChange('professionnel_id', e.target.value)}
                disabled={!!selectedConsultation}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.professionnel_id ? 'border-red-500' : 'border-gray-300'
                } ${selectedConsultation ? 'bg-gray-100' : ''}`}
              >
                <option value="">Sélectionner un professionnel</option>
                {professionals.filter(prof => ['médecin', 'spécialiste'].includes(prof.role)).map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.prenom} {prof.nom} - {prof.role}
                  </option>
                ))}
              </select>
              {errors.professionnel_id && <p className="text-red-500 text-sm mt-1">{errors.professionnel_id}</p>}
            </div>
          </div>

          {/* Type de certificat et durée */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Type de certificat *</span>
              </label>
              <select
                value={formData.type_certificat}
                onChange={(e) => handleInputChange('type_certificat', e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {certificateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.type_certificat === 'repos' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Durée de repos (jours) *</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.duree_repos || ''}
                  onChange={(e) => handleInputChange('duree_repos', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.duree_repos ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre de jours"
                />
                {errors.duree_repos && <p className="text-red-500 text-sm mt-1">{errors.duree_repos as string}</p>}
              </div>
            )}
          </div>

          {/* Consultation associée (optionnel) */}
          {!selectedConsultation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Consultation associée (optionnel)</span>
              </label>
              <select
                value={formData.consultation_id}
                onChange={(e) => handleInputChange('consultation_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Aucune consultation associée</option>
                {consultations
                  .filter(cons => cons.patient_id === formData.patient_id)
                  .map(consultation => (
                    <option key={consultation.id} value={consultation.id}>
                      {consultation.diagnostic} - {new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Commentaire médical */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Commentaire médical *</span>
            </label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => handleInputChange('commentaire', e.target.value)}
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.commentaire ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Détails médicaux justifiant le certificat..."
            />
            {errors.commentaire && <p className="text-red-500 text-sm mt-1">{errors.commentaire}</p>}
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
              <span>{certificate ? 'Mettre à jour' : 'Créer le certificat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};