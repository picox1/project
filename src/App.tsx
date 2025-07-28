import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { PatientManagement } from './components/PatientManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { ConsultationManagement } from './components/ConsultationManagement';
import { PrescriptionManagement } from './components/PrescriptionManagement';
import { CertificateManagement } from './components/CertificateManagement';
import { AnalysisManagement } from './components/AnalysisManagement';
import { StatisticsPage } from './components/StatisticsPage';
import { BillingManagement } from './components/BillingManagement';
import { SettingsPage } from './components/SettingsPage';
import { UserManagementPage } from './components/UserManagementPage';
import { AuthService } from './services/auth';
import { User, LoginCredentials } from './types/user';

type AppView = 'dashboard' | 'patients' | 'appointments' | 'consultations' | 'prescriptions' | 'certificates' | 'analyses' | 'statistics' | 'billing' | 'settings' | 'users';
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  
  const authService = AuthService.getInstance();

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login(credentials);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('dashboard');
  };

  const handleNavigateToPatients = () => {
    setCurrentView('patients');
  };

  const handleNavigateToAppointments = () => {
    setCurrentView('appointments');
  };

  const handleNavigateToConsultations = () => {
    setCurrentView('consultations');
  };

  const handleNavigateToPrescriptions = () => {
    setCurrentView('prescriptions');
  };

  const handleNavigateToCertificates = () => {
    setCurrentView('certificates');
  };

  const handleNavigateToAnalyses = () => {
    setCurrentView('analyses');
  };

  const handleNavigateToBilling = () => {
    setCurrentView('billing');
  };

  const handleNavigateToSettings = () => {
    setCurrentView('settings');
  };

  const handleNavigateToUsers = () => {
    setCurrentView('users');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <>
          {currentView === 'dashboard' && (
            <Dashboard 
              user={user} 
              onLogout={handleLogout}
              onNavigateToPatients={handleNavigateToPatients}
              onNavigateToAppointments={handleNavigateToAppointments}
              onNavigateToConsultations={handleNavigateToConsultations}
             onNavigateToPrescriptions={handleNavigateToPrescriptions}
              onNavigateToCertificates={handleNavigateToCertificates}
              onNavigateToAnalyses={handleNavigateToAnalyses}
              onNavigateToStatistics={() => setCurrentView('statistics')}
              onNavigateToBilling={handleNavigateToBilling}
              onNavigateToSettings={handleNavigateToSettings}
              onNavigateToUsers={handleNavigateToUsers}
            />
          )}
          {currentView === 'patients' && (
            <PatientManagement 
              user={user} 
              onBackToDashboard={handleBackToDashboard}
            />
          )}
          {currentView === 'appointments' && (
            <AppointmentManagement 
              user={user} 
              onBackToDashboard={handleBackToDashboard}
            />
          )}
          {currentView === 'consultations' && (
            <ConsultationManagement 
              user={user} 
              onBackToDashboard={handleBackToDashboard}
            />
          )}
        {currentView === 'prescriptions' && (
          <PrescriptionManagement 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {currentView === 'certificates' && (
          <CertificateManagement 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {currentView === 'analyses' && (
          <AnalysisManagement 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {currentView === 'statistics' && (
          <StatisticsPage 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {currentView === 'billing' && (
          <BillingManagement 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {currentView === 'settings' && (
          <SettingsPage 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        {currentView === 'users' && (
          <UserManagementPage 
            user={user} 
            onBackToDashboard={handleBackToDashboard}
          />
        )}
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;