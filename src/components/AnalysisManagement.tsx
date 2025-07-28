import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, ArrowLeft } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { AnalysisList } from './AnalysisList';
import { AnalysisForm } from './AnalysisForm';
import { AnalysisDetail } from './AnalysisDetail';
import { AnalysisWithDetails, AnalysisFormData } from '../types/analysis';
import { AnalysisService } from '../services/analysisService';
import { PatientService } from '../services/patientService';
import { AuthService } from '../services/auth';
import { ConsultationService } from '../services/consultationService';
import { User } from '../types/user';
import { Patient } from '../types/patient';
import { ConsultationWithDetails } from '../types/consultation';

interface AnalysisManagementProps {
  user: User;
  onBackToDashboard?: () => void;
  selectedConsultation?: ConsultationWithDetails | null;
}

export const AnalysisManagement: React.FC<AnalysisManagementProps> = ({ 
  user, 
  onBackToDashboard,
  selectedConsultation 
}) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [analyses, setAnalyses] = useState<AnalysisWithDetails[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [consultations, setConsultations] = useState<ConsultationWithDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<AnalysisWithDetails | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<AnalysisWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const analysisService = AnalysisService.getInstance();
  const patientService = PatientService.getInstance();
  const authService = AuthService.getInstance();
  const consultationService = ConsultationService.getInstance();

  // Vérifier les autorisations
  const hasAccess = ['médecin', 'infirmière', 'spécialiste'].includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      loadData();
      if (selectedConsultation) {
        setShowForm(true);
      }
    }
  }, [hasAccess, selectedConsultation]);

  const loadData = () => {
    // Charger les analyses
    const allAnalyses = analysisService.getAnalysesWithDetails();
    setAnalyses(allAnalyses);
    setFilteredAnalyses(allAnalyses);

    // Charger les patients
    const allPatients = patientService.getAllPatients();
    setPatients(allPatients);

    // Charger les professionnels
    const allUsers = authService.getAllUsers();
    const medicalProfessionals = allUsers.filter(u => 
      ['médecin', 'infirmière', 'spécialiste'].includes(u.role)
    );
    setProfessionals(medicalProfessionals);

    // Charger les consultations
    const allConsultations = consultationService.getConsultationsWithDetails();
    setConsultations(allConsultations);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddAnalysis = () => {
    setEditingAnalysis(null);
    setShowForm(true);
  };

  const handleEditAnalysis = (analysis: AnalysisWithDetails) => {
    setEditingAnalysis(analysis);
    setViewingAnalysis(null);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleViewAnalysis = (analysis: AnalysisWithDetails) => {
    setViewingAnalysis(analysis);
    setShowDetail(true);
  };

  const handleSaveAnalysis = async (analysisData: AnalysisFormData) => {
    setIsLoading(true);
    try {
      if (editingAnalysis) {
        const updatedAnalysis = analysisService.updateAnalysis(editingAnalysis.id, analysisData);
        if (updatedAnalysis) {
          loadData();
          showNotification('success', 'Bulletin d\'analyses mis à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour du bulletin');
        }
      } else if (selectedConsultation) {
        // Créer une analyse à partir d'une consultation
        const newAnalysis = analysisService.createAnalysisFromConsultation(
          selectedConsultation.id,
          {
            type_analyse: analysisData.type_analyse,
            resultats: analysisData.resultats,
            conclusion: analysisData.conclusion
          }
        );
        if (newAnalysis) {
          loadData();
          showNotification('success', 'Bulletin d\'analyses créé avec succès à partir de la consultation');
        }
      } else {
        const newAnalysis = analysisService.addAnalysis(analysisData);
        loadData();
        showNotification('success', 'Bulletin d\'analyses créé avec succès');
      }
      setShowForm(false);
      setEditingAnalysis(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnalysis = (analysisId: string) => {
    const success = analysisService.deleteAnalysis(analysisId);
    if (success) {
      loadData();
      showNotification('success', 'Bulletin d\'analyses supprimé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression du bulletin');
    }
  };

  const handleDownloadPDF = (analysisId: string) => {
    const pdfUrl = analysisService.generatePDF(analysisId);
    if (pdfUrl) {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `bulletin_analyses_${analysisId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('success', 'Bulletin téléchargé avec succès');
    } else {
      showNotification('error', 'Erreur lors de la génération du PDF');
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredAnalyses(analyses);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = analyses.filter(analysis =>
      analysis.patient_nom.toLowerCase().includes(searchTerm) ||
      analysis.patient_prenom.toLowerCase().includes(searchTerm) ||
      analysis.professionnel_nom.toLowerCase().includes(searchTerm) ||
      analysis.professionnel_prenom.toLowerCase().includes(searchTerm) ||
      analysis.type_analyse.toLowerCase().includes(searchTerm)
    );
    setFilteredAnalyses(filtered);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingAnalysis(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setViewingAnalysis(null);
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
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion des analyses.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins, infirmières et spécialistes peuvent accéder à cette section.
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
            <div className="bg-orange-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <BarChart3 className="h-8 w-8 text-orange-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulletins d'Analyses</h1>
             <p className="text-gray-600">Gérez les résultats d'analyses médicales de {clinicInfo?.nom || 'la structure'}</p>
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
        <AnalysisList
          analyses={filteredAnalyses}
          onAddAnalysis={handleAddAnalysis}
          onEditAnalysis={handleEditAnalysis}
          onDeleteAnalysis={handleDeleteAnalysis}
          onViewAnalysis={handleViewAnalysis}
          onDownloadPDF={handleDownloadPDF}
          onSearch={handleSearch}
        />
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <AnalysisForm
          analysis={editingAnalysis}
          patients={patients}
          professionals={professionals}
          consultations={consultations}
          selectedConsultation={selectedConsultation}
          onSave={handleSaveAnalysis}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}

      {/* Détail modal */}
      {showDetail && viewingAnalysis && (
        <AnalysisDetail
          analysis={viewingAnalysis}
          onClose={handleCloseDetail}
          onEdit={handleEditAnalysis}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};