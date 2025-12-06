import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

function AddPaymentModal({ contact, unpaidDebts, onClose, onAdd }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate how the payment would be allocated
  const calculateAllocation = () => {
    let remainingAmount = parseFloat(amount) || 0;
    const allocations = [];

    // Sort debts by date (oldest first)
    const sortedDebts = [...unpaidDebts].sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    for (const debt of sortedDebts) {
      if (remainingAmount <= 0) break;

      const outstandingAmount = debt.amount - (debt.paidAmount || 0);
      const amountToAllocate = Math.min(remainingAmount, outstandingAmount);

      allocations.push({
        debt,
        amount: amountToAllocate,
        willBeFullyPaid: amountToAllocate >= outstandingAmount
      });

      remainingAmount -= amountToAllocate;
    }

    return { allocations, remainingAmount };
  };

  const { allocations, remainingAmount } = calculateAllocation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) return;

    setLoading(true);
    try {
      await onAdd(paymentAmount);
    } finally {
      setLoading(false);
    }
  };

  const totalDebt = unpaidDebts.reduce((sum, debt) =>
    sum + (debt.amount - (debt.paidAmount || 0)), 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Encaissement
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Contact Info */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compte</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{contact.name}</p>
              <p className="text-sm text-red-600 dark:text-red-500 mt-2">
                Dette totale : {formatCurrency(totalDebt)}
              </p>
            </div>

            {/* Payment Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Montant encaissé
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>

            {/* Allocation Preview */}
            {allocations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Affectation automatique
                </h3>
                <div className="space-y-2">
                  {allocations.map((allocation, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {allocation.debt.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(allocation.debt.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-500">
                            {formatCurrency(allocation.amount)}
                          </p>
                          {allocation.willBeFullyPaid && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ✓ Soldée
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {remainingAmount > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Montant restant non affecté : {formatCurrency(remainingAmount)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No debts warning */}
            {unpaidDebts.length === 0 && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Aucune dette en cours pour ce compte
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0 || unpaidDebts.length === 0}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPaymentModal;
