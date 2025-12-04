import { useState } from 'react';
import { addCategory, deleteCategory, addSavingsOperation, updateSavingsOperation } from '../../services/savingsService';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/toast';
import SavingsCategoryDetails from './SavingsCategoryDetails';
import AddSavingsOperationModal from '../modals/AddSavingsOperationModal';
import EditSavingsOperationModal from '../modals/EditSavingsOperationModal';

function SavingsView({ categories, operations, userId }) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [operationCategory, setOperationCategory] = useState(null);
  const [editingOperation, setEditingOperation] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await addCategory(userId, newCategoryName);
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

  const totalBalance = categories.reduce((sum, c) => sum + (c.balance || 0), 0);

  // Show category details if selected
  if (selectedCategory) {
    return (
      <>
        <SavingsCategoryDetails
          category={selectedCategory}
          operations={operations}
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
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Épargne totale</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add Category Button */}
      <button
        onClick={() => setShowAddCategory(true)}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium mb-4"
      >
        ➕ Nouvelle catégorie
      </button>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-6xl mb-4">🏦</div>
          <p className="text-gray-600 dark:text-gray-400">Aucune catégorie d'épargne</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Créez une catégorie pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(category => {
            const categoryOps = operations.filter(op => op.categoryId === category.id);
            return (
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
                      {categoryOps.length} opération{categoryOps.length !== 1 ? 's' : ''}
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
            );
          })}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Nouvelle catégorie
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
    </div>
  );
}

export default SavingsView;
