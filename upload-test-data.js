// Load environment variables
require('dotenv').config();

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('✓ Firebase Admin initialized successfully\n');
} catch (error) {
  console.error('✗ Firebase initialization error:', error.message);
  process.exit(1);
}

const db = admin.firestore();

// Function to upload data from a JSON file to a Firestore collection
async function uploadCollection(collectionName, filePath, useIdAsDocId = true) {
  try {
    console.log(`\nUploading ${collectionName}...`);

    // Read the JSON file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileData);

    // Handle both array and object formats
    const items = Array.isArray(data) ? data : Object.values(data).flat();

    if (items.length === 0) {
      console.log(`⚠ No data found in ${filePath}`);
      return;
    }

    // Upload each item
    let count = 0;
    const batch = db.batch();

    for (const item of items) {
      if (useIdAsDocId && item.id) {
        // Use the item's ID as the document ID
        const docRef = db.collection(collectionName).doc(item.id);
        batch.set(docRef, item);
      } else {
        // Let Firestore auto-generate the ID
        const docRef = db.collection(collectionName).doc();
        batch.set(docRef, item);
      }
      count++;
    }

    await batch.commit();
    console.log(`✓ Successfully uploaded ${count} documents to ${collectionName}`);

  } catch (error) {
    console.error(`✗ Error uploading ${collectionName}:`, error.message);
  }
}

// Main upload function
async function uploadAllData() {
  console.log('=================================================');
  console.log('  AlphaSpark - Test Data Upload to Firestore');
  console.log('=================================================\n');

  try {
    // Upload users
    await uploadCollection(
      'users',
      path.join(__dirname, 'test data', 'users.json'),
      true
    );

    // Upload groups
    await uploadCollection(
      'groups',
      path.join(__dirname, 'test data', 'groups.json'),
      true
    );

    // Upload broadcast questions
    await uploadCollection(
      'Broadcast_questions',
      path.join(__dirname, 'test data', 'broadcast_questions.json'),
      true
    );

    // Upload question responses
    await uploadCollection(
      'question_responses',
      path.join(__dirname, 'test data', 'question_responses.json'),
      true
    );

    // Upload response comments
    await uploadCollection(
      'response_comments',
      path.join(__dirname, 'test data', 'response_comments.json'),
      true
    );

    // Upload message requests
    await uploadCollection(
      'message_requests',
      path.join(__dirname, 'test data', 'message_requests.json'),
      true
    );

    // Upload private conversations
    await uploadCollection(
      'private_conversations',
      path.join(__dirname, 'test data', 'private_conversations.json'),
      true
    );

    // Upload private messages
    await uploadCollection(
      'private_messages',
      path.join(__dirname, 'test data', 'private_messages.json'),
      true
    );

    console.log('\n=================================================');
    console.log('✓ All data uploaded successfully!');
    console.log('=================================================\n');

    console.log('You can now:');
    console.log('1. Start your server: npm start');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Login with any test user (e.g., user-001)\n');

    process.exit(0);

  } catch (error) {
    console.error('\n✗ Upload failed:', error);
    process.exit(1);
  }
}

// Run the upload
uploadAllData();
