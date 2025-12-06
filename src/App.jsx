import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDarkMode } from './hooks/useDarkMode';
import LoginView from './components/auth/LoginView';
import Dashboard from './components/dashboard/Dashboard';
import { subscribeToContacts } from './services/contactsService';
import { subscribeToTransactions } from './services/transactionsService';
import { subscribeToSavings } from './services/savingsService';

function App() {
  const { user, loading } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [contacts, setContacts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [savings, setSavings] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeContacts = subscribeToContacts(user.uid, setContacts);
    const unsubscribeTransactions = subscribeToTransactions(user.uid, setTransactions);
    const unsubscribeSavings = subscribeToSavings(user.uid, setSavings);

    return () => {
      unsubscribeContacts();
      unsubscribeTransactions();
      unsubscribeSavings();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <Dashboard
      user={user}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      contacts={contacts}
      transactions={transactions}
      savings={savings}
    />
  );
}

export default App;
