import React, { useState, useEffect } from 'react';
import { Save, X, FileText, User, Users, Calendar, Stethoscope, Pill, ClipboardList } from 'lucide-react';
import { Consultation, ConsultationFormData } from '../types/consultation';
import { Patient } from '../types/patient';
import { User as UserType } from '../types/user';
import { AppointmentWithDetails } from '../types/appointment';

interface ConsultationFormProps {
  consultation?: Consultation | null;
  patients: Patient[];
  professionals: UserType[];
  appointments?: AppointmentWithDetails[];
  selectedAppointment?: AppointmentWithDetails | null;
  onSave: (consultationData: ConsultationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  consultation,
  patients,
  professionals,
  appointments = [],
  selectedAppointment,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    patient_id: '',
    professionnel_id: '',
    lien_rendezvous: '',
    symptomes: '',
    diagnostic: '',
    traitement: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<ConsultationFormData>>({});

  useEffect(() => {
    if (consultation) {
      setFormData({
        patient_id: consultation.patient_id,
        professionnel_id: consultation.professionnel_id,
        lien_rendezvous: consultation.lien_rendezvous || '',
        symptomes: consultation.symptomes,
        diagnostic: consultation.diagnostic,
        traitement: consultation.traitement,
        notes: consultation.notes || ''
      });
    } else if (selectedAppointment) {
      // Pré-remplir avec les données du rendez-vous
      setFormData(prev => ({
        ...prev,
        patient_id: selectedAppointment.patient_id,
        professionnel_id: selectedAppointment.professionnel_id,
        lien_rendezvous: selectedAppointment.id
      }));
    }
  }, [consultation, selectedAppointment]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ConsultationFormData> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Veuillez sélectionner un patient';
    if (!formData.professionnel_id) newErrors.professionnel_id = 'Veuillez sélectionner un professionnel';
    if (!formData.symptomes.trim()) newErrors.symptomes = 'Les symptômes sont requis';
    if (!formData.diagnostic.trim()) newErrors.diagnostic = 'Le diagnostic est requis';
    if (!formData.traitement.trim()) newErrors.traitement = 'Le traitement est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof ConsultationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);
  const selectedProfessional = professionals.find(p => p.id === formData.professionnel_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span>{consultation ? 'Modifier la consultation' : 'Nouvelle consultation'}</span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {selectedAppointment && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Consultation basée sur le rendez-vous :</strong> {selectedAppointment.motif} - 
                {new Date(selectedAppointment.date_du_rendez_vous).toLocaleDateString('fr-FR')} à {selectedAppointment.heure_du_rendez_vous}
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
                disabled={!!selectedAppointment}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.patient_id ? 'border-red-500' : 'border-gray-300'
                } ${selectedAppointment ? 'bg-gray-100' : ''}`}
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
                    <strong> Groupe sanguin:</strong> {selectedPatient.groupe_sanguin}
                  </p>
                  {selectedPatient.antecedents_medicaux && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Antécédents:</strong> {selectedPatient.antecedents_medicaux}
                    </p>
                  )}
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
                disabled={!!selectedAppointment}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.professionnel_id ? 'border-red-500' : 'border-gray-300'
                } ${selectedAppointment ? 'bg-gray-100' : ''}`}
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

          {/* Lien rendez-vous (optionnel) */}
          {!selectedAppointment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Rendez-vous associé (optionnel)</span>
              </label>
              <select
                value={formData.lien_rendezvous}
                onChange={(e) => handleInputChange('lien_rendezvous', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Aucun rendez-vous associé</option>
                {appointments
                  .filter(apt => apt.patient_id === formData.patient_id && apt.statut === 'Terminé')
                  .map(appointment => (
                    <option key={appointment.id} value={appointment.id}>
                      {appointment.motif} - {new Date(appointment.date_du_rendez_vous).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Symptômes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <ClipboardList className="h-4 w-4" />
              <span>Symptômes *</span>
            </label>
            <textarea
              value={formData.symptomes}
              onChange={(e) => handleInputChange('symptomes', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.symptomes ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez les symptômes présentés par le patient..."
            />
            {errors.symptomes && <p className="text-red-500 text-sm mt-1">{errors.symptomes}</p>}
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Stethoscope className="h-4 w-4" />
              <span>Diagnostic *</span>
            </label>
            <textarea
              value={formData.diagnostic}
              onChange={(e) => handleInputChange('diagnostic', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.diagnostic ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Diagnostic médical établi..."
            />
            {errors.diagnostic && <p className="text-red-500 text-sm mt-1">{errors.diagnostic}</p>}
          </div>

          {/* Traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Pill className="h-4 w-4" />
              <span>Traitement *</span>
            </label>
            <textarea
              value={formData.traitement}
              onChange={(e) => handleInputChange('traitement', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.traitement ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Traitement prescrit, posologie, recommandations..."
            />
            {errors.traitement && <p className="text-red-500 text-sm mt-1">{errors.traitement}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Notes complémentaires (optionnel)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Notes additionnelles, observations, suivi à prévoir..."
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
              <span>{consultation ? 'Mettre à jour' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};