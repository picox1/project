import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Calendar,
  MapPin,
  Droplets,
  FileText,
  Filter,
  History
} from 'lucide-react';
import { Patient } from '../types/patient';

interface PatientListProps {
  patients: Patient[];
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onViewHistory: (patient: Patient) => void;
  onSearch: (query: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  onAddPatient,
  onEditPatient,
  onDeletePatient,
  onViewHistory,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleDeleteConfirm = (patientId: string) => {
    onDeletePatient(patientId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header avec recherche et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou n° dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <button
          onClick={onAddPatient}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau patient</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Patients enregistrés</h3>
            <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Liste des patients */}
      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par ajouter votre premier patient'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddPatient}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un patient
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                {/* En-tête du patient */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${patient.sexe === 'Homme' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                      <User className={`h-5 w-5 ${patient.sexe === 'Homme' ? 'text-blue-600' : 'text-pink-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {patient.prenom} {patient.nom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Dossier: {patient.numero_dossier}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewHistory(patient)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Historique médical"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditPatient(patient)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(patient.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Informations du patient */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{calculateAge(patient.date_de_naissance)} ans ({formatDate(patient.date_de_naissance)})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{patient.telephone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Droplets className="h-4 w-4" />
                    <span>Groupe {patient.groupe_sanguin}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{patient.adresse}</span>
                  </div>

                  {patient.antecedents_medicaux && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{patient.antecedents_medicaux}</span>
                    </div>
                  )}
                </div>

                {/* Date d'enregistrement */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Enregistré le {formatDate(patient.date_d_enregistrement)}
                  </p>
                </div>
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
                Supprimer le patient
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.
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