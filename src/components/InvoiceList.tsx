import React, { useState } from 'react';
import FormatFCAF from './FormatFCAF';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Calendar,
  Filter,
  CreditCard,
  Download,
  Eye,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { InvoiceWithDetails, InvoiceFilter } from '../types/billing';

interface InvoiceListProps {
  invoices: InvoiceWithDetails[];
  onAddInvoice: () => void;
  onEditInvoice: (invoice: InvoiceWithDetails) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onViewInvoice: (invoice: InvoiceWithDetails) => void;
  onAddPayment: (invoice: InvoiceWithDetails) => void;
  onFilterChange: (filter: InvoiceFilter) => void;
  onSearch: (query: string) => void;
  currentFilter: InvoiceFilter;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onViewInvoice,
  onAddPayment,
  onFilterChange,
  onSearch,
  currentFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleDeleteConfirm = (invoiceId: string) => {
    onDeleteInvoice(invoiceId);
    setShowDeleteConfirm(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Payée':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Partiellement payée':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Impayée':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Payée':
        return <CheckCircle className="h-4 w-4" />;
      case 'Partiellement payée':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Impayée':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterOptions = [
    { value: 'all' as InvoiceFilter, label: 'Toutes les factures' },
    { value: 'paid' as InvoiceFilter, label: 'Payées' },
    { value: 'partial' as InvoiceFilter, label: 'Partiellement payées' },
    { value: 'unpaid' as InvoiceFilter, label: 'Impayées' }
  ];

  const calculateTotals = () => {
    return {
      total: invoices.reduce((sum, inv) => sum + inv.montant_total, 0),
      paid: invoices.reduce((sum, inv) => sum + inv.montant_paye, 0),
      unpaid: invoices.reduce((sum, inv) => sum + inv.solde_restant, 0)
    };
  };

  const totals = calculateTotals();

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
              placeholder="Rechercher par patient ou description..."
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
              onChange={(e) => onFilterChange(e.target.value as InvoiceFilter)}
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
          onClick={onAddInvoice}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle facture</span>
        </button>
      </div>

      {/* Statistiques financières */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total factures</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-blue-600">
                <FormatFCAF montant={totals.total} />
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant encaissé</p>
              <p className="text-2xl font-bold text-green-600">
                <FormatFCAF montant={totals.paid} />
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Montant dû</p>
              <p className="text-2xl font-bold text-red-600">
                <FormatFCAF montant={totals.unpaid} />
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucune facture trouvée' : 'Aucune facture émise'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par créer votre première facture'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddInvoice}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer une facture
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Patient</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">Montant</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">Payé</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">Solde</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Statut</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {invoice.patient_prenom} {invoice.patient_nom}
                          </p>
                          {invoice.consultation_date && (
                            <p className="text-sm text-gray-500">
                              Consultation du {formatDate(invoice.consultation_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {formatDate(invoice.date_facture)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 line-clamp-2">{invoice.description}</p>
                      {invoice.consultation_diagnostic && (
                        <p className="text-sm text-blue-600 mt-1">{invoice.consultation_diagnostic}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      <FormatFCAF montant={invoice.montant_total} />
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-green-600">
                      <FormatFCAF montant={invoice.montant_paye} />
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-red-600">
                      <FormatFCAF montant={invoice.solde_restant} />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center justify-center space-x-1 ${getStatusColor(invoice.statut)}`}>
                        {getStatusIcon(invoice.statut)}
                        <span>{invoice.statut}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        {invoice.solde_restant > 0 && (
                          <button
                            onClick={() => onAddPayment(invoice)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Ajouter un paiement"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onViewInvoice(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onEditInvoice(invoice)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteConfirm(invoice.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                Supprimer la facture
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cette facture ? Cette action supprimera aussi tous les paiements associés et est irréversible.
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