import React from 'react';
import { useState } from 'react';
import { X, User, Calendar, BarChart3, Users, TestTube, Download, Edit } from 'lucide-react';
import { AnalysisWithDetails } from '../types/analysis';
import { PrintableAnalysis } from './PrintableAnalysis';

interface AnalysisDetailProps {
  analysis: AnalysisWithDetails;
  onClose: () => void;
  onEdit: (analysis: AnalysisWithDetails) => void;
  onDownloadPDF: (analysisId: string) => void;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({
  analysis,
  onClose,
  onEdit,
  onDownloadPDF
}) => {
  const [showPrintableAnalysis, setShowPrintableAnalysis] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Date non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'anormal':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critique':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getResultStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'anormal':
        return 'Anormal';
      case 'critique':
        return 'Critique';
      default:
        return 'Non défini';
    }
  };

  // Vérification des données critiques
  if (!analysis || !analysis.patient_nom || !analysis.patient_prenom) {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <span>Bulletin d'analyses médicales</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDownloadPDF(analysis.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => setShowPrintableAnalysis(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>Voir PDF</span>
              </button>
              <button
                onClick={() => onEdit(analysis)}
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
                  {analysis.patient_prenom || 'Prénom non renseigné'} {analysis.patient_nom || 'Nom non renseigné'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Professionnel</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {analysis.professionnel_prenom || 'Prénom non renseigné'} {analysis.professionnel_nom || 'Nom non renseigné'}
                </p>
                <p className="text-sm text-gray-600 capitalize">{analysis.professionnel_role || 'Spécialité non renseignée'}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Date d'analyse</span>
                </div>
                <p className="text-gray-900">{formatDate(analysis.date_analyse)}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TestTube className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Type d'analyse</span>
                </div>
                <p className="text-gray-900">{analysis.type_analyse || 'Type non spécifié'}</p>
              </div>
            </div>
          </div>

          {/* Résultats d'analyses */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-orange-600" />
              <span>Résultats d'analyses ({analysis.resultats?.length || 0})</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Paramètre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Valeur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Unité</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Valeur normale</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {(analysis.resultats || []).map((result, index) => (
                    <tr key={result.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 font-medium text-gray-900">{result.parametre || 'Paramètre non spécifié'}</td>
                      <td className="py-3 px-4 text-gray-700 font-semibold">{result.valeur || 'Valeur non renseignée'}</td>
                      <td className="py-3 px-4 text-gray-600">{result.unite || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{result.valeur_normale || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultStatusColor(result.statut)}`}>
                          {getResultStatusLabel(result.statut)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Conclusion médicale</span>
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{analysis.conclusion || 'Conclusion non renseignée'}</p>
            </div>
          </div>

          {/* Consultation associée */}
          {analysis.consultation_diagnostic && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation associée</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">{analysis.consultation_diagnostic}</p>
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
              onClick={() => onDownloadPDF(analysis.id)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={() => onEdit(analysis)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier le bulletin
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'impression */}
      {showPrintableAnalysis && (
        <PrintableAnalysis
          analysis={analysis}
          onClose={() => setShowPrintableAnalysis(false)}
        />
      )}
    </div>
  );
};