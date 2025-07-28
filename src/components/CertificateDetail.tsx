import React from 'react';
import { useState } from 'react';
import { X, User, Calendar, FileText, Users, Award, Download, Edit } from 'lucide-react';
import { CertificateWithDetails } from '../types/certificate';
import { PrintableCertificate } from './PrintableCertificate';

interface CertificateDetailProps {
  certificate: CertificateWithDetails;
  onClose: () => void;
  onEdit: (certificate: CertificateWithDetails) => void;
  onDownloadPDF: (certificateId: string) => void;
}

export const CertificateDetail: React.FC<CertificateDetailProps> = ({
  certificate,
  onClose,
  onEdit,
  onDownloadPDF
}) => {
  const [showPrintableCertificate, setShowPrintableCertificate] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'repos':
        return 'Certificat d\'arrêt de travail';
      case 'aptitude':
        return 'Certificat d\'aptitude';
      case 'grossesse':
        return 'Certificat de grossesse';
      case 'sport':
        return 'Certificat médical sport';
      case 'maladie':
        return 'Certificat de maladie';
      case 'accident':
        return 'Certificat d\'accident';
      default:
        return 'Certificat médical';
    }
  };

  // Vérification des données critiques
  if (!certificate || !certificate.patient_nom || !certificate.patient_prenom) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Données manquantes</h2>
          <p className="text-red-700 mb-6">
            Impossible d'afficher les détails : informations patient manquantes.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Award className="h-6 w-6 text-purple-600" />
              <span>Détails du certificat médical</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDownloadPDF(certificate.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => setShowPrintableCertificate(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Voir PDF</span>
              </button>
              <button
                onClick={() => onEdit(certificate)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Modifier
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Informations générales</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Patient</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {certificate.patient_prenom || 'Prénom non renseigné'} {certificate.patient_nom || 'Nom non renseigné'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Médecin</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {certificate.professionnel_prenom || 'Prénom non renseigné'} {certificate.professionnel_nom || 'Nom non renseigné'}
                </p>
                <p className="text-sm text-gray-600 capitalize">{certificate.professionnel_role || 'Spécialité non renseignée'}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Date d'émission</span>
                </div>
                <p className="text-gray-900">{formatDate(certificate.date_emission)}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Type de certificat</span>
                </div>
                <p className="text-gray-900">{getCertificateTypeLabel(certificate.type_certificat || 'autre')}</p>
              </div>
            </div>

            {certificate.duree_repos && (
              <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">Durée de repos prescrite</h4>
                <p className="text-orange-700 text-lg font-semibold">
                  {certificate.duree_repos} jour{certificate.duree_repos > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Commentaire médical */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Commentaire médical</span>
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{certificate.commentaire || 'Commentaire non renseigné'}</p>
            </div>
          </div>

          {/* Consultation associée */}
          {certificate.consultation_diagnostic && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation associée</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">{certificate.consultation_diagnostic}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => onDownloadPDF(certificate.id)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={() => onEdit(certificate)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier le certificat
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'impression */}
      {showPrintableCertificate && (
        <PrintableCertificate
          certificate={certificate}
          onClose={() => setShowPrintableCertificate(false)}
        />
      )}
    </div>
  );
};