import React, { useState, useEffect } from 'react';
import { Stethoscope, AlertCircle, ArrowLeft } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { ConsultationList } from './ConsultationList';
import { ConsultationForm } from './ConsultationForm';
import { ConsultationDetail } from './ConsultationDetail';
import { PrescriptionManagement } from './PrescriptionManagement';
import { ConsultationWithDetails, ConsultationFormData, ConsultationFilter } from '../types/consultation';
import { ConsultationService } from '../services/consultationService';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/auth';
import { AppointmentService } from '../services/appointmentService';
import { User } from '../types/user';
import { Patient } from '../types/patient';
import { AppointmentWithDetails } from '../types/appointment';

interface ConsultationManagementProps {
  user: User;
  onBackToDashboard?: () => void;
  selectedAppointment?: AppointmentWithDetails | null;
}

export const ConsultationManagement: React.FC<ConsultationManagementProps> = ({ 
  user, 
  onBackToDashboard,
  selectedAppointment 
}) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [consultations, setConsultations] = useState<ConsultationWithDetails[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showPrintableConsultation, setShowPrintableConsultation] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedConsultationForPrescription, setSelectedConsultationForPrescription] = useState<ConsultationWithDetails | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<ConsultationWithDetails | null>(null);
  const [viewingConsultation, setViewingConsultation] = useState<ConsultationWithDetails | null>(null);
  const [printingConsultation, setPrintingConsultation] = useState<ConsultationWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<ConsultationFilter>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const consultationService = ConsultationService.getInstance();
  const patientService = PatientService.getInstance();
  const authService = AuthService.getInstance();
  const appointmentService = AppointmentService.getInstance();

  // Vérifier les autorisations
  const hasAccess = ['médecin', 'infirmière', 'spécialiste'].includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      loadData();
      if (selectedAppointment) {
        setShowForm(true);
      }
    }
  }, [hasAccess, selectedAppointment]);

  const loadData = () => {
    // Charger les consultations
    const allConsultations = consultationService.getConsultationsWithDetails();
    setConsultations(allConsultations);
    applyFilter('all', allConsultations);

    // Charger les patients
    const allPatients = patientService.getAllPatients();
    setPatients(allPatients);

    // Charger les professionnels
    const allUsers = authService.getAllUsers();
    const medicalProfessionals = allUsers.filter(u => 
      ['médecin', 'infirmière', 'spécialiste'].includes(u.role)
    );
    setProfessionals(medicalProfessionals);

    // Charger les rendez-vous terminés
    const allAppointments = appointmentService.getAppointmentsWithDetails();
    const completedAppointments = allAppointments.filter(a => a.statut === 'Terminé');
    setAppointments(completedAppointments);
  };

  const applyFilter = (filter: ConsultationFilter, consultationsList?: ConsultationWithDetails[]) => {
    const consultationsToFilter = consultationsList || consultations;
    let filtered: ConsultationWithDetails[] = [];

    switch (filter) {
      case 'today':
        filtered = consultationService.getTodayConsultations();
        break;
      case 'week':
        filtered = consultationService.getWeekConsultations();
        break;
      case 'month':
        filtered = consultationService.getMonthConsultations();
        break;
      default:
        filtered = consultationsToFilter;
    }

    setFilteredConsultations(filtered);
    setCurrentFilter(filter);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddConsultation = () => {
    setEditingConsultation(null);
    setShowForm(true);
  };

  const handleEditConsultation = (consultation: ConsultationWithDetails) => {
    setEditingConsultation(consultation);
    setViewingConsultation(null);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleViewConsultation = (consultation: ConsultationWithDetails) => {
    setViewingConsultation(consultation);
    setShowDetail(true);
  };

  const handleSaveConsultation = async (consultationData: ConsultationFormData) => {
    setIsLoading(true);
    try {
      if (editingConsultation) {
        const updatedConsultation = consultationService.updateConsultation(editingConsultation.id, consultationData);
        if (updatedConsultation) {
          loadData();
          showNotification('success', 'Consultation mise à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour de la consultation');
        }
      } else if (selectedAppointment) {
        // Créer une consultation à partir d'un rendez-vous
        const newConsultation = consultationService.createConsultationFromAppointment(
          selectedAppointment.id,
          {
            symptomes: consultationData.symptomes,
            diagnostic: consultationData.diagnostic,
            traitement: consultationData.traitement,
            notes: consultationData.notes
          }
        );
        if (newConsultation) {
          loadData();
          showNotification('success', 'Consultation créée avec succès à partir du rendez-vous');
        }
      } else {
        const newConsultation = consultationService.addConsultation(consultationData);
        loadData();
        showNotification('success', 'Consultation enregistrée avec succès');
      }
      setShowForm(false);
      setEditingConsultation(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConsultation = (consultationId: string) => {
    const success = consultationService.deleteConsultation(consultationId);
    if (success) {
      loadData();
      showNotification('success', 'Consultation supprimée avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression de la consultation');
    }
  };

  const handleSearch = (query: string) => {
    const searchResults = consultationService.searchConsultations(query);
    setFilteredConsultations(searchResults);
  };

  const handleFilterChange = (filter: ConsultationFilter) => {
    applyFilter(filter);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingConsultation(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setViewingConsultation(null);
  };

  const handlePrintConsultation = (consultation: ConsultationWithDetails) => {
    setPrintingConsultation(consultation);
    setShowPrintableConsultation(true);
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
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des consultations.
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
               <Stethoscope className="h-8 w-8 text-blue-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Consultations</h1>
             <p className="text-gray-600">Enregistrez et consultez les dossiers médicaux de {clinicInfo?.nom || 'la structure'}</p>
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
        <ConsultationList
          consultations={filteredConsultations}
          onAddConsultation={handleAddConsultation}
          onEditConsultation={handleEditConsultation}
          onDeleteConsultation={handleDeleteConsultation}
          onViewConsultation={handleViewConsultation}
          onPrintConsultation={handlePrintConsultation}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          currentFilter={currentFilter}
        />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <ConsultationForm
          consultation={editingConsultation}
          patients={patients}
          professionals={professionals}
          appointments={appointments}
          selectedAppointment={selectedAppointment}
          onSave={handleSaveConsultation}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {/* Détail modal */}
      {showDetail && viewingConsultation && (
        <ConsultationDetail
          consultation={viewingConsultation}
          onClose={handleCloseDetail}
          onEdit={handleEditConsultation}
          onCreatePrescription={handleCreatePrescription}
        />
      )}

      {/* Document imprimable */}
      {showPrintableConsultation && printingConsultation && (
        <PrintableConsultation
          consultation={printingConsultation}
          onClose={handleClosePrintableConsultation}
        />
      )}
    </div>
  );
};