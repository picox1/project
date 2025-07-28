import React from 'react';
import { useState } from 'react';
import { Printer } from 'lucide-react';
import { X, User, Calendar, FileText, Users, Pill, Download, Edit } from 'lucide-react';
import { PrescriptionWithDetails } from '../types/prescription';
import { PrintablePrescription } from './PrintablePrescription';

interface PrescriptionDetailProps {
  prescription: PrescriptionWithDetails;
  onClose: () => void;
  onEdit: (prescription: PrescriptionWithDetails) => void;
  onDownloadPDF: (prescriptionId: string) => void;
}

export const PrescriptionDetail: React.FC<PrescriptionDetailProps> = ({
  prescription,
  onClose,
  onEdit,
  onDownloadPDF
}) => {
  const [showPrintablePrescription, setShowPrintablePrescription] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Vérification des données critiques
  if (!prescription || !prescription.patient_nom || !prescription.patient_prenom) {
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
              <FileText className="h-6 w-6 text-blue-600" />
              <span>Détails de l'ordonnance</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPrintablePrescription(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Voir PDF</span>
              </button>
              <button
                onClick={() => onEdit(prescription)}
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
                  {prescription.patient_prenom || 'Prénom non renseigné'} {prescription.patient_nom || 'Nom non renseigné'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Prescripteur</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {prescription.professionnel_prenom || 'Prénom non renseigné'} {prescription.professionnel_nom || 'Nom non renseigné'}
                </p>
                <p className="text-sm text-gray-600 capitalize">{prescription.professionnel_role || 'Spécialité non renseignée'}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Date d'émission</span>
                </div>
                <p className="text-gray-900">{formatDate(prescription.date_emission)}</p>
              </div>
              
              {prescription.consultation_diagnostic && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Consultation associée</span>
                  </div>
                  <p className="text-gray-900">{prescription.consultation_diagnostic}</p>
                </div>
              )}
            </div>
          </div>

          {/* Médicaments prescrits */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Pill className="h-5 w-5 text-green-600" />
              <span>Médicaments prescrits ({prescription.liste_medicaments?.length || 0})</span>
            </h3>
            
            <div className="space-y-4">
              {(prescription.liste_medicaments || []).map((medication, index) => (
                <div key={medication.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {index + 1}. {medication.nom || 'Médicament non spécifié'}
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Dosage:</span>
                          <p className="text-gray-900">{medication.dosage || 'Non spécifié'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Fréquence:</span>
                          <p className="text-gray-900">{medication.frequence || 'Non spécifiée'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Durée:</span>
                          <p className="text-gray-900">{medication.duree || 'Non spécifiée'}</p>
                        </div>
                      </div>
                      {medication.instructions && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-600">Instructions particulières:</span>
                          <p className="text-gray-900 italic">{medication.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions générales */}
          {prescription.instructions_generales && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Instructions générales</span>
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{prescription.instructions_generales}</p>
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-medium">{prescription.signature || 'Signature non renseignée'}</p>
              <p className="text-sm text-gray-600 mt-1">
                Émise le {formatDate(prescription.date_emission)}
              </p>
            </div>
          </div>
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
              onClick={() => onDownloadPDF(prescription.id)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={() => onEdit(prescription)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier l'ordonnance
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'impression */}
      {showPrintablePrescription && (
        <PrintablePrescription
          prescription={prescription}
          onClose={() => setShowPrintablePrescription(false)}
        />
      )}
    </div>
  );
};