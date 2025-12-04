import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

function TransferTransactionModal({ transaction, contacts, currentContactId, onClose, onTransfer }) {
  const [selectedContactId, setSelectedContactId] = useState('');

  // Filter out the current contact from the list
  const availableContacts = contacts.filter(c => c.id !== currentContactId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedContactId) return;
    onTransfer(transaction.id, selectedContactId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-enter">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Transférer la transaction
        </h2>

        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Transaction à transférer:
          </p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {transaction.description}
          </p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(new Date(transaction.date))}
          </p>
          {transaction.paidAmount > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Déjà remboursé: {formatCurrency(transaction.paidAmount)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transférer vers
            </label>
            {availableContacts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm py-2">
                Aucun autre contact disponible
              </p>
            ) : (
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                autoFocus
              >
                <option value="">Sélectionner un contact</option>
                {availableContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={availableContacts.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transférer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferTransactionModal;
