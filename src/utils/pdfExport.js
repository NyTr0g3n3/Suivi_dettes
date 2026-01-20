import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './formatters';

export const exportContactTransactionsToPDF = (contact, transactions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (neededSpace = 10) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Suivi des dettes', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Contact name
  doc.setFontSize(16);
  doc.text(`Contact: ${contact.name}`, margin, yPos);
  yPos += 10;

  // Calculate balances
  const totalOwed = transactions
    .filter(t => !t.category || t.category === 'prêté' || t.category !== 'emprunté')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

  const totalBorrowed = transactions
    .filter(t => t.category === 'emprunté')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

  const balance = totalOwed - totalBorrowed;

  // Balance summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Montant total: ${formatCurrency(Math.abs(balance))} ${balance >= 0 ? '(vous doit)' : '(vous devez)'}`, margin, yPos);
  yPos += 8;
  doc.text(`Date d'export: ${formatDate(new Date())}`, margin, yPos);
  yPos += 15;

  // Transactions header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Transactions', margin, yPos);
  yPos += 8;

  // Check if there are any transactions
  if (transactions.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.text('Aucune transaction', margin, yPos);
  } else {
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Transaction list
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    sortedTransactions.forEach((transaction, index) => {
      const remaining = transaction.amount - (transaction.paidAmount || 0);
      const isPaid = remaining === 0;
      const isDebt = !transaction.category || transaction.category === 'prêté' || transaction.category !== 'emprunté';

      checkNewPage(25);

      // Transaction separator
      if (index > 0) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;
      }

      // Transaction description
      doc.setFont('helvetica', 'bold');
      doc.text(transaction.description, margin, yPos);
      yPos += 6;

      // Transaction details
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formatDate(new Date(transaction.date))}`, margin + 5, yPos);
      yPos += 5;

      // Category
      if (transaction.category) {
        const categoryText = transaction.category === 'emprunté' ? 'Emprunté' : 'Prêté';
        doc.text(`Type: ${categoryText}`, margin + 5, yPos);
        yPos += 5;
      }

      // Amount
      const amountText = `Montant: ${formatCurrency(transaction.amount)}`;
      doc.text(amountText, margin + 5, yPos);
      yPos += 5;

      // Repayment info
      if (transaction.paidAmount > 0) {
        doc.text(`Remboursé: ${formatCurrency(transaction.paidAmount)}`, margin + 5, yPos);
        yPos += 5;

        if (!isPaid) {
          doc.text(`Reste à rembourser: ${formatCurrency(remaining)}`, margin + 5, yPos);
          yPos += 5;
        }
      }

      // Status
      if (isPaid) {
        doc.setTextColor(0, 150, 0);
        doc.text('✓ Remboursé', margin + 5, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
      }

      yPos += 3;
    });
  }

  // Footer
  checkNewPage(15);
  yPos = pageHeight - margin;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Généré par Suivi des dettes', pageWidth / 2, yPos, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Save the PDF
  const fileName = `transactions_${contact.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
