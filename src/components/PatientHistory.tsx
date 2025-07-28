import React, { useState, useEffect } from 'react';
import { X, Calendar, Stethoscope, ClipboardList, Pill, FileText, Eye, Edit, Printer } from 'lucide-react';
import { Patient } from '../types/patient';
import { ConsultationWithDetails } from '../types/consultation';
import { ConsultationService } from '../services/consultationService';

interface PatientHistoryProps {
  patient: Patient;
  onClose: () => void;
  onEditConsultation: (consultation: ConsultationWithDetails) => void;
  onViewConsultation: (consultation: ConsultationWithDetails) => void;
  onPrintConsultation?: (consultation: ConsultationWithDetails) => void;
  onCreatePrescription?: (consultation: ConsultationWithDetails) => void;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({
  patient,
  onClose,
  onEditConsultation,
  onViewConsultation,
  onPrintConsultation,
  onCreatePrescription
}) => {
  const [consultations, setConsultations] = useState<ConsultationWithDetails[]>([]);
  const consultationService = ConsultationService.getInstance();

  useEffect(() => {
    const patientConsultations = consultationService.getConsultationsByPatient(patient.id);
    setConsultations(patientConsultations);
  }, [patient.id]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <span>Historique médical - {patient.prenom} {patient.nom}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations patient */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations patient</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Âge</p>
                <p className="font-medium text-gray-900">{calculateAge(patient.date_de_naissance)} ans</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Groupe sanguin</p>
                <p className="font-medium text-gray-900">{patient.groupe_sanguin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">N° Dossier</p>
                <p className="font-medium text-gray-900">{patient.numero_dossier}</p>
              </div>
            </div>
            
            {patient.antecedents_medicaux && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Antécédents médicaux</p>
                <p className="text-gray-900 bg-white p-3 rounded-lg border">{patient.antecedents_medicaux}</p>
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total consultations</p>
                  <p className="text-2xl font-bold text-blue-600">{consultations.length}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dernière consultation</p>
                  <p className="text-lg font-bold text-green-600">
                    {consultations.length > 0 
                      ? new Date(consultations[0].date_consultation).toLocaleDateString('fr-FR')
                      : 'Aucune'
                    }
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cette année</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {consultations.filter(c => {
                      const consultationYear = new Date(c.date_consultation).getFullYear();
                      const currentYear = new Date().getFullYear();
                      return consultationYear === currentYear;
                    }).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Historique des consultations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des consultations</h3>
            
            {consultations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune consultation</h4>
                <p className="text-gray-500">Ce patient n'a pas encore de consultation enregistrée.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* En-tête */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatDate(consultation.date_consultation)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            par {consultation.professionnel_prenom} {consultation.professionnel_nom} ({consultation.professionnel_role})
                          </div>
                          
                          {consultation.rendezvous_motif && (
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              RDV: {consultation.rendezvous_motif}
                            </div>
                          )}
                        </div>

                        {/* Contenu médical résumé */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <ClipboardList className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium text-gray-700">Symptômes</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.symptomes}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Stethoscope className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium text-gray-700">Diagnostic</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.diagnostic}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Pill className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700">Traitement</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.traitement}</p>
                          </div>
                        </div>

                        {consultation.notes && (
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium text-gray-700">Notes</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {onPrintConsultation && (
                          <button
                            onClick={() => onPrintConsultation(consultation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Imprimer"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onViewConsultation(consultation)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onEditConsultation(consultation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                       
                       {onCreatePrescription && (
                         <button
                           onClick={() => onCreatePrescription(consultation)}
                           className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                           title="Créer une ordonnance"
                         >
                           <FileText className="h-4 w-4" />
                         </button>
                       )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};