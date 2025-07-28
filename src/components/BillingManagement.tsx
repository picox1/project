import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/currency';
import { CreditCard, AlertCircle, ArrowLeft, Download } from 'lucide-react';
import { ClinicService } from '../services/clinicService';
import { InvoiceList } from './InvoiceList';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceDetail } from './InvoiceDetail';
import { PaymentForm } from './PaymentForm';
import { InvoiceWithDetails, InvoiceFormData, PaymentFormData, InvoiceFilter } from '../types/billing';
import { BillingService } from '../services/billingService';
import { PatientService } from '../services/patientService';
import { ConsultationService } from '../services/consultationService';
import { User } from '../types/user';
import { Patient } from '../types/patient';
import { ConsultationWithDetails } from '../types/consultation';

interface BillingManagementProps {
  user: User;
  onBackToDashboard?: () => void;
  selectedConsultation?: ConsultationWithDetails | null;
}

export const BillingManagement: React.FC<BillingManagementProps> = ({ 
  user, 
  onBackToDashboard,
  selectedConsultation 
}) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<ConsultationWithDetails[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceWithDetails | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithDetails | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<InvoiceFilter>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const billingService = BillingService.getInstance();
  const patientService = PatientService.getInstance();
  const consultationService = ConsultationService.getInstance();

  // Vérifier les autorisations - seuls les médecins et administrateurs peuvent accéder
  const hasAccess = ['médecin', 'admin'].includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      loadData();
      if (selectedConsultation) {
        setShowInvoiceForm(true);
      }
    }
  }, [hasAccess, selectedConsultation]);

  const loadData = () => {
    // Charger les factures
    const allInvoices = billingService.getInvoicesWithDetails();
    setInvoices(allInvoices);
    applyFilter('all', allInvoices);

    // Charger les patients
    const allPatients = patientService.getAllPatients();
    setPatients(allPatients);

    // Charger les consultations
    const allConsultations = consultationService.getConsultationsWithDetails();
    setConsultations(allConsultations);
  };

  const applyFilter = (filter: InvoiceFilter, invoicesList?: InvoiceWithDetails[]) => {
    const invoicesToFilter = invoicesList || invoices;
    let filtered: InvoiceWithDetails[] = [];

    switch (filter) {
      case 'paid':
        filtered = invoicesToFilter.filter(inv => inv.statut === 'Payée');
        break;
      case 'partial':
        filtered = invoicesToFilter.filter(inv => inv.statut === 'Partiellement payée');
        break;
      case 'unpaid':
        filtered = invoicesToFilter.filter(inv => inv.statut === 'Impayée');
        break;
      default:
        filtered = invoicesToFilter;
    }

    setFilteredInvoices(filtered);
    setCurrentFilter(filter);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice: InvoiceWithDetails) => {
    setEditingInvoice(invoice);
    setViewingInvoice(null);
    setShowInvoiceDetail(false);
    setShowInvoiceForm(true);
  };

  const handleViewInvoice = (invoice: InvoiceWithDetails) => {
    setViewingInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleAddPayment = (invoice: InvoiceWithDetails) => {
    setPaymentInvoice(invoice);
    setShowInvoiceDetail(false);
    setShowPaymentForm(true);
  };

  const handleSaveInvoice = async (invoiceData: InvoiceFormData) => {
    setIsLoading(true);
    try {
      if (editingInvoice) {
        const updatedInvoice = billingService.updateInvoice(editingInvoice.id, invoiceData);
        if (updatedInvoice) {
          loadData();
          showNotification('success', 'Facture mise à jour avec succès');
        } else {
          showNotification('error', 'Erreur lors de la mise à jour de la facture');
        }
      } else if (selectedConsultation) {
        // Créer une facture à partir d'une consultation
        const newInvoice = billingService.createInvoiceFromConsultation(
          selectedConsultation.id,
          invoiceData.montant_total,
          invoiceData.description
        );
        if (newInvoice) {
          loadData();
          showNotification('success', 'Facture créée avec succès à partir de la consultation');
        }
      } else {
        const newInvoice = billingService.addInvoice(invoiceData);
        loadData();
        showNotification('success', 'Facture créée avec succès');
      }
      setShowInvoiceForm(false);
      setEditingInvoice(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePayment = async (paymentData: PaymentFormData) => {
    setIsLoading(true);
    try {
      const newPayment = billingService.addPayment(paymentData);
      loadData();
      showNotification('success', 'Paiement enregistré avec succès');
      setShowPaymentForm(false);
      setPaymentInvoice(null);
    } catch (error) {
      showNotification('error', 'Une erreur est survenue lors de l\'enregistrement du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const success = billingService.deleteInvoice(invoiceId);
    if (success) {
      loadData();
      showNotification('success', 'Facture supprimée avec succès');
    } else {
      showNotification('error', 'Erreur lors de la suppression de la facture');
    }
  };

  const handleSearch = (query: string) => {
    const searchResults = billingService.searchInvoices(query);
    setFilteredInvoices(searchResults);
  };

  const handleFilterChange = (filter: InvoiceFilter) => {
    applyFilter(filter);
  };

  const handleExportCSV = () => {
    const csvContent = billingService.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', 'Export CSV téléchargé avec succès');
  };

  const handleCancelInvoiceForm = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const handleCancelPaymentForm = () => {
    setShowPaymentForm(false);
    setPaymentInvoice(null);
  };

  const handleCloseInvoiceDetail = () => {
    setShowInvoiceDetail(false);
    setViewingInvoice(null);
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à la gestion de la facturation.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins et administrateurs peuvent accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour au tableau de bord</span>
            </button>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <CreditCard className="h-8 w-8 text-blue-600" />
             )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion de la Facturation</h1>
             <p className="text-gray-600">Gérez les factures et paiements de {clinicInfo?.nom || 'la structure médicale'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InvoiceList
          invoices={filteredInvoices}
          onAddInvoice={handleAddInvoice}
          onEditInvoice={handleEditInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onViewInvoice={handleViewInvoice}
          onAddPayment={handleAddPayment}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          currentFilter={currentFilter}
        />
      </div>

      {/* Formulaire facture modal */}
      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice}
          patients={patients}
          consultations={consultations}
          selectedConsultation={selectedConsultation}
          onSave={handleSaveInvoice}
          onCancel={handleCancelInvoiceForm}
          isLoading={isLoading}
        />
      )}

      {/* Formulaire paiement modal */}
      {showPaymentForm && paymentInvoice && (
        <PaymentForm
          invoiceId={paymentInvoice.id}
          maxAmount={paymentInvoice.solde_restant}
          onSave={handleSavePayment}
          onCancel={handleCancelPaymentForm}
          isLoading={isLoading}
        />
      )}

      {/* Détail facture modal */}
      {showInvoiceDetail && viewingInvoice && (
        <InvoiceDetail
          invoice={viewingInvoice}
          onClose={handleCloseInvoiceDetail}
          onEdit={handleEditInvoice}
          onAddPayment={handleAddPayment}
        />
      )}
    </div>
  );
};