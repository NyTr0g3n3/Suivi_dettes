export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Fallback pour les navigateurs sans support Intl complet
    if (typeof Intl === 'undefined' || !Intl.DateFormat) {
      return date.toLocaleDateString('fr-FR');
    }

    return new Intl.DateFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Fallback pour les navigateurs sans support Intl complet
    if (typeof Intl === 'undefined' || !Intl.DateFormat) {
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    }

    return new Intl.DateFormat('fr-FR', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting short date:', error);
    return dateString;
  }
};

export const getDateInputValue = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};
