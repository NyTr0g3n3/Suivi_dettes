import { formatCurrency } from '../../utils/formatters';

function ContactCard({ contact, onDelete, onSelect }) {
  const { name, balance, transactionCount } = contact;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-center justify-between">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onSelect(contact)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="text-right cursor-pointer"
            onClick={() => onSelect(contact)}
          >
            <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {formatCurrency(Math.abs(balance))}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {balance >= 0 ? 'vous doit' : 'vous devez'}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contact.id);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Supprimer"
          >
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactCard;
