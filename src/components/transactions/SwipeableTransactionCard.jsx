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
  const startX = useRef(0);
  const currentX = useRef(0);

  const SWIPE_THRESHOLD = 60;
  const MAX_SWIPE = 100;

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

    // Prevent default scroll when swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
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
    <div
      className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        {/* Right swipe action - Pay */}
        <div
          className={`flex items-center transition-all duration-200 ${translateX > SWIPE_THRESHOLD ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          onClick={handlePay}
        >
          <div className="bg-green-600 text-white p-4 rounded-2xl shadow-lg">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        {/* Left swipe action - Delete */}
        <div
          className={`flex items-center ml-auto transition-all duration-200 ${translateX < -SWIPE_THRESHOLD ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
          onClick={handleDelete}
        >
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Swipeable card content */}
      <div
        className="relative bg-white dark:bg-gray-800"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'transform'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={resetSwipe}
      >
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0 pr-3">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1 truncate">
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

            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className={`text-lg font-semibold whitespace-nowrap ${
                  isPaid
                    ? 'text-gray-400 dark:text-gray-500 line-through'
                    : isDebt
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-red-600 dark:text-red-500'
                }`}>
                  {formatCurrency(transaction.amount)}
                </p>
                {!isPaid && transaction.paidAmount > 0 && (
                  <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-0.5">
                    Reste: {formatCurrency(remaining)}
                  </p>
                )}
                {isPaid && (
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    ✓ Payé
                  </p>
                )}
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(transaction);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <svg className="w-4.5 h-4.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransfer(transaction);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Transférer"
                >
                  <svg className="w-4.5 h-4.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SwipeableTransactionCard;
