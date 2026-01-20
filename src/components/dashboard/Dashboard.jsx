import { signOut } from '../../services/authService';
import { showToast } from '../../utils/toast';
import Header from './Header';
import ContactsList from '../contacts/ContactsList';

function Dashboard({
  user,
  isDarkMode,
  toggleDarkMode,
  contacts,
  transactions,
  savings
}) {
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

    const totalOwed = contactTransactions
      .filter(t => !t.category || t.category === 'prêté')
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
        />

        <main className="p-4">
          <ContactsList
            contacts={contactsWithBalances}
            transactions={transactions}
            userId={user.uid}
            allSavingsOperations={savings}
          />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
