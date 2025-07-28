import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { PatientList } from './PatientList';
import { PatientForm } from './PatientForm';
import { PatientHistory } from './PatientHistory';
import { ConsultationForm } from './ConsultationForm';
import { ConsultationDetail } from './ConsultationDetail';
import { PrintableConsultation } from './PrintableConsultation';
import { PrescriptionManagement } from './PrescriptionManagement';
import { Patient, PatientFormData } from '../types/patient';
import { PatientService } from '../services/patientService';
import { ConsultationService } from '../services/consultationService';
import { AuthService } from '../services/auth';
import { ConsultationWithDetails, ConsultationFormData } from '../types/consultation';
import { User } from '../types/user';

interface PatientManagementProps {
  user: User;
  onBackToDashboard?: () => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({ user, onBackToDashboard }) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showConsultationDetail, setShowConsultationDetail] = useState(false);
  const [showPrintableConsultation, setShowPrintableConsultation] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedConsultationForPrescription, setSelectedConsultationForPrescription] = useState<ConsultationWithDetails | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<ConsultationWithDetails | null>(null);
  const [viewingConsultation, setViewingConsultation] = useState<ConsultationWithDetails | null>(null);
  const [printingConsultation, setPrintingConsultation] = useState<ConsultationWithDetails | null>(null);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const patientService = PatientService.getInstance();
  const consultationService = ConsultationService.getInstance();
  const authService = AuthService.getInstance();

  // Vérifier les autorisations
  const hasAccess = ['médecin', 'infirmière', 'spécialiste'].includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      loadPatients();
      loadProfessionals();
    }
  }, [hasAccess]);

  const loadPatients = () => {
    const allPatients = patientService.getAllPatients();
    setPatients(allPatients);
    setFilteredPatients(allPatients);
  };

  const loadProfessionals = () => {
    const allUsers = authService.getAllUsers();
    const medicalProfessionals = allUsers.filter(u => 
      ['médecin', 'infirmière', 'spécialiste'].includes(u.role)
    );
    setProfessionals(medicalProfessionals);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleViewHistory = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowHistory(true);
  };

  const handleEditConsultation = (consultation: ConsultationWithDetails) => {
    setEditingConsultation(consultation);
    setViewingConsultation(null);
    setShowConsultationDetail(false);
    setShowConsultationForm(true);
  };

  const handleViewConsultation = (consultation: ConsultationWithDetails) => {
    setViewingConsultation(consultation);
    setShowConsultationDetail(true);
  };

  const handlePrintConsultation = (consultation: ConsultationWithDetails) => {
    setPrintingConsultation(consultation);
    setShowPrintableConsultation(true);
  };

  const handleSaveConsultation = async (consultationData: ConsultationFormData) => {
    setIsLoading(true);
    try {
      if (editingConsultation) {
        const updatedConsultation = consultationService.updateConsultation(editingConsultation.id, consultationData);
        if (updatedConsultation) {
          showNotification('success', 'Consultation mise à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour de la consultation');
        }
      } else {
        const newConsultation = consultationService.addConsultation(consultationData);
        showNotification('success', 'Consultation enregistrée avec succès');
      }
      setShowConsultationForm(false);
      setEditingConsultation(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePatient = async (patientData: PatientFormData) => {
    setIsLoading(true);
    try {
      if (editingPatient) {
        const updatedPatient = patientService.updatePatient(editingPatient.id, patientData);
        if (updatedPatient) {
          loadPatients();
          showNotification('success', 'Patient mis à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour du patient');
        }
      } else {
        const newPatient = patientService.addPatient(patientData);
        loadPatients();
        showNotification('success', `Patient ${newPatient.prenom} ${newPatient.nom} ajouté avec succès`);
      }
      setShowForm(false);
      setEditingPatient(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    const success = patientService.deletePatient(patientId);
    if (success) {
      loadPatients();
      showNotification('success', 'Patient supprimé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression du patient');
    }
  };

  const handleSearch = (query: string) => {
    const searchResults = patientService.searchPatients(query);
    setFilteredPatients(searchResults);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedPatient(null);
  };

  const handleCancelConsultationForm = () => {
    setShowConsultationForm(false);
    setEditingConsultation(null);
  };

  const handleCloseConsultationDetail = () => {
    setShowConsultationDetail(false);
    setViewingConsultation(null);
  };

  const handleClosePrintableConsultation = () => {
    setShowPrintableConsultation(false);
    setPrintingConsultation(null);
  };

  const handleCreatePrescription = (consultation: ConsultationWithDetails) => {
    setSelectedConsultationForPrescription(consultation);
    setShowPrescriptionForm(true);
  };

  const handleBackFromPrescription = () => {
    setShowPrescriptionForm(false);
    setSelectedConsultationForPrescription(null);
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
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des patients.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins, infirmières et spécialistes peuvent accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  if (showPrescriptionForm) {
    return (
      <PrescriptionManagement
        user={user}
        onBackToDashboard={handleBackFromPrescription}
        selectedConsultation={selectedConsultationForPrescription}
      />
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
            <div className="bg-blue-100 p-3 rounded-lg">
              {clinicInfo?.logo ? (
                <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <Users className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Patients</h1>
              <p className="text-gray-600">Gérez les dossiers patients de {clinicInfo?.nom || 'la structure médicale'}</p>
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
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientList
          patients={filteredPatients}
          onAddPatient={handleAddPatient}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
          onViewHistory={handleViewHistory}
          onSearch={handleSearch}
        />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSavePatient}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {/* Historique patient modal */}
      {showHistory && selectedPatient && (
        <PatientHistory
          patient={selectedPatient}
          onClose={handleCloseHistory}
          onEditConsultation={handleEditConsultation}
          onViewConsultation={handleViewConsultation}
          onCreatePrescription={handleCreatePrescription}
        />
      )}

      {/* Formulaire consultation modal */}
      {showConsultationForm && (
        <ConsultationForm
          consultation={editingConsultation}
          patients={patients}
          professionals={professionals}
          onSave={handleSaveConsultation}
          onCancel={handleCancelConsultationForm}
          isLoading={isLoading}
        />
      )}

      {/* Détail consultation modal */}
      {showConsultationDetail && viewingConsultation && (
        <ConsultationDetail
          consultation={viewingConsultation}
          onClose={handleCloseConsultationDetail}
          onEdit={handleEditConsultation}
         onCreatePrescription={handleCreatePrescription}
        />
      )}

      {/* Document imprimable consultation */}
      {showPrintableConsultation && printingConsultation && (
        <PrintableConsultation
          consultation={printingConsultation}
          onClose={handleClosePrintableConsultation}
        />
      )}
    </div>
  );
};