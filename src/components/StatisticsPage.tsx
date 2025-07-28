import React, { useState, useEffect } from 'react';
import FormatFCAF from './FormatFCAF';
import { ClinicService } from '../services/clinicService';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Download,
  Printer,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  TestTube
} from 'lucide-react';
import { User } from '../types/user';
import { CabinetStatistics, StatisticsPeriod } from '../types/statistics';
import { StatisticsService } from '../services/statisticsService';

interface StatisticsPageProps {
  user: User;
  onBackToDashboard: () => void;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ user, onBackToDashboard }) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [statistics, setStatistics] = useState<CabinetStatistics | null>(null);
  const [consultationsByDoctor, setConsultationsByDoctor] = useState<any[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [revenueEvolution, setRevenueEvolution] = useState<any[]>([]);
  const [consultationEvolution, setConsultationEvolution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const statisticsService = StatisticsService.getInstance();

  // Vérifier les autorisations
  const hasAccess = ['médecin', 'admin'].includes(user.role);

  const periods: StatisticsPeriod[] = [
    { label: 'Aujourd\'hui', value: 'today' },
    { label: 'Cette semaine', value: 'week' },
    { label: 'Ce mois', value: 'month' },
    { label: 'Cette année', value: 'year' },
    { label: 'Intervalle personnalisé', value: 'custom' }
  ];

  useEffect(() => {
    if (hasAccess) {
      loadStatistics();
    }
  }, [selectedPeriod, customStartDate, customEndDate, hasAccess]);

  const loadStatistics = () => {
    setIsLoading(true);
    try {
      const stats = statisticsService.getCabinetStatistics(selectedPeriod, customStartDate, customEndDate);
      const doctorStats = statisticsService.getConsultationsByDoctor(selectedPeriod, customStartDate, customEndDate);
      const weeklyStats = statisticsService.getWeeklyAttendance(selectedPeriod, customStartDate, customEndDate);
      const revenueStats = statisticsService.getRevenueEvolution(selectedPeriod, customStartDate, customEndDate);
      const consultationStats = statisticsService.getConsultationEvolution(selectedPeriod, customStartDate, customEndDate);

      setStatistics(stats);
      setConsultationsByDoctor(doctorStats);
      setWeeklyAttendance(weeklyStats);
      setRevenueEvolution(revenueStats);
      setConsultationEvolution(consultationStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!statistics) return;
    
    const csvContent = statisticsService.exportToCSV(statistics, selectedPeriod);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_cabinet_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    const period = periods.find(p => p.value === selectedPeriod);
    if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
      return `Du ${new Date(customStartDate).toLocaleDateString('fr-FR')} au ${new Date(customEndDate).toLocaleDateString('fr-FR')}`;
    }
    return period?.label || 'Période inconnue';
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder aux statistiques.
          </p>
          <p className="text-sm text-gray-500">
            Seuls les médecins et administrateurs peuvent consulter cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour au tableau de bord</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exporter CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
             {clinicInfo?.logo ? (
               <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
               <BarChart3 className="h-8 w-8 text-blue-600" />
             )}
            </div>
            <div>
             <h1 className="text-3xl font-bold text-gray-900">Statistiques de {clinicInfo?.nom || 'la Structure'}</h1>
              <p className="text-gray-600">Analyse des performances et activités médicales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres temporels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 print:hidden">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Période d'analyse</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {periods.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {selectedPeriod === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Période sélectionnée */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Statistiques pour : {getPeriodLabel()}
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : statistics ? (
          <>
            {/* Statistiques clés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Patients vus</p>
                    <p className="text-3xl font-bold text-blue-600">{statistics.patientsVus}</p>
                  </div>
                  <Users className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Consultations</p>
                    <p className="text-3xl font-bold text-green-600">{statistics.consultationsEffectuees}</p>
                  </div>
                  <FileText className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux de présence</p>
                    <p className="text-3xl font-bold text-purple-600">{statistics.tauxPresence}%</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total encaissé</p>
                    <p className="text-3xl font-bold text-green-600">
                      <FormatFCAF montant={statistics.totalEncaisse} />
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">RDV planifiés</p>
                    <p className="text-3xl font-bold text-blue-600">{statistics.rendezVousPlanifies}</p>
                  </div>
                  <Calendar className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">RDV honorés</p>
                    <p className="text-3xl font-bold text-green-600">{statistics.rendezVousHonores}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">RDV annulés</p>
                    <p className="text-3xl font-bold text-red-600">{statistics.rendezVousAnnules}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Factures impayées</p>
                    <p className="text-3xl font-bold text-orange-600">
                      <FormatFCAF montant={statistics.montantDu} />
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Documents médicaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certificats émis</p>
                    <p className="text-3xl font-bold text-purple-600">{statistics.certificatsEmis}</p>
                  </div>
                  <Award className="h-10 w-10 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Bulletins d'analyse</p>
                    <p className="text-3xl font-bold text-orange-600">{statistics.bulletinsAnalyse}</p>
                  </div>
                  <TestTube className="h-10 w-10 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Consultations par médecin */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultations par médecin</h3>
                <div className="space-y-3">
                  {consultationsByDoctor.map((doctor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: doctor.color }}
                        ></div>
                        <span className="text-sm text-gray-700">{doctor.doctorName}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{doctor.consultations}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fréquentation par jour */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fréquentation par jour</h3>
                <div className="space-y-3">
                  {weeklyAttendance.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.max(10, (day.consultations / Math.max(...weeklyAttendance.map(d => d.consultations))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 w-8 text-right">{day.consultations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Évolution des consultations */}
            {consultationEvolution.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des consultations</h3>
                <div className="space-y-2">
                  {consultationEvolution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(item.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="font-medium text-gray-900">{item.consultations} consultations</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Évolution des encaissements */}
            {revenueEvolution.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des encaissements</h3>
                <div className="space-y-2">
                  {revenueEvolution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(item.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="font-medium text-green-600">
                        <FormatFCAF montant={item.amount} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-600">
              Les statistiques ne peuvent pas être affichées pour la période sélectionnée.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};