import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const subscribeToTransactions = (userId, callback) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(transactions);
  });
};

export const addTransaction = async (userId, transactionData) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      userId,
      ...transactionData,
      paidAmount: 0,
      isPaid: false,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

export const updateTransaction = async (transactionId, updates) => {
  try {
    await updateDoc(doc(db, 'transactions', transactionId), updates);
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

export const addRepayment = async (transactionId, amount) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDocs(query(collection(db, 'transactions'), where('__name__', '==', transactionId)));

    if (transactionDoc.empty) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionDoc.docs[0].data();
    const newPaidAmount = (transaction.paidAmount || 0) + amount;
    const isPaid = newPaidAmount >= transaction.amount;

    await updateDoc(transactionRef, {
      paidAmount: newPaidAmount,
      isPaid
    });
  } catch (error) {
    console.error("Error adding repayment:", error);
    throw error;
  }
};

export const transferTransaction = async (transactionId, newContactId) => {
  try {
    await updateDoc(doc(db, 'transactions', transactionId), {
      contactId: newContactId
    });
  } catch (error) {
    console.error("Error transferring transaction:", error);
    throw error;
  }
};

export const deleteContactTransactions = async (contactId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('contactId', '==', contactId)
    );
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error deleting contact transactions:", error);
    throw error;
  }
};
