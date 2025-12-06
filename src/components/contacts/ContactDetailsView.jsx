import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { deleteTransaction, addRepayment, transferTransaction } from '../../services/transactionsService';
import { updateContact } from '../../services/contactsService';
import { subscribeToCategoriesByContact, addCategory, deleteCategory, addSavingsOperation, updateSavingsOperation } from '../../services/savingsService';
import { showToast } from '../../utils/toast';
import { exportContactTransactionsToPDF } from '../../utils/pdfExport';
import { exportContactTransactionsToCSV } from '../../utils/csvExport';
import AddRepaymentModal from '../modals/AddRepaymentModal';
import EditContactModal from '../modals/EditContactModal';
import TransferTransactionModal from '../modals/TransferTransactionModal';
import SavingsCategoryDetails from '../savings/SavingsCategoryDetails';
import AddSavingsOperationModal from '../modals/AddSavingsOperationModal';
import EditSavingsOperationModal from '../modals/EditSavingsOperationModal';

function ContactDetailsView({ contact, transactions, contacts, onBack, onEditTransaction, userId, allSavingsOperations }) {
  const [currentTab, setCurrentTab] = useState('loans'); // 'loans' or 'savings'
  const [searchQuery, setSearchQuery] = useState('');
  const [repayingTransaction, setRepayingTransaction] = useState(null);
  const [showEditContact, setShowEditContact] = useState(false);
  const [transferringTransaction, setTransferringTransaction] = useState(null);

  // Savings states
  const [savingsCategories, setSavingsCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [operationCategory, setOperationCategory] = useState(null);
  const [editingOperation, setEditingOperation] = useState(null);

  // Subscribe to savings categories for this contact
  useEffect(() => {
    const unsubscribe = subscribeToCategoriesByContact(userId, contact.id, setSavingsCategories);
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
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-3"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {contact.name}
            </h2>
            <button
              onClick={() => setShowEditContact(true)}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              title="Modifier le contact"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          {currentTab === 'loans' ? (
            <>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {balance >= 0 ? 'vous doit' : 'vous devez'}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalSavingsBalance)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Épargne totale
              </p>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mt-4">
          <button
            onClick={() => setCurrentTab('loans')}
            className={`px-4 py-2 font-medium transition ${
              currentTab === 'loans'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            💸 Prêts
          </button>
          <button
            onClick={() => setCurrentTab('savings')}
            className={`px-4 py-2 font-medium transition ${
              currentTab === 'savings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            🏦 Épargne {hasSavings && `(${savingsCategories.length})`}
          </button>
        </div>
      </div>

      {/* Loans Tab Content */}
      {currentTab === 'loans' && (
        <>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une transaction..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={handleExportPDF}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              📄 Exporter en PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              📊 Exporter en CSV
            </button>
          </div>

          {/* Transactions List */}
          {contactTransactions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Aucune transaction trouvée' : 'Aucune transaction'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contactTransactions.map(transaction => {
                const remaining = transaction.amount - (transaction.paidAmount || 0);
                const isPaid = remaining === 0;
                const isDebt = !transaction.category || transaction.category === 'prêté' || transaction.category !== 'emprunté';

                return (
                  <div
                    key={transaction.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.category && (
                          <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                            transaction.category === 'emprunté'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {transaction.category === 'emprunté' ? 'Emprunté' : 'Prêté'}
                          </span>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${
                          isPaid
                            ? 'text-gray-400 dark:text-gray-500 line-through'
                            : isDebt
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        {!isPaid && transaction.paidAmount > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Reste: {formatCurrency(remaining)}
                          </p>
                        )}
                        {isPaid && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            ✓ Remboursé
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => onEditTransaction(transaction)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => setTransferringTransaction(transaction)}
                        className="flex-1 px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-200 rounded hover:bg-purple-100 dark:hover:bg-purple-800 transition"
                        title="Transférer vers un autre contact"
                      >
                        🔄 Transférer
                      </button>
                      {!isPaid && (
                        <button
                          onClick={() => setRepayingTransaction(transaction)}
                          className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 rounded hover:bg-green-100 dark:hover:bg-green-800 transition"
                        >
                          💵 Remboursement
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded hover:bg-red-100 dark:hover:bg-red-800 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Savings Tab Content */}
      {currentTab === 'savings' && (
        <>
          {/* Add Category Button */}
          {hasSavings && (
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium mb-4"
            >
              ➕ Nouvelle catégorie
            </button>
          )}

          {/* Categories List */}
          {!hasSavings ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-6xl mb-4">🏦</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Aucune épargne pour {contact.name}
              </p>
              <button
                onClick={() => setShowAddCategory(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
              >
                ➕ Ouvrir un compte épargne
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {categoriesWithBalances.map(category => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition p-4"
                >
                  <div className="flex justify-between items-center">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-purple-600 dark:hover:text-purple-400 transition">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.operationCount} opération{category.operationCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div
                      className="text-right cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(category.balance || 0)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="ml-4 text-gray-400 hover:text-red-600 transition"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Category Modal */}
          {showAddCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Nouvelle catégorie d'épargne
                </h2>
                <form onSubmit={handleAddCategory}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la catégorie"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
    </div>
  );
}

export default ContactDetailsView;
