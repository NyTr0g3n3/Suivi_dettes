import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { deleteSavingsOperation } from '../../services/savingsService';
import { showToast } from '../../utils/toast';

function SavingsCategoryDetails({ category, operations, onBack, onAddOperation, onEditOperation }) {
  const categoryOperations = operations
    .filter(op => op.categoryId === category.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDeleteOperation = async (operationId) => {
    if (!confirm('Supprimer cette opération ?')) return;

    try {
      const operation = categoryOperations.find(op => op.id === operationId);
      await deleteSavingsOperation(operationId, category.id, operation.amount, operation.type);
      showToast('Opération supprimée', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {category.name}
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(category.balance || 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Solde épargne
          </p>
        </div>
      </div>

      {/* Add Operation Button */}
      <button
        onClick={() => onAddOperation(category)}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium mb-4"
      >
        ➕ Nouvelle opération
      </button>

      {/* Operations List */}
      {categoryOperations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600 dark:text-gray-400">Aucune opération</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoryOperations.map(operation => {
            const isDeposit = operation.type === 'deposit';

            return (
              <div
                key={operation.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {operation.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(operation.date)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                      isDeposit
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {isDeposit ? 'Dépôt' : 'Retrait'}
                    </span>
                  </div>

                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${
                      isDeposit ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isDeposit ? '+' : '-'}{formatCurrency(operation.amount)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onEditOperation(operation)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteOperation(operation.id)}
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
    </div>
  );
}

export default SavingsCategoryDetails;
