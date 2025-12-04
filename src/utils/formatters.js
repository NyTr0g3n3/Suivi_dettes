export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateFormat('fr-FR', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const getDateInputValue = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};
