import { useState, useRef } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

function SwipeableTransactionCard({
  transaction,
  onDelete,
  onPay,
  onEdit,
  onTransfer
}) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Limit swipe distance
    const limitedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));
    setTranslateX(limitedDiff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Swipe left (delete)
    if (translateX < -SWIPE_THRESHOLD) {
      setTranslateX(-MAX_SWIPE);
    }
    // Swipe right (pay)
    else if (translateX > SWIPE_THRESHOLD) {
      setTranslateX(MAX_SWIPE);
    }
    // Reset
    else {
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    setTranslateX(0);
    onDelete(transaction.id);
  };

  const handlePay = () => {
    setTranslateX(0);
    onPay(transaction);
  };

  const resetSwipe = () => {
    setTranslateX(0);
  };

  const remaining = transaction.amount - (transaction.paidAmount || 0);
  const isPaid = remaining === 0;
  const isDebt = !transaction.category || transaction.category === 'prêté' || transaction.category !== 'emprunté';

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* Right swipe action - Pay */}
        <div
          className={`flex items-center gap-2 transition-opacity ${translateX > SWIPE_THRESHOLD ? 'opacity-100' : 'opacity-0'}`}
          onClick={handlePay}
        >
          <div className="bg-green-600 text-white p-3 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-green-600 font-semibold">Solder</span>
        </div>

        {/* Left swipe action - Delete */}
        <div
          className={`flex items-center gap-2 ml-auto transition-opacity ${translateX < -SWIPE_THRESHOLD ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleDelete}
        >
          <span className="text-red-600 font-semibold">Supprimer</span>
          <div className="bg-red-600 text-white p-3 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Swipeable card content */}
      <div
        className="relative bg-white dark:bg-gray-800 transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transitionDuration: isDragging ? '0ms' : '300ms'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={resetSwipe}
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1">
                {transaction.description}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(transaction.date)}
                </p>
                {transaction.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {transaction.category === 'emprunté' ? 'Emprunté' : 'Prêté'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-xl font-semibold ${
                  isPaid
                    ? 'text-gray-400 dark:text-gray-500 line-through'
                    : isDebt
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-red-600 dark:text-red-500'
                }`}>
                  {formatCurrency(transaction.amount)}
                </p>
                {!isPaid && transaction.paidAmount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Reste: {formatCurrency(remaining)}
                  </p>
                )}
                {isPaid && (
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    ✓ Payé
                  </p>
                )}
              </div>

              {/* Context menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context menu dropdown */}
      {showMenu && (
        <div className="absolute right-2 top-16 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-10 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onEdit(transaction);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              onTransfer(transaction);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transférer
          </button>
        </div>
      )}
    </div>
  );
}

export default SwipeableTransactionCard;
