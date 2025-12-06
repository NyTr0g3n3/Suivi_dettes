import { useState } from 'react';
import { getDateInputValue, formatCurrency } from '../../utils/formatters';

function AddRepaymentModal({ transaction, onClose, onAdd }) {
  const remaining = transaction.amount - (transaction.paidAmount || 0);

  const [formData, setFormData] = useState({
    amount: remaining.toString(),
    date: getDateInputValue()
  });

  const [isFullRepayment, setIsFullRepayment] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = isFullRepayment ? remaining : parseFloat(formData.amount);

    if (amount > remaining) {
      alert(`Le montant ne peut pas dépasser ${formatCurrency(remaining)}`);
      return;
    }

    onAdd(transaction.id, amount, formData.date);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-enter">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Enregistrer un remboursement
        </h2>

        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Transaction: {transaction.description}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Montant initial: {formatCurrency(transaction.amount)}
          </p>
          {transaction.paidAmount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà remboursé: {formatCurrency(transaction.paidAmount)}
            </p>
          )}
          <p className="text-lg font-bold text-green-600 mt-2">
            Reste à rembourser: {formatCurrency(remaining)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Repayment Type */}
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  checked={isFullRepayment}
                  onChange={() => setIsFullRepayment(true)}
                  className="text-green-600"
                />
                <span className="text-gray-900 dark:text-gray-100">
                  Remboursement total ({formatCurrency(remaining)})
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!isFullRepayment}
                  onChange={() => setIsFullRepayment(false)}
                  className="text-green-600"
                />
                <span className="text-gray-900 dark:text-gray-100">
                  Remboursement partiel
                </span>
              </label>
            </div>

            {/* Amount Input (if partial) */}
            {!isFullRepayment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Montant remboursé (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="50.00"
                  max={remaining}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            )}

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date du remboursement
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRepaymentModal;
