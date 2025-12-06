import { collection, query, where, onSnapshot, addDoc, getDocs, writeBatch, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Subscribe to payment records for a specific contact
 */
export const subscribeToPayments = (userId, contactId, callback) => {
  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId),
    where('contactId', '==', contactId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(payments);
  });
};

/**
 * Subscribe to all payment records for a user
 */
export const subscribeToAllPayments = (userId, callback) => {
  const q = query(
    collection(db, 'payments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(payments);
  });
};

/**
 * Process a payment and automatically allocate it to oldest unpaid debts
 * @param {string} userId - User ID
 * @param {string} contactId - Contact ID
 * @param {number} paymentAmount - Amount being paid
 * @returns {Promise<{success: boolean, allocations: Array, remainingAmount: number}>}
 */
export const processPayment = async (userId, contactId, paymentAmount) => {
  try {
    // Get all unpaid transactions for this contact, sorted by date (oldest first)
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('contactId', '==', contactId),
      where('type', '==', 'debt'),
      orderBy('date', 'asc')
    );

    const transactionsSnapshot = await getDocs(transactionsQuery);

    // Filter to only truly unpaid debts (where paidAmount < amount)
    const unpaidDebts = transactionsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(debt => (debt.paidAmount || 0) < debt.amount);

    if (unpaidDebts.length === 0) {
      throw new Error('Aucune dette à rembourser');
    }

    let remainingAmount = paymentAmount;
    const allocations = [];
    const batch = writeBatch(db);

    // Allocate payment to debts starting from oldest
    for (const debt of unpaidDebts) {
      if (remainingAmount <= 0) break;

      const outstandingAmount = debt.amount - (debt.paidAmount || 0);
      const amountToAllocate = Math.min(remainingAmount, outstandingAmount);
      const newPaidAmount = (debt.paidAmount || 0) + amountToAllocate;
      const isFullyPaid = newPaidAmount >= debt.amount;

      // Update transaction
      const transactionRef = doc(db, 'transactions', debt.id);
      batch.update(transactionRef, {
        paidAmount: newPaidAmount,
        isPaid: isFullyPaid
      });

      allocations.push({
        transactionId: debt.id,
        description: debt.description,
        amount: amountToAllocate,
        date: debt.date
      });

      remainingAmount -= amountToAllocate;
    }

    // Commit all transaction updates
    await batch.commit();

    // Create payment record
    await addDoc(collection(db, 'payments'), {
      userId,
      contactId,
      amount: paymentAmount,
      allocations,
      remainingAmount,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      allocations,
      remainingAmount
    };

  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

/**
 * Delete all payment records for a contact
 */
export const deleteContactPayments = async (contactId) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('contactId', '==', contactId)
    );
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error deleting contact payments:", error);
    throw error;
  }
};
