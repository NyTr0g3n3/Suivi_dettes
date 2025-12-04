import { useState } from 'react';
import { signOut } from '../../services/authService';
import { showToast } from '../../utils/toast';
import Header from './Header';
import ContactsList from '../contacts/ContactsList';
import SavingsView from '../savings/SavingsView';

function Dashboard({
  user,
  isDarkMode,
  toggleDarkMode,
  contacts,
  transactions,
  savingsCategories,
  savings
}) {
  const [currentView, setCurrentView] = useState('debts'); // 'debts' or 'savings'
  const [selectedContact, setSelectedContact] = useState(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast('Déconnexion réussie', 'success');
    } catch (error) {
      showToast('Erreur de déconnexion', 'error');
    }
  };

  const contactsWithBalances = contacts.map(contact => {
    const contactTransactions = transactions.filter(t => t.contactId === contact.id);

    // Pour l'ancienne structure : toutes les transactions sont des prêts
    // Pour la nouvelle structure : on différencie prêté/emprunté
    const totalOwed = contactTransactions
      .filter(t => !t.category || t.category === 'prêté' || t.category !== 'emprunté')
      .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

    const totalBorrowed = contactTransactions
      .filter(t => t.category === 'emprunté')
      .reduce((sum, t) => sum + (t.amount - (t.paidAmount || 0)), 0);

    const balance = totalOwed - totalBorrowed;

    return {
      ...contact,
      balance,
      totalOwed,
      totalBorrowed,
      transactionCount: contactTransactions.length
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <Header
          user={user}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onSignOut={handleSignOut}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <main className="p-4">
          {currentView === 'debts' ? (
            <ContactsList
              contacts={contactsWithBalances}
              transactions={transactions}
              userId={user.uid}
              onSelectContact={setSelectedContact}
            />
          ) : (
            <SavingsView
              categories={savingsCategories}
              operations={savings}
              userId={user.uid}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
