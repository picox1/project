import React, { useState, useEffect } from 'react';
import { Award, AlertCircle, ArrowLeft } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { CertificateList } from './CertificateList';
import { CertificateForm } from './CertificateForm';
import { CertificateDetail } from './CertificateDetail';
import { CertificateWithDetails, CertificateFormData } from '../types/certificate';
import { CertificateService } from '../services/certificateService';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/auth';
import { ConsultationService } from '../services/consultationService';
import { User } from '../types/user';
import { Patient } from '../types/patient';
import { ConsultationWithDetails } from '../types/consultation';

interface CertificateManagementProps {
  user: User;
  onBackToDashboard?: () => void;
  selectedConsultation?: ConsultationWithDetails | null;
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({ 
  user, 
  onBackToDashboard,
  selectedConsultation 
}) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [certificates, setCertificates] = useState<CertificateWithDetails[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<CertificateWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<ConsultationWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<CertificateWithDetails | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<CertificateWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const certificateService = CertificateService.getInstance();
  const patientService = PatientService.getInstance();
  const authService = AuthService.getInstance();
  const consultationService = ConsultationService.getInstance();

  // Vérifier les autorisations - seuls les médecins et spécialistes peuvent créer des certificats
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
    // Charger les certificats
    const allCertificates = certificateService.getCertificatesWithDetails();
    setCertificates(allCertificates);
    setFilteredCertificates(allCertificates);

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

  const handleAddCertificate = () => {
    setEditingCertificate(null);
    setShowForm(true);
  };

  const handleEditCertificate = (certificate: CertificateWithDetails) => {
    setEditingCertificate(certificate);
    setViewingCertificate(null);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleViewCertificate = (certificate: CertificateWithDetails) => {
    setViewingCertificate(certificate);
    setShowDetail(true);
  };

  const handleSaveCertificate = async (certificateData: CertificateFormData) => {
    setIsLoading(true);
    try {
      if (editingCertificate) {
        const updatedCertificate = certificateService.updateCertificate(editingCertificate.id, certificateData);
        if (updatedCertificate) {
          loadData();
          showNotification('success', 'Certificat mis à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour du certificat');
        }
      } else if (selectedConsultation) {
        // Créer un certificat à partir d'une consultation
        const newCertificate = certificateService.createCertificateFromConsultation(
          selectedConsultation.id,
          {
            type_certificat: certificateData.type_certificat,
            duree_repos: certificateData.duree_repos,
            commentaire: certificateData.commentaire
          }
        );
        if (newCertificate) {
          loadData();
          showNotification('success', 'Certificat créé avec succès à partir de la consultation');
        }
      } else {
        const newCertificate = certificateService.addCertificate(certificateData);
        loadData();
        showNotification('success', 'Certificat créé avec succès');
      }
      setShowForm(false);
      setEditingCertificate(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCertificate = (certificateId: string) => {
    const success = certificateService.deleteCertificate(certificateId);
    if (success) {
      loadData();
      showNotification('success', 'Certificat supprimé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression du certificat');
    }
  };

  const handleDownloadPDF = (certificateId: string) => {
    const pdfUrl = certificateService.generatePDF(certificateId);
    if (pdfUrl) {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `certificat_${certificateId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('success', 'Certificat téléchargé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la génération du PDF');
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredCertificates(certificates);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = certificates.filter(certificate =>
      certificate.patient_nom.toLowerCase().includes(searchTerm) ||
      certificate.patient_prenom.toLowerCase().includes(searchTerm) ||
      certificate.professionnel_nom.toLowerCase().includes(searchTerm) ||
      certificate.professionnel_prenom.toLowerCase().includes(searchTerm) ||
      certificate.type_certificat.toLowerCase().includes(searchTerm)
    );
    setFilteredCertificates(filtered);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCertificate(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setViewingCertificate(null);
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
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des certificats.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins et spécialistes peuvent créer des certificats médicaux.
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
            <div className="bg-purple-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <Award className="h-8 w-8 text-purple-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Certificats</h1>
             <p className="text-gray-600">Créez et gérez les certificats médicaux de {clinicInfo?.nom || 'la structure'}</p>
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
        <CertificateList
          certificates={filteredCertificates}
          onAddCertificate={handleAddCertificate}
          onEditCertificate={handleEditCertificate}
          onDeleteCertificate={handleDeleteCertificate}
          onViewCertificate={handleViewCertificate}
          onDownloadPDF={handleDownloadPDF}
          onSearch={handleSearch}
        />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <CertificateForm
          certificate={editingCertificate}
          patients={patients}
          professionals={professionals}
          consultations={consultations}
          selectedConsultation={selectedConsultation}
          onSave={handleSaveCertificate}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {/* Détail modal */}
      {showDetail && viewingCertificate && (
        <CertificateDetail
          certificate={viewingCertificate}
          onClose={handleCloseDetail}
          onEdit={handleEditCertificate}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};