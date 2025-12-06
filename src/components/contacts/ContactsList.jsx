import { useState } from 'react';
import { addContact, deleteContact } from '../../services/contactsService';
import { addTransaction, updateTransaction } from '../../services/transactionsService';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/toast';
import ContactCard from './ContactCard';
import ContactDetailsView from './ContactDetailsView';
import AddContactModal from '../modals/AddContactModal';
import AddTransactionModal from '../modals/AddTransactionModal';
import EditTransactionModal from '../modals/EditTransactionModal';

function ContactsList({ contacts, transactions, userId, allSavingsOperations }) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleAddContact = async (name) => {
    try {
      await addContact(userId, name);
      showToast('Contact ajouté avec succès', 'success');
      setShowAddContact(false);
    } catch (error) {
      showToast('Erreur lors de l\'ajout du contact', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      await deleteContact(contactId);
      showToast('Contact supprimé', 'success');
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction(userId, transactionData);
      showToast('Transaction ajoutée', 'success');
      setShowAddTransaction(false);
    } catch (error) {
      showToast('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleEditTransaction = async (transactionId, updates) => {
    try {
      await updateTransaction(transactionId, updates);
      showToast('Transaction modifiée', 'success');
      setEditingTransaction(null);
    } catch (error) {
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const totalBalance = contacts.reduce((sum, c) => sum + c.balance, 0);

  // Show contact details if a contact is selected
  if (selectedContact) {
    return (
      <>
        <ContactDetailsView
          contact={selectedContact}
          transactions={transactions}
          contacts={contacts}
          userId={userId}
          allSavingsOperations={allSavingsOperations || []}
          onBack={() => setSelectedContact(null)}
          onEditTransaction={setEditingTransaction}
        />
        {editingTransaction && (
          <EditTransactionModal
            transaction={editingTransaction}
            contacts={contacts}
            onClose={() => setEditingTransaction(null)}
            onSave={handleEditTransaction}
          />
        )}
      </>
    );
  }

  return (
    <div>
      {/* Summary - iOS 26 Style */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Balance totale</p>
          <p className={`text-4xl font-semibold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {formatCurrency(Math.abs(totalBalance))}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            {contacts.length} compte{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Action Buttons - iOS 26 Style */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setShowAddContact(true)}
          className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Ajouter un compte
        </button>
        {/* Desktop only - hidden on mobile */}
        <button
          onClick={() => setShowAddTransaction(true)}
          className="hidden md:flex flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-3.5 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2"
          disabled={contacts.length === 0}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle transaction
        </button>
      </div>

      {/* Floating Action Button (Mobile only) */}
      <button
        onClick={() => setShowAddTransaction(true)}
        disabled={contacts.length === 0}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center z-50"
        aria-label="Nouvelle transaction"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <div className="text-6xl mb-4 opacity-30">📝</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Aucun compte pour le moment</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ajoutez un compte pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts
            .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
            .map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleDeleteContact}
                onSelect={setSelectedContact}
              />
            ))}
        </div>
      )}

      {/* Modals */}
      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onAdd={handleAddContact}
        />
      )}

      {showAddTransaction && (
        <AddTransactionModal
          contacts={contacts}
          onClose={() => setShowAddTransaction(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  );
}

export default ContactsList;
