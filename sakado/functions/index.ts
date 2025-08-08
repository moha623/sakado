import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const deleteUser = functions.https.onRequest(async (req, res) => {
  // Verify it's a POST request
  if (req.method !== 'POST') {
    res.status(400).send('Only POST requests are accepted');
    return;
  }

  const uid = req.body.uid;
  if (!uid) {
    res.status(400).send('UID is required');
    return;
  }

  try {
    // Delete from Authentication
    await admin.auth().deleteUser(uid);
    await admin.firestore().doc(`otherCollection/${uid}`).delete();
    
    res.status(200).send({ success: true });
    return;
  } catch (error) {
    console.error('Deletion failed:', error);
    res.status(500).send({ error: 'User deletion failed' });
    return;
  }
}); 