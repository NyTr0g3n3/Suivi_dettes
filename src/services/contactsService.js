import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const subscribeToContacts = (userId, callback) => {
  const q = query(
    collection(db, 'contacts'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(contacts);
  });
};

export const addContact = async (userId, name) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      userId,
      name,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding contact:", error);
    throw error;
  }
};

export const updateContact = async (contactId, updates) => {
  try {
    await updateDoc(doc(db, 'contacts', contactId), updates);
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

export const deleteContact = async (contactId) => {
  try {
    await deleteDoc(doc(db, 'contacts', contactId));
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

export const getContactTransactions = async (contactId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('contactId', '==', contactId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting contact transactions:", error);
    throw error;
  }
};
