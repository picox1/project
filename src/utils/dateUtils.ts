/**
 * Utilitaires pour la gestion des dates
 */

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date non renseignée';
  
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date invalide';
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date non renseignée';
  
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date invalide';
  }
};

export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return 'Heure non renseignée';
  
  try {
    // Si c'est déjà au format HH:MM, on le retourne tel quel
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    
    // Sinon, on essaie de parser et formater
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Heure invalide';
  }
};

export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};