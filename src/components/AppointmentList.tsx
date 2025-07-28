import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  Plus,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { AppointmentWithDetails, AppointmentFilter, AppointmentView } from '../types/appointment';

interface AppointmentListProps {
  appointments: AppointmentWithDetails[];
  onAddAppointment: () => void;
  onEditAppointment: (appointment: AppointmentWithDetails) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onUpdateStatus: (appointmentId: string, status: 'Confirmé' | 'Terminé' | 'Annulé') => void;
  onCreateConsultation?: (appointment: AppointmentWithDetails) => void;
  onFilterChange: (filter: AppointmentFilter) => void;
  onSearch: (query: string) => void;
  currentFilter: AppointmentFilter;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onAddAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onUpdateStatus,
  onCreateConsultation,
  onFilterChange,
  onSearch,
  currentFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<AppointmentView>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Terminé':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Annulé':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <CheckCircle className="h-4 w-4" />;
      case 'Terminé':
        return <CheckCircle className="h-4 w-4" />;
      case 'Annulé':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleDeleteConfirm = (appointmentId: string) => {
    onDeleteAppointment(appointmentId);
    setShowDeleteConfirm(null);
  };

  const filterOptions = [
    { value: 'all' as AppointmentFilter, label: 'Tous les rendez-vous' },
    { value: 'today' as AppointmentFilter, label: 'Aujourd\'hui' },
    { value: 'week' as AppointmentFilter, label: 'Cette semaine' },
    { value: 'month' as AppointmentFilter, label: 'Ce mois' }
  ];

  const groupAppointmentsByDate = (appointments: AppointmentWithDetails[]) => {
    const grouped: { [key: string]: AppointmentWithDetails[] } = {};
    
    appointments.forEach(appointment => {
      const date = appointment.date_du_rendez_vous;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });

    // Trier les rendez-vous de chaque jour par heure
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.heure_du_rendez_vous.localeCompare(b.heure_du_rendez_vous));
    });

    return grouped;
  };

  const groupedAppointments = groupAppointmentsByDate(appointments);
  const sortedDates = Object.keys(groupedAppointments).sort();

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
              placeholder="Rechercher par patient, professionnel ou motif..."
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
              onChange={(e) => onFilterChange(e.target.value as AppointmentFilter)}
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

        {/* Boutons d'action */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors ${
                view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-md transition-colors ${
                view === 'calendar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onAddAppointment}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmés</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.statut === 'Confirmé').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-blue-600">
                {appointments.filter(a => a.statut === 'Terminé').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annulés</p>
              <p className="text-2xl font-bold text-red-600">
                {appointments.filter(a => a.statut === 'Annulé').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucun rendez-vous trouvé' : 'Aucun rendez-vous planifié'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par planifier votre premier rendez-vous'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddAppointment}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Planifier un rendez-vous
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
                  {groupedAppointments[date].length} rendez-vous
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {groupedAppointments[date].map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatTime(appointment.heure_du_rendez_vous)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({appointment.duree} min)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {appointment.patient_prenom} {appointment.patient_nom}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          avec {appointment.professionnel_prenom} {appointment.professionnel_nom}
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(appointment.statut)}`}>
                          {getStatusIcon(appointment.statut)}
                          <span>{appointment.statut}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {appointment.statut === 'Confirmé' && (
                          <button
                            onClick={() => onUpdateStatus(appointment.id, 'Terminé')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Marquer comme terminé"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {appointment.statut === 'Terminé' && onCreateConsultation && (
                          <button
                            onClick={() => onCreateConsultation(appointment)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Créer une consultation"
                          >
                            <Stethoscope className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onEditAppointment(appointment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(appointment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-start space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Motif:</p>
                        <p className="text-sm text-gray-600">{appointment.motif}</p>
                      </div>
                      
                      {appointment.note && (
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Note:</p>
                          <p className="text-sm text-gray-600">{appointment.note}</p>
                        </div>
                      )}
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
                Supprimer le rendez-vous
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
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