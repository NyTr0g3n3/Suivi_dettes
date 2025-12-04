import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { deleteTransaction, addRepayment } from '../../services/transactionsService';
import { updateContact } from '../../services/contactsService';
import { showToast } from '../../utils/toast';
import AddRepaymentModal from '../modals/AddRepaymentModal';
import EditContactModal from '../modals/EditContactModal';

function ContactDetailsView({ contact, transactions, onBack, onEditTransaction }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [repayingTransaction, setRepayingTransaction] = useState(null);
  const [showEditContact, setShowEditContact] = useState(false);

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

  const totalOwed = contactTransactions
    .filter(t => !t.category || t.category === 'prêté' || t.category !== 'emprunté')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

  const totalBorrowed = contactTransactions
    .filter(t => t.category === 'emprunté')
    .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

  const balance = totalOwed - totalBorrowed;

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
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(balance))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {balance >= 0 ? 'vous doit' : 'vous devez'}
          </p>
        </div>
      </div>

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
    </div>
  );
}

export default ContactDetailsView;
