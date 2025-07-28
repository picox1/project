import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Calendar,
  Filter,
  BarChart3,
  Download,
  Eye,
  TestTube
} from 'lucide-react';
import { AnalysisWithDetails } from '../types/analysis';

interface AnalysisListProps {
  analyses: AnalysisWithDetails[];
  onAddAnalysis: () => void;
  onEditAnalysis: (analysis: AnalysisWithDetails) => void;
  onDeleteAnalysis: (analysisId: string) => void;
  onViewAnalysis: (analysis: AnalysisWithDetails) => void;
  onDownloadPDF: (analysisId: string) => void;
  onSearch: (query: string) => void;
}

export const AnalysisList: React.FC<AnalysisListProps> = ({
  analyses,
  onAddAnalysis,
  onEditAnalysis,
  onDeleteAnalysis,
  onViewAnalysis,
  onDownloadPDF,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleDeleteConfirm = (analysisId: string) => {
    onDeleteAnalysis(analysisId);
    setShowDeleteConfirm(null);
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'anormal':
        return 'text-orange-600';
      case 'critique':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const groupAnalysesByDate = (analyses: AnalysisWithDetails[]) => {
    const grouped: { [key: string]: AnalysisWithDetails[] } = {};
    
    analyses.forEach(analysis => {
      const date = analysis.date_analyse;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(analysis);
    });

    return grouped;
  };

  const groupedAnalyses = groupAnalysesByDate(analyses);
  const sortedDates = Object.keys(groupedAnalyses).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header avec recherche et bouton d'ajout */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par patient ou type d'analyse..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Bouton d'ajout */}
        <button
          onClick={onAddAnalysis}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau bulletin</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total analyses</p>
              <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Résultats normaux</p>
              <p className="text-2xl font-bold text-green-600">
                {analyses.reduce((count, analysis) => 
                  count + analysis.resultats.filter(r => r.statut === 'normal').length, 0
                )}
              </p>
            </div>
            <TestTube className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Résultats anormaux</p>
              <p className="text-2xl font-bold text-orange-600">
                {analyses.reduce((count, analysis) => 
                  count + analysis.resultats.filter(r => r.statut === 'anormal').length, 0
                )}
              </p>
            </div>
            <TestTube className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cette semaine</p>
              <p className="text-2xl font-bold text-blue-600">
                {analyses.filter(a => {
                  const analysisDate = new Date(a.date_analyse);
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  return analysisDate >= startOfWeek;
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Liste des analyses */}
      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucune analyse trouvée' : 'Aucune analyse enregistrée'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par créer votre premier bulletin d\'analyses'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddAnalysis}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Nouveau bulletin
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(date)}
                </h3>
                <p className="text-sm text-gray-600">
                  {groupedAnalyses[date].length} analyse(s)
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {groupedAnalyses[date].map((analysis) => (
                  <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* En-tête */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {analysis.patient_prenom} {analysis.patient_nom}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            par {analysis.professionnel_prenom} {analysis.professionnel_nom}
                          </div>
                          
                          <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            {analysis.type_analyse}
                          </div>
                        </div>

                        {/* Résultats résumés */}
                        <div>
                          <div className="flex items-center space-x-1 mb-2">
                            <TestTube className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Résultats ({analysis.resultats.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {analysis.resultats.slice(0, 3).map((result, index) => (
                              <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                                <span className="font-medium">{result.parametre}:</span> 
                                <span className={`ml-1 ${getResultStatusColor(result.statut)}`}>
                                  {result.valeur} {result.unite}
                                </span>
                              </div>
                            ))}
                            {analysis.resultats.length > 3 && (
                              <div className="bg-gray-100 p-2 rounded text-xs flex items-center justify-center text-gray-600">
                                +{analysis.resultats.length - 3} autres
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Conclusion */}
                        <div>
                          <div className="flex items-center space-x-1 mb-1">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Conclusion</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{analysis.conclusion}</p>
                        </div>

                        {analysis.consultation_diagnostic && (
                          <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                            Consultation: {analysis.consultation_diagnostic}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onDownloadPDF(analysis.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onViewAnalysis(analysis)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onEditAnalysis(analysis)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(analysis.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supprimer le bulletin d'analyses
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce bulletin ? Cette action est irréversible.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};