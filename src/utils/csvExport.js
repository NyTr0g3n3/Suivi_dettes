import { formatCurrency, formatDate } from './formatters';

export const exportContactTransactionsToCSV = (contact, transactions) => {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  // CSV Headers
  const headers = [
    'Date',
    'Description',
    'Type',
    'Montant',
    'Montant remboursé',
    'Reste à rembourser',
    'Statut'
  ];

  // Convert transactions to CSV rows
  const rows = sortedTransactions.map(transaction => {
    const remaining = transaction.amount - (transaction.paidAmount || 0);
    const isPaid = remaining === 0;
    const category = transaction.category === 'emprunté' ? 'Emprunté' : 'Prêté';

    return [
      formatDate(new Date(transaction.date)),
      `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes in description
      category,
      transaction.amount,
      transaction.paidAmount || 0,
      remaining,
      isPaid ? 'Remboursé' : 'En cours'
    ];
  });

  // Create CSV content
  const csvContent = [
    // Add contact info header
    `Contact: ${contact.name}`,
    `Date d'export: ${formatDate(new Date())}`,
    '', // Empty line
    // Add column headers
    headers.join(','),
    // Add data rows
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const fileName = `transactions_${contact.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
