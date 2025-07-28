import React from 'react';
import { useState } from 'react';
import { Printer } from 'lucide-react';
import { X, User, Calendar, Stethoscope, ClipboardList, Pill, FileText, Users, Plus } from 'lucide-react';
import { ConsultationWithDetails } from '../types/consultation';
import { PrintableConsultation } from './PrintableConsultation';

interface ConsultationDetailProps {
  consultation: ConsultationWithDetails;
  onClose: () => void;
  onEdit: (consultation: ConsultationWithDetails) => void;
  onCreatePrescription?: (consultation: ConsultationWithDetails) => void;
  onCreateCertificate?: (consultation: ConsultationWithDetails) => void;
  onCreateAnalysis?: (consultation: ConsultationWithDetails) => void;
}

export const ConsultationDetail: React.FC<ConsultationDetailProps> = ({
  consultation,
  onClose,
  onEdit,
  onCreatePrescription
}) => {
  const [showPrintableConsultation, setShowPrintableConsultation] = useState(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span>Détails de la consultation</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPrintableConsultation(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={() => onEdit(consultation)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Modifier
              </button>
              {onCreatePrescription && (
                <button
                  onClick={() => onCreatePrescription(consultation)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ordonnance</span>
                </button>
              )}
              <button
                onClick={() => onCreateCertificate?.(consultation)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Certificat</span>
              </button>
              <button
                onClick={() => onCreateAnalysis?.(consultation)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Analyses</span>
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
                  {consultation.patient_prenom} {consultation.patient_nom}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Professionnel</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {consultation.professionnel_prenom} {consultation.professionnel_nom}
                </p>
                <p className="text-sm text-gray-600 capitalize">{consultation.professionnel_role}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Date de consultation</span>
                </div>
                <p className="text-gray-900">{formatDate(consultation.date_consultation)}</p>
              </div>
              
              {consultation.rendezvous_motif && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Rendez-vous associé</span>
                  </div>
                  <p className="text-gray-900">{consultation.rendezvous_motif}</p>
                </div>
              )}
            </div>
          </div>

          {/* Symptômes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <span>Symptômes</span>
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.symptomes}</p>
            </div>
          </div>

          {/* Diagnostic */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-red-600" />
              <span>Diagnostic</span>
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.diagnostic}</p>
            </div>
          </div>

          {/* Traitement */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Pill className="h-5 w-5 text-green-600" />
              <span>Traitement</span>
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.traitement}</p>
            </div>
          </div>

          {/* Notes */}
          {consultation.notes && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Notes complémentaires</span>
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{consultation.notes}</p>
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
            {onCreatePrescription && (
              <button
                onClick={() => onCreatePrescription(consultation)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Créer une ordonnance</span>
              </button>
            )}
            <button
              onClick={() => onEdit(consultation)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier la consultation
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'impression */}
      {showPrintableConsultation && (
        <PrintableConsultation
          consultation={consultation}
          onClose={() => setShowPrintableConsultation(false)}
        />
      )}
    </div>
  );
};