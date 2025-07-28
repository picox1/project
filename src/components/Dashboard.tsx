import React, { useState, useEffect } from 'react';
import FormatFCAF from './FormatFCAF';
import { ClinicService } from '../services/clinicService';
import { 
  User, 
  LogOut, 
  Calendar, 
  FileText, 
  Users, 
  Settings,
  Activity,
  Stethoscope,
  Clock,
  UserCheck,
  ArrowRight,
  CreditCard,
  FileCheck,
  Award,
  BarChart3,
  Bell,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Download,
  Shield,
  Building
} from 'lucide-react';
import { User as UserType } from '../types/user';
import { PatientService } from '../services/patientService';
import { AppointmentService } from '../services/appointmentService';
import { ConsultationService } from '../services/consultationService';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  onNavigateToPatients: () => void;
  onNavigateToAppointments?: () => void;
  onNavigateToConsultations?: () => void;
  onNavigateToPrescriptions?: () => void;
  onNavigateToCertificates?: () => void;
  onNavigateToAnalyses?: () => void;
  onNavigateToStatistics?: () => void;
  onNavigateToBilling?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToUsers?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { user, onLogout, onNavigateToPatients } = props;
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    consultationsToday: 0,
    appointmentsHonored: 0,
    appointmentsCancelled: 0,
    appointmentsPending: 0,
    revenueToday: 0,
    unpaidInvoices: 0,
    patientsThisWeek: 0,
    peakHour: '09:00'
  });
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [upcomingConsultations, setUpcomingConsultations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const patientService = PatientService.getInstance();
  const appointmentService = AppointmentService.getInstance();
  const consultationService = ConsultationService.getInstance();
  const clinicService = ClinicService.getInstance();

  useEffect(() => {
    loadDashboardData();
    loadClinicInfo();
  }, []);

  const loadClinicInfo = () => {
    const info = clinicService.getClinicInfo();
    setClinicInfo(info);
  };

  const loadDashboardData = () => {
    // Charger les statistiques
    const todayConsultations = consultationService.getTodayConsultations();
    const todayAppointments = appointmentService.getTodayAppointments();
    const weekConsultations = consultationService.getWeekConsultations();
    
    const honored = todayAppointments.filter(a => a.statut === 'Terminé').length;
    const cancelled = todayAppointments.filter(a => a.statut === 'Annulé').length;
    const pending = todayAppointments.filter(a => a.statut === 'Confirmé').length;

    setStats({
      consultationsToday: todayConsultations.length,
      appointmentsHonored: honored,
      appointmentsCancelled: cancelled,
      appointmentsPending: pending,
      revenueToday: Math.floor(Math.random() * 200000) + 50000, // Simulation en F CFA
      unpaidInvoices: Math.floor(Math.random() * 500000) + 100000, // Simulation en F CFA
      patientsThisWeek: new Set(weekConsultations.map(c => c.patient_id)).size,
      peakHour: '14:00' // Simulation
    });

    // Charger les derniers patients consultés (simulation)
    const allPatients = patientService.getAllPatients();
    setRecentPatients(allPatients.slice(0, 5));

    // Charger les prochaines consultations
    const upcoming = appointmentService.getUpcomingAppointments().slice(0, 5);
    setUpcomingConsultations(upcoming);

    // Générer des notifications
    generateNotifications();
  };

  const generateNotifications = () => {
    const notifs = [
      {
        id: 1,
        type: 'warning',
        title: 'Patient avec allergie',
        message: 'Marie Dupont - Allergie aux pénicillines',
        time: '10 min'
      },
      {
        id: 2,
        type: 'info',
        title: 'Prochain RDV',
        message: 'Pierre Martin dans 30 minutes',
        time: '30 min'
      },
      {
        id: 3,
        type: 'error',
        title: 'Facture impayée',
        message: 'Facture #F2024-001 en retard de 15 jours',
        time: '2h'
      }
    ];
    setNotifications(notifs);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'médecin':
        return <Stethoscope className="h-6 w-6" />;
      case 'infirmière':
        return <UserCheck className="h-6 w-6" />;
      case 'spécialiste':
        return <Activity className="h-6 w-6" />;
      case 'admin':
        return <Settings className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'médecin':
        return 'from-blue-500 to-blue-600';
      case 'infirmière':
        return 'from-green-500 to-green-600';
      case 'spécialiste':
        return 'from-purple-500 to-purple-600';
      case 'admin':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleAccentColor = (role: string) => {
    switch (role) {
      case 'médecin':
        return 'blue';
      case 'infirmière':
        return 'green';
      case 'spécialiste':
        return 'purple';
      case 'admin':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'médecin':
        return 'Prêt à consulter vos patients aujourd\'hui ?';
      case 'infirmière':
        return 'Votre équipe vous attend pour les soins du jour.';
      case 'spécialiste':
        return 'Vos examens spécialisés sont planifiés.';
      case 'admin':
        return 'Tableau de bord administratif à votre disposition.';
      default:
        return 'Bienvenue dans votre espace de travail.';
    }
  };

  const accentColor = getRoleAccentColor(user.role);

  const quickActions = [
    { 
      icon: Calendar, 
      label: 'Rendez-vous', 
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToAppointments?.(),
      available: ['médecin', 'infirmière', 'spécialiste'].includes(user.role)
    },
    { 
      icon: FileText, 
      label: 'Patients', 
      color: `bg-${accentColor}-500`, 
      onClick: onNavigateToPatients,
      available: ['médecin', 'infirmière', 'spécialiste'].includes(user.role)
    },
    { 
      icon: Stethoscope, 
      label: 'Consultations', 
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToConsultations?.(),
      available: ['médecin', 'infirmière', 'spécialiste'].includes(user.role)
    },
    { 
      icon: CreditCard, 
      label: 'Facturation', 
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToBilling?.(),
      available: ['médecin', 'admin'].includes(user.role)
    },
    { 
      icon: FileCheck, 
      label: 'Ordonnances', 
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToPrescriptions?.(),
      available: ['médecin', 'spécialiste'].includes(user.role)
    },
    { 
      icon: Award, 
      label: 'Certificats',
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToCertificates?.(),
      available: ['médecin', 'spécialiste'].includes(user.role)
    },
    { 
      icon: BarChart3, 
      label: 'Bulletins d\'analyses',
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToAnalyses?.(),
      available: ['médecin', 'infirmière', 'spécialiste'].includes(user.role)
    },
    { 
      icon: BarChart3, 
      label: 'Statistiques',
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToStatistics?.(),
      available: ['médecin', 'admin'].includes(user.role)
    },
    { 
      icon: Users, 
      label: 'Équipe', 
      color: `bg-${accentColor}-500`, 
      onClick: () => props.onNavigateToUsers?.(),
      available: user.role === 'admin'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-r ${getRoleColor(user.role)} p-2 rounded-lg`}>
                {clinicInfo?.logo ? (
                  <img src={clinicInfo.logo} alt="Logo" className="h-6 w-6 object-contain" />
                ) : (
                  <Stethoscope className="h-6 w-6 text-white" />
                )}
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {clinicInfo?.nom || 'Cabinet Médical'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notif.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                              <p className="text-sm text-gray-600">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">Il y a {notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="h-6 w-6" />
                </button>
                
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Mon compte</span>
                      </button>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => props.onNavigateToUsers?.()}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                        >
                          <Users className="h-4 w-4" />
                          <span>Gestion des utilisateurs</span>
                        </button>
                      )}
                      <button 
                        onClick={() => props.onNavigateToSettings?.()}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                      >
                        <Building className="h-4 w-4" />
                        <span>Paramètres du cabinet</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Exporter les données</span>
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Sauvegarde</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                <div className={`p-2 rounded-full text-white bg-${accentColor}-500`}>
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className={`bg-gradient-to-r ${getRoleColor(user.role)} rounded-2xl p-8 text-white mb-8 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Bonjour, {user.prenom} !
              </h2>
              <p className="text-white/90 text-lg">
                {getWelcomeMessage(user.role)}
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium capitalize">{user.role}</span>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-sm">
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 p-6 rounded-full">
                {getRoleIcon(user.role)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Accès rapide</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.filter(action => action.available !== false).map((action, index) => (
                  <div
                    key={index}
                    onClick={action.onClick}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 group"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-lg text-white ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{action.label}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Patients */}
            {/* Upcoming Consultations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Prochaines consultations aujourd'hui</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Planning complet
                </button>
              </div>
              {upcomingConsultations.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucune consultation prévue aujourd'hui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingConsultations.map((consultation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-${accentColor}-100`}>
                          <Clock className={`h-4 w-4 text-${accentColor}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{consultation.patient_prenom} {consultation.patient_nom}</p>
                          <p className="text-sm text-gray-500">
                            {consultation.heure_du_rendez_vous} - {consultation.motif}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${accentColor}-100 text-${accentColor}-800`}>
                        {consultation.statut}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Patients */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Patients consultés aujourd'hui</h3>
                <button 
                  onClick={() => props.onNavigateToConsultations?.()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Historique du jour
                </button>
              </div>
              {recentPatients.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>Aucun patient consulté aujourd'hui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPatients.map((patient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full bg-${accentColor}-100`}>
                          <User className={`h-4 w-4 text-${accentColor}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.prenom} {patient.nom}</p>
                          <p className="text-sm text-gray-500">{patient.numero_dossier}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Statistiques du jour</h3>
            
            {/* Today's Stats */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.consultationsToday}</p>
                    <p className="text-gray-600 text-sm">Consultations aujourd'hui</p>
                  </div>
                  <Stethoscope className={`h-8 w-8 text-${accentColor}-500`} />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.appointmentsHonored}</p>
                    <p className="text-gray-600 text-sm">RDV honorés</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.appointmentsCancelled}</p>
                    <p className="text-gray-600 text-sm">RDV annulés</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      <FormatFCAF montant={stats.revenueToday} />
                    </p>
                    <p className="text-gray-600 text-sm">Encaissé aujourd'hui</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      <FormatFCAF montant={stats.unpaidInvoices} />
                    </p>
                    <p className="text-gray-600 text-sm">Factures impayées</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.patientsThisWeek}</p>
                    <p className="text-gray-600 text-sm">Patients cette semaine</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{stats.peakHour}</p>
                    <p className="text-gray-600 text-sm">Heure de pointe</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* Appointment Status Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-4">Rendez-vous aujourd'hui</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confirmés</span>
                  <span className="font-medium text-blue-600">{stats.appointmentsPending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Terminés</span>
                  <span className="font-medium text-green-600">{stats.appointmentsHonored}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Annulés</span>
                  <span className="font-medium text-red-600">{stats.appointmentsCancelled}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">
                      {stats.appointmentsPending + stats.appointmentsHonored + stats.appointmentsCancelled}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};