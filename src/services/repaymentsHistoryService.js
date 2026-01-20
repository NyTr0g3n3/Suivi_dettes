import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Subscribe to repayment history for a specific transaction
 */
export const subscribeToTransactionRepayments = (transactionId, callback) => {
  const q = query(
    collection(db, 'repayments'),
    where('transactionId', '==', transactionId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const repayments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(repayments);
  });
};

/**
 * Add a repayment record to history
 * @param {string} transactionId - Transaction ID
 * @param {number} amount - Amount repaid
 * @param {string} type - Type of repayment ('manual' or 'automatic')
 * @param {string} paymentId - Payment ID (for automatic repayments)
 */
export const addRepaymentRecord = async (transactionId, amount, type = 'manual', paymentId = null) => {
  try {
    await addDoc(collection(db, 'repayments'), {
      transactionId,
      amount,
      type, // 'manual' or 'automatic'
      paymentId, // null for manual repayments, payment ID for automatic allocations
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding repayment record:", error);
    throw error;
  }
};
