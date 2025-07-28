import React, { useState } from 'react';
import { User, Stethoscope, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { LoginCredentials } from '../types/user';
import { ClinicService } from '../services/clinicService';

interface LoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [clinicInfo] = useState(() => {
    const clinicService = ClinicService.getInstance();
    return clinicService.getClinicInfo();
  });
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: '',
    mot_de_passe: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onLogin(credentials);
      if (!success) {
        setError('Identifiants invalides. Veuillez vérifier votre login et mot de passe.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Effacer l'erreur lors de la saisie
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              {clinicInfo?.logo ? (
                <img src={clinicInfo.logo} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <Stethoscope className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {clinicInfo?.nom || 'Cabinet Médical'}
          </h1>
          <p className="text-gray-600">Connexion au système de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">
              Identifiant
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="login"
                value={credentials.login}
                onChange={(e) => handleInputChange('login', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Entrez votre identifiant"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={credentials.mot_de_passe}
                onChange={(e) => handleInputChange('mot_de_passe', e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Entrez votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !credentials.login || !credentials.mot_de_passe}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connexion...</span>
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Comptes de démonstration :</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>👨‍⚕️ Médecin: jmartin / medecin123</div>
            <div>👩‍⚕️ Infirmière: mdubois / infirmiere123</div>
            <div>🔬 Spécialiste: pbernard / specialiste123</div>
            <div>⚙️ Admin: sleroy / admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
};