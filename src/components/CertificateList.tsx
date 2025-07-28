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
  Download,
  Eye,
  Award
} from 'lucide-react';
import { CertificateWithDetails } from '../types/certificate';

interface CertificateListProps {
  certificates: CertificateWithDetails[];
  onAddCertificate: () => void;
  onEditCertificate: (certificate: CertificateWithDetails) => void;
  onDeleteCertificate: (certificateId: string) => void;
  onViewCertificate: (certificate: CertificateWithDetails) => void;
  onDownloadPDF: (certificateId: string) => void;
  onSearch: (query: string) => void;
}

export const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  onAddCertificate,
  onEditCertificate,
  onDeleteCertificate,
  onViewCertificate,
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

  const handleDeleteConfirm = (certificateId: string) => {
    onDeleteCertificate(certificateId);
    setShowDeleteConfirm(null);
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'repos':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'aptitude':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'grossesse':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'sport':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'repos':
        return 'Arrêt de travail';
      case 'aptitude':
        return 'Aptitude';
      case 'grossesse':
        return 'Grossesse';
      case 'sport':
        return 'Sport';
      case 'maladie':
        return 'Maladie';
      case 'accident':
        return 'Accident';
      default:
        return 'Autre';
    }
  };

  const groupCertificatesByDate = (certificates: CertificateWithDetails[]) => {
    const grouped: { [key: string]: CertificateWithDetails[] } = {};
    
    certificates.forEach(certificate => {
      const date = certificate.date_emission;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(certificate);
    });

    return grouped;
  };

  const groupedCertificates = groupCertificatesByDate(certificates);
  const sortedDates = Object.keys(groupedCertificates).sort().reverse();

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
              placeholder="Rechercher par patient ou type..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Bouton d'ajout */}
        <button
          onClick={onAddCertificate}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau certificat</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total certificats</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Arrêts de travail</p>
              <p className="text-2xl font-bold text-red-600">
                {certificates.filter(c => c.type_certificat === 'repos').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aptitudes</p>
              <p className="text-2xl font-bold text-green-600">
                {certificates.filter(c => c.type_certificat === 'aptitude').length}
              </p>
            </div>
            <Award className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cette semaine</p>
              <p className="text-2xl font-bold text-blue-600">
                {certificates.filter(c => {
                  const certDate = new Date(c.date_emission);
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  return certDate >= startOfWeek;
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Liste des certificats */}
      {certificates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucun certificat trouvé' : 'Aucun certificat émis'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par créer votre premier certificat médical'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddCertificate}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Nouveau certificat
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
                  {groupedCertificates[date].length} certificat(s)
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {groupedCertificates[date].map((certificate) => (
                  <div key={certificate.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* En-tête */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {certificate.patient_prenom} {certificate.patient_nom}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            par {certificate.professionnel_prenom} {certificate.professionnel_nom}
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getCertificateTypeColor(certificate.type_certificat)}`}>
                            {getCertificateTypeLabel(certificate.type_certificat)}
                          </div>
                          
                          {certificate.duree_repos && (
                            <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                              {certificate.duree_repos} jours
                            </div>
                          )}
                        </div>

                        {/* Commentaire */}
                        <div>
                          <p className="text-sm text-gray-600 line-clamp-2">{certificate.commentaire}</p>
                        </div>

                        {certificate.consultation_diagnostic && (
                          <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                            Consultation: {certificate.consultation_diagnostic}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onDownloadPDF(certificate.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onViewCertificate(certificate)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onEditCertificate(certificate)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(certificate.id)}
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
                Supprimer le certificat
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce certificat ? Cette action est irréversible.
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