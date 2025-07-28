import React from 'react';
import { Printer, Download } from 'lucide-react';
import { CertificateWithDetails } from '../types/certificate';
import { ClinicService } from '../services/clinicService';

interface PrintableCertificateProps {
  certificate: CertificateWithDetails;
  onClose: () => void;
}

export const PrintableCertificate: React.FC<PrintableCertificateProps> = ({ certificate, onClose }) => {
  const clinicService = ClinicService.getInstance();
  const clinicInfo = clinicService.getClinicInfo();

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generateCertificateNumber = (certificateId: string): string => {
    if (!certificateId) return 'N° non généré';
    const year = new Date().getFullYear();
    const shortId = certificateId.slice(-6).toUpperCase();
    return `CERT${year}-${shortId}`;
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'repos':
        return 'CERTIFICAT D\'ARRÊT DE TRAVAIL';
      case 'aptitude':
        return 'CERTIFICAT D\'APTITUDE';
      case 'grossesse':
        return 'CERTIFICAT DE GROSSESSE';
      case 'sport':
        return 'CERTIFICAT MÉDICAL SPORT';
      case 'maladie':
        return 'CERTIFICAT DE MALADIE';
      case 'accident':
        return 'CERTIFICAT D\'ACCIDENT';
      default:
        return 'CERTIFICAT MÉDICAL';
    }
  };

  // Vérification des données critiques
  const hasRequiredData = () => {
    return certificate && 
           certificate.patient_nom && 
           certificate.patient_prenom && 
           certificate.professionnel_nom &&
           certificate.professionnel_prenom &&
           certificate.commentaire &&
           certificate.date_emission;
  };

  if (!hasRequiredData()) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Document incomplet</h2>
          <p className="text-red-700 mb-6">
            Impossible de générer le certificat : données critiques manquantes.
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
    <div className="fixed inset-0 bg-white z-50">
      {/* Boutons d'action - cachés à l'impression */}
      <div className="print:hidden bg-gray-100 p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold text-gray-900">Aperçu du certificat médical</h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(document.querySelector('.print\\:max-w-none')?.textContent || '')}`;
              link.download = `certificat_${certificate.id || 'document'}.pdf`;
              link.click();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Document imprimable */}
      <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen print:p-6 print:max-w-none">
        {/* En-tête du cabinet */}
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {clinicInfo?.logo ? (
                <img src={clinicInfo.logo} alt="Logo" className="h-16 w-auto object-contain" />
              ) : (
                <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold text-lg">LOGO</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-blue-800 mb-2">
                {clinicInfo?.nom || 'Structure Médicale'}
              </h1>
            </div>
            <div className="flex-1"></div>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Adresse : {clinicInfo?.adresse || 'Adresse non renseignée'}</p>
            <p>Téléphone : {clinicInfo?.telephone || 'Non renseigné'} | Email : {clinicInfo?.email || 'Non renseigné'}</p>
            <p>RC : {clinicInfo?.rccm || 'Non renseigné'} | NINEA : {clinicInfo?.ninea || 'Non renseigné'}</p>
            {clinicInfo?.site_web && <p>Site web : {clinicInfo.site_web}</p>}
            <p className="text-xs mt-2">
              Responsable médical : {clinicInfo?.responsable_medical_prenom || 'Dr.'} {clinicInfo?.responsable_medical_nom || 'Non renseigné'}
            </p>
          </div>
        </div>

        {/* Titre certificat */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getCertificateTypeLabel(certificate.type_certificat)}</h2>
          <div className="text-sm text-gray-600">
            <p>N° Certificat : {generateCertificateNumber(certificate.id)}</p>
            <p>Date : {formatDate(certificate.date_emission)}</p>
          </div>
        </div>

        {/* Informations médecin */}
        <div className="mb-8">
          <div className="text-center">
            <p className="text-lg">
              Je soussigné(e), <strong>Dr. {certificate.professionnel_prenom || 'Prénom non renseigné'} {certificate.professionnel_nom || 'Nom non renseigné'}</strong>,
            </p>
            <p className="text-lg">
              {certificate.professionnel_role || 'Spécialité non renseignée'}, exerçant à {clinicInfo?.nom || 'Structure Médicale'},
            </p>
            <p className="text-lg mt-4">
              certifie avoir examiné ce jour :
            </p>
          </div>
        </div>

        {/* Informations patient */}
        <div className="text-center mb-8 p-6 bg-gray-50 border border-gray-300 rounded">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">PATIENT</h3>
          <div className="space-y-2">
            <p className="text-lg"><strong>Nom :</strong> {certificate.patient_nom || 'Nom non renseigné'}</p>
            <p className="text-lg"><strong>Prénom :</strong> {certificate.patient_prenom || 'Prénom non renseigné'}</p>
          </div>
        </div>

        {/* Contenu du certificat */}
        <div className="mb-8 p-6 border-2 border-gray-400 rounded">
          {certificate.type_certificat === 'repos' && certificate.duree_repos && (
            <div className="text-center mb-6 p-4 bg-orange-50 border border-orange-300 rounded">
              <h3 className="text-xl font-bold text-orange-800 mb-2">DURÉE DE REPOS PRESCRITE</h3>
              <p className="text-2xl font-bold text-orange-900">
                {certificate.duree_repos} jour{certificate.duree_repos > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">COMMENTAIRE MÉDICAL :</h3>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 border border-gray-200 rounded">
              {certificate.commentaire || 'Commentaire non renseigné'}
            </div>
          </div>

          {certificate.consultation_diagnostic && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">DIAGNOSTIC ASSOCIÉ :</h3>
              <p className="text-blue-800">{certificate.consultation_diagnostic}</p>
            </div>
          )}
        </div>

        {/* Conclusion */}
        <div className="text-center mb-8">
          <p className="text-lg">
            Fait pour servir et valoir ce que de droit.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>Date d'émission : {formatDate(certificate.date_emission)}</p>
              <p className="mt-2">{clinicInfo?.nom || 'Structure Médicale'}</p>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-semibold mb-2">
                Dr. {certificate.professionnel_prenom || 'Prénom non renseigné'} {certificate.professionnel_nom || 'Nom non renseigné'}
              </p>
              <p className="text-sm text-gray-600 mb-4">{certificate.professionnel_role || 'Spécialité non renseignée'}</p>
              <div className="border-t border-gray-400 pt-2 mt-8 w-48">
                <p className="text-sm">Signature et cachet</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>Ce certificat est généré électroniquement et fait foi</p>
            <p className="mt-1">Imprimé via Logiciel Dib Digital</p>
          </div>
        </div>
      </div>
    </div>
  );
};