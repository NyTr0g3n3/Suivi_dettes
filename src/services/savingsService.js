import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Categories
export const subscribeToCategories = (userId, callback) => {
  const q = query(
    collection(db, 'savingsCategories'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(categories);
  });
};

// Get categories for a specific contact
export const subscribeToCategoriesByContact = (userId, contactId, callback) => {
  const q = query(
    collection(db, 'savingsCategories'),
    where('userId', '==', userId),
    where('contactId', '==', contactId)
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(categories);
  });
};

export const addCategory = async (userId, contactId, name) => {
  try {
    const docRef = await addDoc(collection(db, 'savingsCategories'), {
      userId,
      contactId,
      name,
      balance: 0,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

// Check if a contact has savings enabled
export const checkContactHasSavings = async (userId, contactId) => {
  try {
    const q = query(
      collection(db, 'savingsCategories'),
      where('userId', '==', userId),
      where('contactId', '==', contactId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking contact savings:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    // Delete all operations for this category first
    const q = query(
      collection(db, 'savingsOperations'),
      where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);

    for (const document of snapshot.docs) {
      await deleteDoc(document.ref);
    }

    // Then delete the category
    await deleteDoc(doc(db, 'savingsCategories', categoryId));
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// Operations
export const subscribeToSavings = (userId, callback) => {
  const q = query(
    collection(db, 'savings'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const operations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(operations);
  });
};

export const addSavingsOperation = async (userId, operationData) => {
  try {
    const docRef = await addDoc(collection(db, 'savings'), {
      userId,
      ...operationData,
      createdAt: new Date().toISOString()
    });

    // Update category balance
    const categoryRef = doc(db, 'savingsCategories', operationData.categoryId);
    const categoryDoc = await getDocs(query(collection(db, 'savingsCategories'), where('__name__', '==', operationData.categoryId)));

    if (!categoryDoc.empty) {
      const category = categoryDoc.docs[0].data();
      const balanceChange = operationData.type === 'deposit' ? operationData.amount : -operationData.amount;
      await updateDoc(categoryRef, {
        balance: (category.balance || 0) + balanceChange
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error adding savings operation:", error);
    throw error;
  }
};

export const updateSavingsOperation = async (operationId, oldData, newData) => {
  try {
    await updateDoc(doc(db, 'savings', operationId), newData);

    // Update category balance
    const categoryRef = doc(db, 'savingsCategories', newData.categoryId);
    const categoryDoc = await getDocs(query(collection(db, 'savingsCategories'), where('__name__', '==', newData.categoryId)));

    if (!categoryDoc.empty) {
      const category = categoryDoc.docs[0].data();

      // Reverse old operation
      const oldChange = oldData.type === 'deposit' ? -oldData.amount : oldData.amount;
      // Apply new operation
      const newChange = newData.type === 'deposit' ? newData.amount : -newData.amount;

      await updateDoc(categoryRef, {
        balance: (category.balance || 0) + oldChange + newChange
      });
    }
  } catch (error) {
    console.error("Error updating savings operation:", error);
    throw error;
  }
};

export const deleteSavingsOperation = async (operationId, categoryId, amount, type) => {
  try {
    await deleteDoc(doc(db, 'savings', operationId));

    // Update category balance
    const categoryRef = doc(db, 'savingsCategories', categoryId);
    const categoryDoc = await getDocs(query(collection(db, 'savingsCategories'), where('__name__', '==', categoryId)));

    if (!categoryDoc.empty) {
      const category = categoryDoc.docs[0].data();
      const balanceChange = type === 'deposit' ? -amount : amount;
      await updateDoc(categoryRef, {
        balance: (category.balance || 0) + balanceChange
      });
    }
  } catch (error) {
    console.error("Error deleting savings operation:", error);
    throw error;
  }
};
