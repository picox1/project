import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, FileText, User, Users, Calendar, Pill } from 'lucide-react';
import { Prescription, PrescriptionFormData, Medication } from '../types/prescription';
import { Patient } from '../types/patient';
import { User as UserType } from '../types/user';
import { ConsultationWithDetails } from '../types/consultation';

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  patients: Patient[];
  professionals: UserType[];
  consultations?: ConsultationWithDetails[];
  selectedConsultation?: ConsultationWithDetails | null;
  onSave: (prescriptionData: PrescriptionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  prescription,
  patients,
  professionals,
  consultations = [],
  selectedConsultation,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patient_id: '',
    consultation_id: '',
    professionnel_id: '',
    liste_medicaments: [],
    instructions_generales: '',
    signature: ''
  });

  const [errors, setErrors] = useState<Partial<PrescriptionFormData>>({});

  useEffect(() => {
    if (prescription) {
      setFormData({
        patient_id: prescription.patient_id,
        consultation_id: prescription.consultation_id || '',
        professionnel_id: prescription.professionnel_id,
        liste_medicaments: prescription.liste_medicaments,
        instructions_generales: prescription.instructions_generales,
        signature: prescription.signature
      });
    } else if (selectedConsultation) {
      // Pré-remplir avec les données de la consultation
      setFormData(prev => ({
        ...prev,
        patient_id: selectedConsultation.patient_id,
        professionnel_id: selectedConsultation.professionnel_id,
        consultation_id: selectedConsultation.id,
        signature: `${selectedConsultation.professionnel_prenom} ${selectedConsultation.professionnel_nom}`
      }));
    }
  }, [prescription, selectedConsultation]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PrescriptionFormData> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Veuillez sélectionner un patient';
    if (!formData.professionnel_id) newErrors.professionnel_id = 'Veuillez sélectionner un professionnel';
    if (formData.liste_medicaments.length === 0) {
      newErrors.liste_medicaments = 'Veuillez ajouter au moins un médicament' as any;
    }
    if (!formData.signature.trim()) newErrors.signature = 'La signature est requise';

    // Valider chaque médicament
    const medicamentErrors = formData.liste_medicaments.some(med => 
      !med.nom.trim() || !med.dosage.trim() || !med.frequence.trim() || !med.duree.trim()
    );
    
    if (medicamentErrors) {
      newErrors.liste_medicaments = 'Tous les champs des médicaments sont requis' as any;
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

  const handleInputChange = (field: keyof PrescriptionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      nom: '',
      dosage: '',
      frequence: '',
      duree: '',
      instructions: ''
    };
    
    setFormData(prev => ({
      ...prev,
      liste_medicaments: [...prev.liste_medicaments, newMedication]
    }));
  };

  const removeMedication = (medicationId: string) => {
    setFormData(prev => ({
      ...prev,
      liste_medicaments: prev.liste_medicaments.filter(med => med.id !== medicationId)
    }));
  };

  const updateMedication = (medicationId: string, field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      liste_medicaments: prev.liste_medicaments.map(med =>
        med.id === medicationId ? { ...med, [field]: value } : med
      )
    }));
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);
  const selectedProfessional = professionals.find(p => p.id === formData.professionnel_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>{prescription ? 'Modifier l\'ordonnance' : 'Nouvelle ordonnance'}</span>
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
                <strong>Ordonnance basée sur la consultation :</strong> {selectedConsultation.diagnostic} - 
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

          {/* Liste des médicaments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                <Pill className="h-4 w-4" />
                <span>Médicaments prescrits *</span>
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un médicament</span>
              </button>
            </div>

            {formData.liste_medicaments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun médicament ajouté</p>
                <button
                  type="button"
                  onClick={addMedication}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ajouter le premier médicament
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.liste_medicaments.map((medication, index) => (
                  <div key={medication.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Médicament {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeMedication(medication.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                        <input
                          type="text"
                          value={medication.nom}
                          onChange={(e) => updateMedication(medication.id, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Doliprane"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 500mg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence *</label>
                        <input
                          type="text"
                          value={medication.frequence}
                          onChange={(e) => updateMedication(medication.id, 'frequence', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 3 fois par jour"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durée *</label>
                        <input
                          type="text"
                          value={medication.duree}
                          onChange={(e) => updateMedication(medication.id, 'duree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: 7 jours"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions particulières</label>
                      <input
                        type="text"
                        value={medication.instructions || ''}
                        onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: À prendre après les repas"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.liste_medicaments && <p className="text-red-500 text-sm mt-1">{errors.liste_medicaments as string}</p>}
          </div>

          {/* Instructions générales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Instructions générales</span>
            </label>
            <textarea
              value={formData.instructions_generales}
              onChange={(e) => handleInputChange('instructions_generales', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Instructions générales, recommandations, précautions..."
            />
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature *
            </label>
            <input
              type="text"
              value={formData.signature}
              onChange={(e) => handleInputChange('signature', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.signature ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom et titre du prescripteur"
            />
            {errors.signature && <p className="text-red-500 text-sm mt-1">{errors.signature}</p>}
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
              <span>{prescription ? 'Mettre à jour' : 'Créer l\'ordonnance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};