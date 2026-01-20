import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { deleteTransaction, addRepayment, transferTransaction } from '../../services/transactionsService';
import { updateContact } from '../../services/contactsService';
import { subscribeToCategoriesByContact, addCategory, deleteCategory, addSavingsOperation, updateSavingsOperation } from '../../services/savingsService';
import { processPayment, subscribeToPayments } from '../../services/paymentsService';
import { showToast } from '../../utils/toast';
import { exportContactTransactionsToPDF } from '../../utils/pdfExport';
import { exportContactTransactionsToCSV } from '../../utils/csvExport';
import AddRepaymentModal from '../modals/AddRepaymentModal';
import AddPaymentModal from '../modals/AddPaymentModal';
import EditContactModal from '../modals/EditContactModal';
import TransferTransactionModal from '../modals/TransferTransactionModal';
import TransactionDetailsModal from '../modals/TransactionDetailsModal';
import SavingsCategoryDetails from '../savings/SavingsCategoryDetails';
import AddSavingsOperationModal from '../modals/AddSavingsOperationModal';
import EditSavingsOperationModal from '../modals/EditSavingsOperationModal';
import SwipeableTransactionCard from '../transactions/SwipeableTransactionCard';

function ContactDetailsView({ contact, transactions, contacts, onBack, onEditTransaction, userId, allSavingsOperations }) {
  const [currentTab, setCurrentTab] = useState('loans'); // 'loans' or 'savings'
  const [searchQuery, setSearchQuery] = useState('');
  const [repayingTransaction, setRepayingTransaction] = useState(null);
  const [showEditContact, setShowEditContact] = useState(false);
  const [transferringTransaction, setTransferringTransaction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);

  // Savings states
  const [savingsCategories, setSavingsCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [operationCategory, setOperationCategory] = useState(null);
  const [editingOperation, setEditingOperation] = useState(null);

  // Payment history
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Subscribe to savings categories for this contact
  useEffect(() => {
    const unsubscribe = subscribeToCategoriesByContact(userId, contact.id, setSavingsCategories);
    return () => unsubscribe();
  }, [userId, contact.id]);

  // Subscribe to payment history for this contact
  useEffect(() => {
    const unsubscribe = subscribeToPayments(userId, contact.id, setPaymentHistory);
    return () => unsubscribe();
  }, [userId, contact.id]);

  const contactTransactions = transactions
    .filter(t => t.contactId === contact.id)
    .filter(t =>
      searchQuery === '' ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDeleteTransaction = async (transactionId) => {
    if (!confirm('Supprimer cette transaction ?')) return;

    try {
      await deleteTransaction(transactionId);
      showToast('Transaction supprimée', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleAddRepayment = async (transactionId, amount, date) => {
    try {
      await addRepayment(transactionId, amount);
      showToast('Remboursement enregistré', 'success');
      setRepayingTransaction(null);
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleEditContact = async (contactId, updates) => {
    try {
      await updateContact(contactId, updates);
      showToast('Contact modifié', 'success');
      setShowEditContact(false);
    } catch (error) {
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const handleTransferTransaction = async (transactionId, newContactId) => {
    try {
      await transferTransaction(transactionId, newContactId);
      showToast('Transaction transférée', 'success');
      setTransferringTransaction(null);
    } catch (error) {
      showToast('Erreur lors du transfert', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      exportContactTransactionsToPDF(contact, contactTransactions);
      showToast('PDF exporté avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'export PDF', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      exportContactTransactionsToCSV(contact, contactTransactions);
      showToast('CSV exporté avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'export CSV', 'error');
    }
  };

  // Savings handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await addCategory(userId, contact.id, newCategoryName);
      showToast('Catégorie ajoutée', 'success');
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (error) {
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Supprimer cette catégorie et toutes ses opérations ?')) return;

    try {
      await deleteCategory(categoryId);
      showToast('Catégorie supprimée', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleAddOperation = async (operationData) => {
    try {
      await addSavingsOperation(userId, operationData);
      showToast('Opération ajoutée', 'success');
      setShowAddOperation(false);
      setOperationCategory(null);
    } catch (error) {
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleEditOperation = async (operationId, oldData, newData) => {
    try {
      await updateSavingsOperation(operationId, oldData, newData);
      showToast('Opération modifiée', 'success');
      setEditingOperation(null);
    } catch (error) {
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const handleProcessPayment = async (paymentAmount) => {
    try {
      const result = await processPayment(userId, contact.id, paymentAmount);

      if (result.remainingAmount > 0) {
        showToast(`Encaissement enregistré. Reste ${formatCurrency(result.remainingAmount)} non affecté`, 'success');
      } else {
        showToast(`Encaissement de ${formatCurrency(paymentAmount)} traité avec succès`, 'success');
      }

      setShowPaymentModal(false);
    } catch (error) {
      showToast(error.message || 'Erreur lors du traitement', 'error');
    }
  };

  const totalOwed = contactTransactions
    .filter(t => !t.category || t.category === 'prêté' || t.category !== 'emprunté')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

  const totalBorrowed = contactTransactions
    .filter(t => t.category === 'emprunté')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

  const balance = totalOwed - totalBorrowed;

  const categoriesWithBalances = savingsCategories.map(category => {
    const categoryOps = allSavingsOperations.filter(op => op.categoryId === category.id);
    const calcBalance = categoryOps.reduce((sum, op) => {
      const amount = op.amount || 0;
      return op.type === 'withdrawal' ? sum - amount : sum + amount;
    }, 0);

    return {
      ...category,
      balance: calcBalance,
      operationCount: categoryOps.length
    };
  });

  const totalSavingsBalance = categoriesWithBalances.reduce((sum, c) => sum + (c.balance || 0), 0);
  const hasSavings = savingsCategories.length > 0;

  // Calculate unpaid debts for payment modal (what the contact owes)
  const unpaidDebts = contactTransactions
    .filter(t => {
      // Only debts (prêté or no category) that are not fully paid
      const isDebt = !t.category || t.category === 'prêté' || t.category !== 'emprunté';
      const hasBalance = (t.paidAmount || 0) < t.amount;
      return isDebt && hasBalance;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // If viewing category details
  if (selectedCategory) {
    return (
      <>
        <SavingsCategoryDetails
          category={selectedCategory}
          operations={allSavingsOperations}
          onBack={() => setSelectedCategory(null)}
          onAddOperation={(cat) => {
            setOperationCategory(cat);
            setShowAddOperation(true);
          }}
          onEditOperation={setEditingOperation}
        />
        {showAddOperation && operationCategory && (
          <AddSavingsOperationModal
            category={operationCategory}
            onClose={() => {
              setShowAddOperation(false);
              setOperationCategory(null);
            }}
            onAdd={handleAddOperation}
          />
        )}
        {editingOperation && (
          <EditSavingsOperationModal
            operation={editingOperation}
            onClose={() => setEditingOperation(null)}
            onSave={handleEditOperation}
          />
        )}
      </>
    );
  }

  return (
    <div>
      {/* Header with Back Button - iOS 26 Style */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base">Retour</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {contact.name}
            </h2>
            <button
              onClick={() => setShowEditContact(true)}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Modifier le contact"
            >
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          {currentTab === 'loans' ? (
            <>
              <p className={`text-4xl font-semibold ${balance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {balance >= 0 ? 'vous doit' : 'vous devez'}
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalSavingsBalance)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Épargne totale
              </p>
            </>
          )}
        </div>

        {/* Tabs - iOS 26 Style */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setCurrentTab('loans')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              currentTab === 'loans'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Prêts
          </button>
          <button
            onClick={() => setCurrentTab('savings')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              currentTab === 'savings'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Épargne {hasSavings && `(${savingsCategories.length})`}
          </button>
        </div>
      </div>

      {/* Loans Tab Content */}
      {currentTab === 'loans' && (
        <>
          {/* Search and Export - iOS 26 Style */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-4">
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une transaction..."
                className="w-full px-4 py-2.5 pl-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={unpaidDebts.length === 0}
                className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Encaissement
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
            </div>
          </div>

          {/* Payment History Section */}
          {paymentHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Historique des encaissements
              </h3>
              <div className="space-y-2">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-base font-semibold text-green-600 dark:text-green-500">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    {payment.allocations && payment.allocations.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {payment.allocations.map((allocation, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <p className="text-gray-600 dark:text-gray-400">
                              → {allocation.description}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {formatCurrency(allocation.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {payment.remainingAmount > 0 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                        Non affecté : {formatCurrency(payment.remainingAmount)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions List - Swipeable Cards */}
          {contactTransactions.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-6xl mb-4 opacity-30">📝</div>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Aucune transaction trouvée' : 'Aucune transaction'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {contactTransactions.map((transaction) => (
                <SwipeableTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={handleDeleteTransaction}
                  onPay={setRepayingTransaction}
                  onEdit={onEditTransaction}
                  onTransfer={setTransferringTransaction}
                  onViewDetails={setViewingTransaction}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Savings Tab Content - iOS 26 Style */}
      {currentTab === 'savings' && (
        <>
          {/* Add Category Button */}
          {hasSavings && (
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full py-3 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium mb-4"
            >
              + Nouvelle catégorie
            </button>
          )}

          {/* Categories List */}
          {!hasSavings ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-6xl mb-4 opacity-30">🏦</div>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Aucune épargne pour {contact.name}
              </p>
              <button
                onClick={() => setShowAddCategory(true)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Ouvrir un compte épargne
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {categoriesWithBalances.map(category => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {category.operationCount} opération{category.operationCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className="text-right cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(category.balance || 0)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Category Modal */}
          {showAddCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Nouvelle catégorie d'épargne
                </h2>
                <form onSubmit={handleAddCategory}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la catégorie"
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl mb-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-300 transition-colors font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Repayment Modal */}
      {repayingTransaction && (
        <AddRepaymentModal
          transaction={repayingTransaction}
          onClose={() => setRepayingTransaction(null)}
          onAdd={handleAddRepayment}
        />
      )}

      {/* Edit Contact Modal */}
      {showEditContact && (
        <EditContactModal
          contact={contact}
          onClose={() => setShowEditContact(false)}
          onSave={handleEditContact}
        />
      )}

      {/* Transfer Transaction Modal */}
      {transferringTransaction && (
        <TransferTransactionModal
          transaction={transferringTransaction}
          contacts={contacts}
          currentContactId={contact.id}
          onClose={() => setTransferringTransaction(null)}
          onTransfer={handleTransferTransaction}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <AddPaymentModal
          contact={contact}
          unpaidDebts={unpaidDebts}
          onClose={() => setShowPaymentModal(false)}
          onAdd={handleProcessPayment}
        />
      )}

      {/* Transaction Details Modal */}
      {viewingTransaction && (
        <TransactionDetailsModal
          transaction={viewingTransaction}
          onClose={() => setViewingTransaction(null)}
        />
      )}
    </div>
  );
}

export default ContactDetailsView;
