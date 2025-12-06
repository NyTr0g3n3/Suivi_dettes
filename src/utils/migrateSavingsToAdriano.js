import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Migration utility to link existing savings categories to contact "Adriano"
 *
 * This function:
 * 1. Finds the contact named "Adriano"
 * 2. Updates all savings categories without a contactId to link them to Adriano
 *
 * @param {string} userId - The user ID
 * @returns {Promise<{success: boolean, message: string, updated: number}>}
 */
export const migrateSavingsToAdriano = async (userId) => {
  try {
    // Step 1: Find Adriano contact
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', userId),
      where('name', '==', 'Adriano')
    );

    const contactsSnapshot = await getDocs(contactsQuery);

    if (contactsSnapshot.empty) {
      return {
        success: false,
        message: 'Contact "Adriano" not found',
        updated: 0
      };
    }

    const adrianoContact = contactsSnapshot.docs[0];
    const adrianoId = adrianoContact.id;

    console.log('Found Adriano contact:', adrianoId);

    // Step 2: Find all savings categories without contactId
    const categoriesQuery = query(
      collection(db, 'savingsCategories'),
      where('userId', '==', userId)
    );

    const categoriesSnapshot = await getDocs(categoriesQuery);

    let updated = 0;
    const updatePromises = [];

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryData = categoryDoc.data();

      // Only update if contactId is missing
      if (!categoryData.contactId) {
        console.log(`Updating category "${categoryData.name}" to link to Adriano`);

        updatePromises.push(
          updateDoc(doc(db, 'savingsCategories', categoryDoc.id), {
            contactId: adrianoId
          })
        );
        updated++;
      }
    }

    // Execute all updates
    await Promise.all(updatePromises);

    return {
      success: true,
      message: `Successfully linked ${updated} savings categories to Adriano`,
      updated
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      updated: 0
    };
  }
};

/**
 * Check if migration is needed
 * @param {string} userId - The user ID
 * @returns {Promise<{needed: boolean, categoriesWithoutContact: number}>}
 */
export const checkMigrationNeeded = async (userId) => {
  try {
    const categoriesQuery = query(
      collection(db, 'savingsCategories'),
      where('userId', '==', userId)
    );

    const categoriesSnapshot = await getDocs(categoriesQuery);

    let categoriesWithoutContact = 0;

    categoriesSnapshot.docs.forEach(doc => {
      if (!doc.data().contactId) {
        categoriesWithoutContact++;
      }
    });

    return {
      needed: categoriesWithoutContact > 0,
      categoriesWithoutContact
    };

  } catch (error) {
    console.error('Check migration error:', error);
    return {
      needed: false,
      categoriesWithoutContact: 0
    };
  }
};
