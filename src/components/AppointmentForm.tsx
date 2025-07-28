import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Clock, User, Users, FileText, AlertCircle, Plus } from 'lucide-react';
import { Appointment, AppointmentFormData } from '../types/appointment';
import { Patient } from '../types/patient';
import { User as UserType } from '../types/user';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  patients: Patient[];
  professionals: UserType[];
  onSave: (appointmentData: AppointmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isTimeSlotAvailable: (professionnelId: string, date: string, heure: string, duree: number, excludeId?: string) => boolean;
  onCreateNewPatient?: (patientData: any) => Promise<Patient>;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointment,
  patients,
  professionals,
  onSave,
  onCancel,
  isLoading = false,
  isTimeSlotAvailable,
  onCreateNewPatient
}) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: '',
    professionnel_id: '',
    date_du_rendez_vous: '',
    heure_du_rendez_vous: '',
    duree: 30,
    motif: '',
    statut: 'Confirmé',
    note: ''
  });

  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});
  const [timeSlotError, setTimeSlotError] = useState<string>('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    nom: '',
    prenom: '',
    sexe: 'Homme' as 'Homme' | 'Femme',
    date_de_naissance: '',
    telephone: '',
    adresse: '',
    groupe_sanguin: 'A+' as any,
    antecedents_medicaux: ''
  });
  const [newPatientErrors, setNewPatientErrors] = useState<any>({});

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id,
        professionnel_id: appointment.professionnel_id,
        date_du_rendez_vous: appointment.date_du_rendez_vous,
        heure_du_rendez_vous: appointment.heure_du_rendez_vous,
        duree: appointment.duree,
        motif: appointment.motif,
        statut: appointment.statut,
        note: appointment.note || ''
      });
    } else {
      // Définir la date par défaut à aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date_du_rendez_vous: today }));
    }
  }, [appointment]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentFormData> = {};
    setTimeSlotError('');

    if (!formData.patient_id) newErrors.patient_id = 'Veuillez sélectionner un patient';
    if (!formData.professionnel_id) newErrors.professionnel_id = 'Veuillez sélectionner un professionnel';
    if (!formData.date_du_rendez_vous) newErrors.date_du_rendez_vous = 'La date est requise';
    if (!formData.heure_du_rendez_vous) newErrors.heure_du_rendez_vous = 'L\'heure est requise';
    if (!formData.motif.trim()) newErrors.motif = 'Le motif est requis';
    if (formData.duree < 5 || formData.duree > 240) newErrors.duree = 'La durée doit être entre 5 et 240 minutes';

    // Validation de la date (ne doit pas être dans le passé pour les nouveaux RDV)
    if (formData.date_du_rendez_vous && !appointment) {
      const appointmentDate = new Date(formData.date_du_rendez_vous);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        newErrors.date_du_rendez_vous = 'La date ne peut pas être dans le passé';
      }
    }

    // Vérification de la disponibilité du créneau
    if (formData.professionnel_id && formData.date_du_rendez_vous && formData.heure_du_rendez_vous && formData.duree) {
      const isAvailable = isTimeSlotAvailable(
        formData.professionnel_id,
        formData.date_du_rendez_vous,
        formData.heure_du_rendez_vous,
        formData.duree,
        appointment?.id
      );
      
      if (!isAvailable) {
        setTimeSlotError('Ce créneau horaire n\'est pas disponible pour ce professionnel');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !timeSlotError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (timeSlotError) {
      setTimeSlotError('');
    }
  };

  const validateNewPatient = (): boolean => {
    const errors: any = {};
    if (!newPatientData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!newPatientData.prenom.trim()) errors.prenom = 'Le prénom est requis';
    if (!newPatientData.date_de_naissance) errors.date_de_naissance = 'La date de naissance est requise';
    if (!newPatientData.telephone.trim()) errors.telephone = 'Le téléphone est requis';
    if (!newPatientData.adresse.trim()) errors.adresse = 'L\'adresse est requise';
    
    setNewPatientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewPatient = async () => {
    if (!validateNewPatient() || !onCreateNewPatient) return;
    
    try {
      const newPatient = await onCreateNewPatient(newPatientData);
      setFormData(prev => ({ ...prev, patient_id: newPatient.id }));
      setShowNewPatientForm(false);
      setNewPatientData({
        nom: '',
        prenom: '',
        sexe: 'Homme',
        date_de_naissance: '',
        telephone: '',
        adresse: '',
        groupe_sanguin: 'A+',
        antecedents_medicaux: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
    }
  };

  const dureeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 heure' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2 heures' }
  ];

  const statutOptions = [
    { value: 'Confirmé', label: 'Confirmé', color: 'text-green-600' },
    { value: 'Terminé', label: 'Terminé', color: 'text-blue-600' },
    { value: 'Annulé', label: 'Annulé', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span>{appointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</span>
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
          {/* Sélection patient et professionnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Patient *</span>
                </label>
                {onCreateNewPatient && (
                  <button
                    type="button"
                    onClick={() => setShowNewPatientForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Nouveau patient</span>
                  </button>
                )}
              </div>
              <select
                value={formData.patient_id}
                onChange={(e) => handleInputChange('patient_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.patient_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.prenom} {patient.nom} - {patient.numero_dossier}
                  </option>
                ))}
              </select>
              {errors.patient_id && <p className="text-red-500 text-sm mt-1">{errors.patient_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Professionnel *</span>
              </label>
              <select
                value={formData.professionnel_id}
                onChange={(e) => handleInputChange('professionnel_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.professionnel_id ? 'border-red-500' : 'border-gray-300'
                }`}
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

          {/* Formulaire nouveau patient */}
          {showNewPatientForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-900">Nouveau patient</h3>
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(false)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newPatientData.nom}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, nom: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      newPatientErrors.nom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nom de famille"
                  />
                  {newPatientErrors.nom && <p className="text-red-500 text-xs mt-1">{newPatientErrors.nom}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={newPatientData.prenom}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, prenom: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      newPatientErrors.prenom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Prénom"
                  />
                  {newPatientErrors.prenom && <p className="text-red-500 text-xs mt-1">{newPatientErrors.prenom}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                  <select
                    value={newPatientData.sexe}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, sexe: e.target.value as 'Homme' | 'Femme' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    value={newPatientData.date_de_naissance}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, date_de_naissance: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      newPatientErrors.date_de_naissance ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {newPatientErrors.date_de_naissance && <p className="text-red-500 text-xs mt-1">{newPatientErrors.date_de_naissance}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    value={newPatientData.telephone}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, telephone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      newPatientErrors.telephone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="01 23 45 67 89"
                  />
                  {newPatientErrors.telephone && <p className="text-red-500 text-xs mt-1">{newPatientErrors.telephone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groupe sanguin</label>
                  <select
                    value={newPatientData.groupe_sanguin}
                    onChange={(e) => setNewPatientData(prev => ({ ...prev, groupe_sanguin: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(groupe => (
                      <option key={groupe} value={groupe}>{groupe}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <textarea
                  value={newPatientData.adresse}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, adresse: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    newPatientErrors.adresse ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Adresse complète"
                />
                {newPatientErrors.adresse && <p className="text-red-500 text-xs mt-1">{newPatientErrors.adresse}</p>}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Antécédents médicaux</label>
                <textarea
                  value={newPatientData.antecedents_medicaux}
                  onChange={(e) => setNewPatientData(prev => ({ ...prev, antecedents_medicaux: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Allergies, maladies chroniques..."
                />
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewPatient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer et sélectionner
                </button>
              </div>
            </div>
          )}

          {/* Date et heure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={formData.date_du_rendez_vous}
                onChange={(e) => handleInputChange('date_du_rendez_vous', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.date_du_rendez_vous ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date_du_rendez_vous && <p className="text-red-500 text-sm mt-1">{errors.date_du_rendez_vous}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Heure *</span>
              </label>
              <input
                type="time"
                value={formData.heure_du_rendez_vous}
                onChange={(e) => handleInputChange('heure_du_rendez_vous', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.heure_du_rendez_vous ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.heure_du_rendez_vous && <p className="text-red-500 text-sm mt-1">{errors.heure_du_rendez_vous}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée *
              </label>
              <select
                value={formData.duree}
                onChange={(e) => handleInputChange('duree', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.duree ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {dureeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.duree && <p className="text-red-500 text-sm mt-1">{errors.duree}</p>}
            </div>
          </div>

          {/* Alerte de conflit de créneau */}
          {timeSlotError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{timeSlotError}</span>
            </div>
          )}

          {/* Motif et statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif *
              </label>
              <input
                type="text"
                value={formData.motif}
                onChange={(e) => handleInputChange('motif', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.motif ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Consultation, contrôle, examen..."
              />
              {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => handleInputChange('statut', e.target.value as 'Confirmé' | 'Terminé' | 'Annulé')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {statutOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Note (optionnelle)</span>
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Informations complémentaires..."
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
              disabled={isLoading || !!timeSlotError}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{appointment ? 'Mettre à jour' : 'Enregistrer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};