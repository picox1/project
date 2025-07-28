import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Calendar,
  Filter,
  FileText,
  Stethoscope,
  Pill,
  ClipboardList,
  Eye,
  Printer
} from 'lucide-react';
import { ConsultationWithDetails, ConsultationFilter } from '../types/consultation';

interface ConsultationListProps {
  consultations: ConsultationWithDetails[];
  onAddConsultation: () => void;
  onEditConsultation: (consultation: ConsultationWithDetails) => void;
  onDeleteConsultation: (consultationId: string) => void;
  onViewConsultation: (consultation: ConsultationWithDetails) => void;
  onPrintConsultation?: (consultation: ConsultationWithDetails) => void;
  onFilterChange: (filter: ConsultationFilter) => void;
  onSearch: (query: string) => void;
  currentFilter: ConsultationFilter;
}

export const ConsultationList: React.FC<ConsultationListProps> = ({
  consultations,
  onAddConsultation,
  onEditConsultation,
  onDeleteConsultation,
  onViewConsultation,
  onPrintConsultation,
  onFilterChange,
  onSearch,
  currentFilter
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

  const handleDeleteConfirm = (consultationId: string) => {
    onDeleteConsultation(consultationId);
    setShowDeleteConfirm(null);
  };

  const filterOptions = [
    { value: 'all' as ConsultationFilter, label: 'Toutes les consultations' },
    { value: 'today' as ConsultationFilter, label: 'Aujourd\'hui' },
    { value: 'week' as ConsultationFilter, label: 'Cette semaine' },
    { value: 'month' as ConsultationFilter, label: 'Ce mois' }
  ];

  const groupConsultationsByDate = (consultations: ConsultationWithDetails[]) => {
    const grouped: { [key: string]: ConsultationWithDetails[] } = {};
    
    consultations.forEach(consultation => {
      const date = consultation.date_consultation;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(consultation);
    });

    return grouped;
  };

  const groupedConsultations = groupConsultationsByDate(consultations);
  const sortedDates = Object.keys(groupedConsultations).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header avec filtres et recherche */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par patient, professionnel ou diagnostic..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={currentFilter}
              onChange={(e) => onFilterChange(e.target.value as ConsultationFilter)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bouton d'ajout */}
        <button
          onClick={onAddConsultation}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle consultation</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total consultations</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
            </div>
            <Stethoscope className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patients uniques</p>
              <p className="text-2xl font-bold text-green-600">
                {new Set(consultations.map(c => c.patient_id)).size}
              </p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cette semaine</p>
              <p className="text-2xl font-bold text-purple-600">
                {consultations.filter(c => {
                  const consultationDate = new Date(c.date_consultation);
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  return consultationDate >= startOfWeek;
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      {consultations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucune consultation trouvée' : 'Aucune consultation enregistrée'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par enregistrer votre première consultation'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddConsultation}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nouvelle consultation
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
                  {groupedConsultations[date].length} consultation(s)
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {groupedConsultations[date].map((consultation) => (
                  <div key={consultation.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* En-tête */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {consultation.patient_prenom} {consultation.patient_nom}
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

                        {/* Contenu médical */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <ClipboardList className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Symptômes</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.symptomes}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Diagnostic</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.diagnostic}</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Pill className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Traitement</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{consultation.traitement}</p>
                          </div>
                        </div>

                        {consultation.notes && (
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <FileText className="h-4 w-4 text-gray-400" />
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
                        
                        <button
                          onClick={() => setShowDeleteConfirm(consultation.id)}
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
                Supprimer la consultation
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible.
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