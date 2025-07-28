import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { AppointmentList } from './AppointmentList';
import { AppointmentForm } from './AppointmentForm';
import { ConsultationManagement } from './ConsultationManagement';
import { AppointmentWithDetails, AppointmentFormData, AppointmentFilter } from '../types/appointment';
import { AppointmentService } from '../services/appointmentService';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/auth';
import { User } from '../types/user';
import { Patient } from '../types/patient';

interface AppointmentManagementProps {
  user: User;
  onBackToDashboard?: () => void;
}

export const AppointmentManagement: React.FC<AppointmentManagementProps> = ({ user, onBackToDashboard }) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [selectedAppointmentForConsultation, setSelectedAppointmentForConsultation] = useState<AppointmentWithDetails | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<AppointmentFilter>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const appointmentService = AppointmentService.getInstance();
  const patientService = PatientService.getInstance();
  const authService = AuthService.getInstance();

  // Vérifier les autorisations
  const hasAccess = ['médecin', 'infirmière', 'spécialiste'].includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  const loadData = () => {
    // Charger les rendez-vous
    const allAppointments = appointmentService.getAppointmentsWithDetails();
    setAppointments(allAppointments);
    applyFilter('all', allAppointments);

    // Charger les patients
    const allPatients = patientService.getAllPatients();
    setPatients(allPatients);

    // Charger les professionnels (médecins, infirmières, spécialistes)
    const allUsers = authService.getAllUsers();
    const medicalProfessionals = allUsers.filter(u => 
      ['médecin', 'infirmière', 'spécialiste'].includes(u.role)
    );
    setProfessionals(medicalProfessionals);
  };

  const applyFilter = (filter: AppointmentFilter, appointmentsList?: AppointmentWithDetails[]) => {
    const appointmentsToFilter = appointmentsList || appointments;
    let filtered: AppointmentWithDetails[] = [];

    switch (filter) {
      case 'today':
        filtered = appointmentService.getTodayAppointments();
        break;
      case 'week':
        filtered = appointmentService.getWeekAppointments();
        break;
      case 'month':
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filtered = appointmentService.getAppointmentsByDateRange(
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        );
        break;
      default:
        filtered = appointmentsToFilter;
    }

    setFilteredAppointments(filtered);
    setCurrentFilter(filter);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleSaveAppointment = async (appointmentData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      if (editingAppointment) {
        const updatedAppointment = appointmentService.updateAppointment(editingAppointment.id, appointmentData);
        if (updatedAppointment) {
          loadData();
          showNotification('success', 'Rendez-vous mis à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour du rendez-vous');
        }
      } else {
        const newAppointment = appointmentService.addAppointment(appointmentData);
        loadData();
        showNotification('success', 'Rendez-vous planifié avec succès');
      }
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewPatient = async (patientData: any): Promise<Patient> => {
    const newPatient = patientService.addPatient(patientData);
    loadData(); // Recharger pour inclure le nouveau patient
    return newPatient;
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    const success = appointmentService.deleteAppointment(appointmentId);
    if (success) {
      loadData();
      showNotification('success', 'Rendez-vous supprimé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression du rendez-vous');
    }
  };

  const handleUpdateStatus = (appointmentId: string, status: 'Confirmé' | 'Terminé' | 'Annulé') => {
    const success = appointmentService.updateAppointmentStatus(appointmentId, status);
    if (success) {
      loadData();
      showNotification('success', `Rendez-vous marqué comme ${status.toLowerCase()}`);
    } else {
      showNotification('error', 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleCreateConsultation = (appointment: AppointmentWithDetails) => {
    setSelectedAppointmentForConsultation(appointment);
    setShowConsultationForm(true);
  };

  const handleSearch = (query: string) => {
    const searchResults = appointmentService.searchAppointments(query);
    setFilteredAppointments(searchResults);
  };

  const handleFilterChange = (filter: AppointmentFilter) => {
    applyFilter(filter);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAppointment(null);
  };

  const isTimeSlotAvailable = (professionnelId: string, date: string, heure: string, duree: number, excludeId?: string) => {
    return appointmentService.isTimeSlotAvailable(professionnelId, date, heure, duree, excludeId);
  };

  const handleBackFromConsultation = () => {
    setShowConsultationForm(false);
    setSelectedAppointmentForConsultation(null);
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
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des rendez-vous.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins, infirmières et spécialistes peuvent accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  if (showConsultationForm) {
    return (
      <ConsultationManagement
        user={user}
        onBackToDashboard={handleBackFromConsultation}
        selectedAppointment={selectedAppointmentForConsultation}
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
                <Calendar className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</h1>
              <p className="text-gray-600">Planifiez et gérez les rendez-vous de {clinicInfo?.nom || 'la structure médicale'}</p>
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
        <AppointmentList
          appointments={filteredAppointments}
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={handleDeleteAppointment}
          onUpdateStatus={handleUpdateStatus}
          onCreateConsultation={handleCreateConsultation}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          currentFilter={currentFilter}
        />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          professionals={professionals}
          onSave={handleSaveAppointment}
          onCancel={handleCancelForm}
          isLoading={isLoading}
          isTimeSlotAvailable={isTimeSlotAvailable}
          onCreateNewPatient={handleCreateNewPatient}
        />
      )}
    </div>
  );
};