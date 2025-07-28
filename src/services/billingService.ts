import { formatCurrency } from '../utils/currency';
import { Invoice, Payment, InvoiceFormData, PaymentFormData, InvoiceWithDetails } from '../types/billing';
import { PatientService } from './patientService';
import { ConsultationService } from './consultationService';

const INVOICES_STORAGE_KEY = 'cabinet_medical_invoices';
const PAYMENTS_STORAGE_KEY = 'cabinet_medical_payments';

export class BillingService {
  private static instance: BillingService;
  private invoices: Invoice[] = [];
  private payments: Payment[] = [];
  private patientService: PatientService;
  private consultationService: ConsultationService;

  private constructor() {
    this.patientService = PatientService.getInstance();
    this.consultationService = ConsultationService.getInstance();
    this.loadData();
  }

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  private loadData(): void {
    this.loadInvoices();
    this.loadPayments();
  }

  private loadInvoices(): void {
    const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (storedInvoices) {
      this.invoices = JSON.parse(storedInvoices);
    } else {
      this.invoices = this.getDefaultInvoices();
      this.saveInvoices();
    }
  }

  private loadPayments(): void {
    const storedPayments = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (storedPayments) {
      this.payments = JSON.parse(storedPayments);
    } else {
      this.payments = this.getDefaultPayments();
      this.savePayments();
    }
  }

