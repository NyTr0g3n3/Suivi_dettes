import { useState } from 'react';
import { addContact, deleteContact } from '../../services/contactsService';
import { addTransaction } from '../../services/transactionsService';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/toast';
import ContactCard from './ContactCard';
import AddContactModal from '../modals/AddContactModal';
import AddTransactionModal from '../modals/AddTransactionModal';

function ContactsList({ contacts, transactions, userId }) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

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

  const totalBalance = contacts.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div>
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance totale</p>
          <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setShowAddContact(true)}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          ➕ Ajouter un contact
        </button>
        <button
          onClick={() => setShowAddTransaction(true)}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
          disabled={contacts.length === 0}
        >
          💰 Nouvelle transaction
        </button>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600 dark:text-gray-400">Aucun contact pour le moment</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Ajoutez un contact pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts
            .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
            .map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onDelete={handleDeleteContact}
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
