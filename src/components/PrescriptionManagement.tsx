import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { PrescriptionList } from './PrescriptionList';
import { PrescriptionForm } from './PrescriptionForm';
import { PrescriptionDetail } from './PrescriptionDetail';
import { PrescriptionWithDetails, PrescriptionFormData } from '../types/prescription';
import { PrescriptionService } from '../services/prescriptionService';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/auth';
import { ConsultationService } from '../services/consultationService';
import { User } from '../types/user';
import { Patient } from '../types/patient';
import { ConsultationWithDetails } from '../types/consultation';

interface PrescriptionManagementProps {
  user: User;
  onBackToDashboard?: () => void;
  selectedConsultation?: ConsultationWithDetails | null;
}

export const PrescriptionManagement: React.FC<PrescriptionManagementProps> = ({ 
  user, 
  onBackToDashboard,
  selectedConsultation 
}) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<PrescriptionWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<ConsultationWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<PrescriptionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const prescriptionService = PrescriptionService.getInstance();
  const patientService = PatientService.getInstance();
  const authService = AuthService.getInstance();
  const consultationService = ConsultationService.getInstance();

  // Vérifier les autorisations - seuls les médecins et spécialistes peuvent prescrire
  const hasAccess = ['médecin', 'spécialiste'].includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      loadData();
      if (selectedConsultation) {
        setShowForm(true);
      }
    }
  }, [hasAccess, selectedConsultation]);

  const loadData = () => {
    // Charger les ordonnances
    const allPrescriptions = prescriptionService.getPrescriptionsWithDetails();
    setPrescriptions(allPrescriptions);
    setFilteredPrescriptions(allPrescriptions);

    // Charger les patients
    const allPatients = patientService.getAllPatients();
    setPatients(allPatients);

    // Charger les professionnels (médecins et spécialistes uniquement)
    const allUsers = authService.getAllUsers();
    const prescribers = allUsers.filter(u => ['médecin', 'spécialiste'].includes(u.role));
    setProfessionals(prescribers);

    // Charger les consultations
    const allConsultations = consultationService.getConsultationsWithDetails();
    setConsultations(allConsultations);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddPrescription = () => {
    setEditingPrescription(null);
    setShowForm(true);
  };

  const handleEditPrescription = (prescription: PrescriptionWithDetails) => {
    setEditingPrescription(prescription);
    setViewingPrescription(null);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleViewPrescription = (prescription: PrescriptionWithDetails) => {
    setViewingPrescription(prescription);
    setShowDetail(true);
  };

  const handleSavePrescription = async (prescriptionData: PrescriptionFormData) => {
    setIsLoading(true);
    try {
      if (editingPrescription) {
        const updatedPrescription = prescriptionService.updatePrescription(editingPrescription.id, prescriptionData);
        if (updatedPrescription) {
          loadData();
          showNotification('success', 'Ordonnance mise à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour de l\'ordonnance');
        }
      } else if (selectedConsultation) {
        // Créer une ordonnance à partir d'une consultation
        const newPrescription = prescriptionService.createPrescriptionFromConsultation(
          selectedConsultation.id,
          {
            liste_medicaments: prescriptionData.liste_medicaments,
            instructions_generales: prescriptionData.instructions_generales,
            signature: prescriptionData.signature
          }
        );
        if (newPrescription) {
          loadData();
          showNotification('success', 'Ordonnance créée avec succès à partir de la consultation');
        }
      } else {
        const newPrescription = prescriptionService.addPrescription(prescriptionData);
        loadData();
        showNotification('success', 'Ordonnance créée avec succès');
      }
      setShowForm(false);
      setEditingPrescription(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    const success = prescriptionService.deletePrescription(prescriptionId);
    if (success) {
      loadData();
      showNotification('success', 'Ordonnance supprimée avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression de l\'ordonnance');
    }
  };

  const handleDownloadPDF = (prescriptionId: string) => {
    const pdfUrl = prescriptionService.generatePDF(prescriptionId);
    if (pdfUrl) {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `ordonnance_${prescriptionId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('success', 'Ordonnance téléchargée avec succès');
    } else {
      showNotification('error', 'Erreur lors de la génération du PDF');
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPrescriptions(prescriptions);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = prescriptions.filter(prescription =>
      prescription.patient_nom.toLowerCase().includes(searchTerm) ||
      prescription.patient_prenom.toLowerCase().includes(searchTerm) ||
      prescription.professionnel_nom.toLowerCase().includes(searchTerm) ||
      prescription.professionnel_prenom.toLowerCase().includes(searchTerm) ||
      prescription.liste_medicaments.some(med => 
        med.nom.toLowerCase().includes(searchTerm)
      )
    );
    setFilteredPrescriptions(filtered);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPrescription(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setViewingPrescription(null);
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
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des ordonnances.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins et spécialistes peuvent prescrire des ordonnances.
          </p>
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
            <div className="bg-blue-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <FileText className="h-8 w-8 text-blue-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Ordonnances</h1>
             <p className="text-gray-600">Créez et gérez les prescriptions médicales de {clinicInfo?.nom || 'la structure'}</p>
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
        <PrescriptionList
          prescriptions={filteredPrescriptions}
          onAddPrescription={handleAddPrescription}
          onEditPrescription={handleEditPrescription}
          onDeletePrescription={handleDeletePrescription}
          onViewPrescription={handleViewPrescription}
          onDownloadPDF={handleDownloadPDF}
          onSearch={handleSearch}
        />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <PrescriptionForm
          prescription={editingPrescription}
          patients={patients}
          professionals={professionals}
          consultations={consultations}
          selectedConsultation={selectedConsultation}
          onSave={handleSavePrescription}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {/* Détail modal */}
      {showDetail && viewingPrescription && (
        <PrescriptionDetail
          prescription={viewingPrescription}
          onClose={handleCloseDetail}
          onEdit={handleEditPrescription}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};