  private saveInvoices(): void {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(this.invoices));
  }

  private savePayments(): void {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(this.payments));
  }

  private getDefaultInvoices(): Invoice[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
      {
        id: '1',
        patient_id: '1',
        consultation_id: '1',
        date_facture: today.toISOString().split('T')[0],
        montant_total: 75000,
        montant_paye: 75000,
        solde_restant: 0,
        statut: 'Payée',
        description: 'Consultation générale + ordonnance',
        date_creation: today.toISOString().split('T')[0]
      },
      {
        id: '2',
        patient_id: '2',
        consultation_id: '2',
        date_facture: yesterday.toISOString().split('T')[0],
        montant_total: 120000,
        montant_paye: 50000,
        solde_restant: 70000,
        statut: 'Partiellement payée',
        description: 'Consultation spécialisée + analyses',
        date_creation: yesterday.toISOString().split('T')[0]
      },
      {
        id: '3',
        patient_id: '3',
        consultation_id: '3',
        date_facture: lastWeek.toISOString().split('T')[0],
        montant_total: 90000,
        montant_paye: 0,
        solde_restant: 90000,
        statut: 'Impayée',
        description: 'Consultation + certificat médical',
        date_creation: lastWeek.toISOString().split('T')[0]
      }
    ];
  }

  private getDefaultPayments(): Payment[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return [
      {
        id: '1',
        facture_id: '1',
        date_paiement: today.toISOString().split('T')[0],
        montant: 75000,
        mode_paiement: 'Espèces',
        reference: 'ESP001',
        notes: 'Paiement intégral en espèces'
      },
      {
        id: '2',
        facture_id: '2',
        date_paiement: yesterday.toISOString().split('T')[0],
        montant: 50000,
        mode_paiement: 'Mobile Money',
        reference: 'MM123456',
        notes: 'Acompte via Mobile Money'
      }
    ];
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateInvoiceStatus(montantTotal: number, montantPaye: number): 'Payée' | 'Partiellement payée' | 'Impayée' {
    if (montantPaye === 0) return 'Impayée';
    if (montantPaye >= montantTotal) return 'Payée';
    return 'Partiellement payée';
  }

  private updateInvoiceCalculations(invoiceId: string): void {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const invoicePayments = this.payments.filter(p => p.facture_id === invoiceId);
    const montantPaye = invoicePayments.reduce((sum, payment) => sum + payment.montant, 0);
    const soldeRestant = Math.max(0, invoice.montant_total - montantPaye);
    const statut = this.calculateInvoiceStatus(invoice.montant_total, montantPaye);

    invoice.montant_paye = montantPaye;
    invoice.solde_restant = soldeRestant;
    invoice.statut = statut;

    this.saveInvoices();
  }

  // Gestion des factures
  public getAllInvoices(): Invoice[] {
    return [...this.invoices];
  }

  public getInvoicesWithDetails(): InvoiceWithDetails[] {
    const patients = this.patientService.getAllPatients();
    const consultations = this.consultationService.getAllConsultations();

    return this.invoices.map(invoice => {
      const patient = patients.find(p => p.id === invoice.patient_id);
      const consultation = invoice.consultation_id 
        ? consultations.find(c => c.id === invoice.consultation_id)
        : undefined;
      const invoicePayments = this.payments.filter(p => p.facture_id === invoice.id);

      return {
        ...invoice,
        patient_nom: patient?.nom || 'Patient inconnu',
        patient_prenom: patient?.prenom || '',
        consultation_diagnostic: consultation?.diagnostic,
        consultation_date: consultation?.date_consultation,
        payments: invoicePayments
      };
    });
  }

  public getInvoiceById(id: string): Invoice | null {
    return this.invoices.find(i => i.id === id) || null;
  }

  public addInvoice(invoiceData: InvoiceFormData): Invoice {
    const newInvoice: Invoice = {
      id: this.generateUniqueId(),
      ...invoiceData,
      date_facture: new Date().toISOString().split('T')[0],
      montant_paye: 0,
      solde_restant: invoiceData.montant_total,
      statut: 'Impayée',
      date_creation: new Date().toISOString().split('T')[0]
    };

    this.invoices.push(newInvoice);
    this.saveInvoices();
    return newInvoice;
  }

  public updateInvoice(id: string, invoiceData: Partial<InvoiceFormData>): Invoice | null {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return null;

    const updatedInvoice: Invoice = {
      ...this.invoices[index],
      ...invoiceData
    };

    // Recalculer le solde si le montant total a changé
    if (invoiceData.montant_total !== undefined) {
      updatedInvoice.solde_restant = invoiceData.montant_total - updatedInvoice.montant_paye;
      updatedInvoice.statut = this.calculateInvoiceStatus(invoiceData.montant_total, updatedInvoice.montant_paye);
    }

    this.invoices[index] = updatedInvoice;
    this.saveInvoices();
    return updatedInvoice;
  }

  public deleteInvoice(id: string): boolean {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return false;

    // Supprimer aussi tous les paiements associés
    this.payments = this.payments.filter(p => p.facture_id !== id);
    this.savePayments();

    this.invoices.splice(index, 1);
    this.saveInvoices();
    return true;
  }

  // Gestion des paiements
  public getAllPayments(): Payment[] {
    return [...this.payments];
  }

  public getPaymentsByInvoice(invoiceId: string): Payment[] {
    return this.payments.filter(p => p.facture_id === invoiceId);
  }

  public addPayment(paymentData: PaymentFormData): Payment {
    const newPayment: Payment = {
      id: this.generateUniqueId(),
      ...paymentData,
      date_paiement: new Date().toISOString().split('T')[0]
    };

    this.payments.push(newPayment);
    this.savePayments();

    // Mettre à jour les calculs de la facture
    this.updateInvoiceCalculations(paymentData.facture_id);

    return newPayment;
  }

  public deletePayment(id: string): boolean {
    const payment = this.payments.find(p => p.id === id);
    if (!payment) return false;

    const index = this.payments.findIndex(p => p.id === id);
    this.payments.splice(index, 1);
    this.savePayments();

    // Mettre à jour les calculs de la facture
    this.updateInvoiceCalculations(payment.facture_id);

    return true;
  }

  // Filtres et recherches
  public getInvoicesByStatus(status: 'Payée' | 'Partiellement payée' | 'Impayée'): InvoiceWithDetails[] {
    return this.getInvoicesWithDetails().filter(invoice => invoice.statut === status);
  }

  public getInvoicesByPatient(patientId: string): InvoiceWithDetails[] {
    return this.getInvoicesWithDetails().filter(invoice => invoice.patient_id === patientId);
  }

  public searchInvoices(query: string): InvoiceWithDetails[] {
    if (!query.trim()) return this.getInvoicesWithDetails();

    const searchTerm = query.toLowerCase().trim();
    return this.getInvoicesWithDetails().filter(invoice =>
      invoice.patient_nom.toLowerCase().includes(searchTerm) ||
      invoice.patient_prenom.toLowerCase().includes(searchTerm) ||
      invoice.description?.toLowerCase().includes(searchTerm) ||
      invoice.consultation_diagnostic?.toLowerCase().includes(searchTerm)
    );
  }

  // Statistiques
  public getBillingStatistics(): {
    totalInvoices: number;
    totalAmount: number;
    totalPaid: number;
    totalUnpaid: number;
    unpaidInvoicesCount: number;
    partiallyPaidCount: number;
    paidInvoicesCount: number;
  } {
    const invoices = this.getAllInvoices();
    
    return {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.montant_total, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.montant_paye, 0),
      totalUnpaid: invoices.reduce((sum, inv) => sum + inv.solde_restant, 0),
      unpaidInvoicesCount: invoices.filter(inv => inv.statut === 'Impayée').length,
      partiallyPaidCount: invoices.filter(inv => inv.statut === 'Partiellement payée').length,
      paidInvoicesCount: invoices.filter(inv => inv.statut === 'Payée').length
    };
  }

  // Export
  public exportToCSV(): string {
    const invoices = this.getInvoicesWithDetails();
    const headers = [
      'ID Facture',
      'Patient',
      'Date Facture',
      'Montant Total',
      'Montant Payé',
      'Solde Restant',
      'Statut',
      'Description'
    ];

    const csvContent = [
      headers.join(','),
      ...invoices.map(invoice => [
        invoice.id,
        `"${invoice.patient_prenom} ${invoice.patient_nom}"`,
        invoice.date_facture,
        `"${formatCurrency(invoice.montant_total)}"`,
        `"${formatCurrency(invoice.montant_paye)}"`,
        `"${formatCurrency(invoice.solde_restant)}"`,
        `"${invoice.statut}"`,
        `"${invoice.description || ''}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  public createInvoiceFromConsultation(consultationId: string, montantTotal: number, description?: string): Invoice | null {
    const consultation = this.consultationService.getConsultationById(consultationId);
    if (!consultation) return null;

    const invoiceData: InvoiceFormData = {
      patient_id: consultation.patient_id,
      consultation_id: consultationId,
      montant_total: montantTotal,
      description: description || `Consultation du ${new Date(consultation.date_consultation).toLocaleDateString('fr-FR')}`
    };

    return this.addInvoice(invoiceData);
  }
}