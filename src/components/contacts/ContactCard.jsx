import { formatCurrency } from '../../utils/formatters';

function ContactCard({ contact, onDelete, onSelect }) {
  const { name, balance, transactionCount } = contact;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition p-4">
      <div className="flex justify-between items-center">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onSelect(contact)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div
          className="text-right cursor-pointer"
          onClick={() => onSelect(contact)}
        >
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(balance))}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {balance >= 0 ? 'vous doit' : 'vous devez'}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(contact.id);
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
}

export default ContactCard;
