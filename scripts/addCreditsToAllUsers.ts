import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SUBSCRIPTION_TIERS = {
  free: { credits: 25 },
  basic: { credits: 100 },
  premium: { credits: 250 }
} as const;

async function addCreditsToAllUsers() {
  try {
    console.log('Starting bulk credit update...');
    console.log('Bypassing authentication - direct Firestore access');
    console.log('Fetching users from Firestore...');

    // Get all users with error handling
    const usersRef = collection(db, 'users');
    let snapshot;

    try {
      snapshot = await getDocs(usersRef);
      console.log(`Found ${snapshot.size} users in database`);
    } catch (fetchError) {
      console.error('Failed to fetch users. Error:', fetchError);
      console.log('This might be due to Firestore security rules or network issues.');
      return;
    }

    if (snapshot.empty) {
      console.log('No users found in the database.');
      return;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      try {
        // Skip if user already has credits
        if (userData.credits && userData.credits > 0) {
          console.log(`Skipping user ${userId} - already has ${userData.credits} credits`);
          skipped++;
          continue;
        }

        const subscriptionType = userData.subscriptionType || 'free';
        const tier = SUBSCRIPTION_TIERS[subscriptionType as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.free;
        const creditsToAdd = tier.credits;

        // Update user with credits
        await updateDoc(doc(db, 'users', userId), {
          credits: creditsToAdd,
          subscriptionType: subscriptionType,
          monthlyReset: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Log the transaction
        await addDoc(collection(db, 'creditTransactions'), {
          userId,
          amount: creditsToAdd,
          type: 'monthly_reset',
          description: `Bulk credit assignment - ${subscriptionType} plan (${creditsToAdd} credits)`,
          createdAt: Timestamp.now()
        });

        console.log(`✅ Updated user ${userId}: ${creditsToAdd} credits (${subscriptionType} plan)`);
        updated++;

      } catch (userError) {
        console.error(`❌ Failed to update user ${userId}:`, userError);
        errors++;
      }
    }

    console.log(`\n🎉 Bulk update complete!`);
    console.log(`📊 Updated: ${updated} users`);
    console.log(`⏭️  Skipped: ${skipped} users (already had credits)`);
    if (errors > 0) {
      console.log(`❌ Errors: ${errors} users failed to update`);
    }

  } catch (error) {
    console.error('❌ Script failed with error:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your Firebase configuration in .env.local');
    console.log('2. Verify Firestore security rules allow reads/writes');
    console.log('3. Ensure you have proper authentication');
    console.log('4. Check your internet connection');
  }
}

// Run the script
addCreditsToAllUsers();