import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { subscribeToTransactionRepayments } from '../../services/repaymentsHistoryService';

function TransactionDetailsModal({ transaction, onClose }) {
  const [repayments, setRepayments] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToTransactionRepayments(transaction.id, setRepayments);
    return () => unsubscribe();
  }, [transaction.id]);

  const remaining = transaction.amount - (transaction.paidAmount || 0);
  const isPaid = remaining === 0;
  const repaymentPercentage = ((transaction.paidAmount || 0) / transaction.amount) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-enter">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Détails de la transaction
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(transaction.date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Transaction Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {transaction.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Montant total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Montant payé</p>
              <p className={`text-xl font-bold ${
                isPaid
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {formatCurrency(transaction.paidAmount || 0)}
              </p>
            </div>
          </div>

          {!isPaid && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Reste à payer</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-500">
                  {formatCurrency(remaining)}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${repaymentPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {repaymentPercentage.toFixed(1)}% payé
              </p>
            </div>
          )}

          {isPaid && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Transaction entièrement remboursée
              </p>
            </div>
          )}

          {transaction.category && (
            <div className="mt-4">
              <span className="text-xs px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                {transaction.category === 'emprunté' ? 'Emprunté' : 'Prêté'}
              </span>
            </div>
          )}
        </div>

        {/* Repayment History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Historique des remboursements
          </h3>

          {repayments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="text-4xl mb-2 opacity-30">📝</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucun remboursement enregistré
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {repayments.map((repayment) => (
                <div
                  key={repayment.id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          repayment.type === 'automatic'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        }`}>
                          {repayment.type === 'automatic' ? 'Automatique' : 'Manuel'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(repayment.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-500">
                        {formatCurrency(repayment.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-300 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;
