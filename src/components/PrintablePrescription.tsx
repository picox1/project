import React from 'react';
import { Printer, Download } from 'lucide-react';
import { PrescriptionWithDetails } from '../types/prescription';
import { ClinicService } from '../services/clinicService';

interface PrintablePrescriptionProps {
  prescription: PrescriptionWithDetails;
  onClose: () => void;
}

export const PrintablePrescription: React.FC<PrintablePrescriptionProps> = ({ prescription, onClose }) => {
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

  const generatePrescriptionNumber = (prescriptionId: string): string => {
    if (!prescriptionId) return 'N° non généré';
    const year = new Date().getFullYear();
    const shortId = prescriptionId.slice(-6).toUpperCase();
    return `ORD${year}-${shortId}`;
  };

  // Vérification des données critiques
  const hasRequiredData = () => {
    return prescription && 
           prescription.patient_nom && 
           prescription.patient_prenom && 
           prescription.professionnel_nom &&
           prescription.professionnel_prenom &&
           prescription.liste_medicaments &&
           prescription.liste_medicaments.length > 0 &&
           prescription.date_emission;
  };

  if (!hasRequiredData()) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Document incomplet</h2>
          <p className="text-red-700 mb-6">
            Impossible de générer l'ordonnance : données critiques manquantes.
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
        <h2 className="text-lg font-semibold text-gray-900">Aperçu de l'ordonnance</h2>
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
              link.download = `ordonnance_${prescription.id || 'document'}.pdf`;
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

        {/* Titre ordonnance */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ORDONNANCE MÉDICALE</h2>
          <div className="text-sm text-gray-600">
            <p>N° Ordonnance : {generatePrescriptionNumber(prescription.id)}</p>
            <p>Date : {formatDate(prescription.date_emission)}</p>
          </div>
        </div>

        {/* Informations patient et médecin */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              PATIENT
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nom :</strong> {prescription.patient_nom || 'Nom non renseigné'}</p>
              <p><strong>Prénom :</strong> {prescription.patient_prenom || 'Prénom non renseigné'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              PRESCRIPTEUR
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Dr.</strong> {prescription.professionnel_prenom || 'Prénom non renseigné'} {prescription.professionnel_nom || 'Nom non renseigné'}</p>
              <p><strong>Spécialité :</strong> {prescription.professionnel_role || 'Spécialité non renseignée'}</p>
            </div>
          </div>
        </div>

        {/* Diagnostic associé */}
        {prescription.consultation_diagnostic && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">DIAGNOSTIC</h3>
            <p className="text-blue-800">{prescription.consultation_diagnostic}</p>
          </div>
        )}

        {/* Prescription */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
            PRESCRIPTION
          </h3>
          
          <div className="space-y-6">
            {(prescription.liste_medicaments || []).map((medication, index) => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">
                    {index + 1}. {medication.nom || 'Médicament non spécifié'}
                  </h4>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {medication.dosage || 'Dosage non spécifié'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Posologie :</strong> {medication.frequence || 'Non spécifiée'}</p>
                    <p><strong>Durée :</strong> {medication.duree || 'Non spécifiée'}</p>
                  </div>
                  {medication.instructions && (
                    <div>
                      <p><strong>Instructions :</strong></p>
                      <p className="italic text-gray-700">{medication.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions générales */}
        {prescription.instructions_generales && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">INSTRUCTIONS GÉNÉRALES</h3>
            <p className="text-yellow-800 whitespace-pre-wrap">{prescription.instructions_generales}</p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>Date de prescription : {formatDate(prescription.date_emission)}</p>
              <p className="mt-2">{clinicInfo?.nom || 'Structure Médicale'}</p>
              <p className="text-xs">
                {clinicInfo?.responsable_medical_prenom || 'Dr.'} {clinicInfo?.responsable_medical_nom || 'Non renseigné'}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold mb-2">{prescription.signature || 'Signature non renseignée'}</p>
              <div className="border-t border-gray-400 pt-2 mt-8 w-48">
                <p className="text-sm">Signature et cachet</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>Cette ordonnance est valable 3 mois à compter de la date de prescription</p>
            <p className="mt-1">Imprimé via Logiciel Dib Digital</p>
          </div>
        </div>
      </div>
    </div>
  );
};