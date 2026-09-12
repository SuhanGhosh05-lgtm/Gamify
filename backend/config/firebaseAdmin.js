import 'dotenv/config';
import admin from 'firebase-admin';

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return null;

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
}

const serviceAccount = getServiceAccount();
let firebaseAdminConfigured = false;
let firebaseAdminConfigurationError = null;

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firebaseAdminConfigured = true;
  } catch (error) {
    firebaseAdminConfigurationError = 'Firebase Admin credentials are invalid.';
    console.error('Firebase Admin could not initialize:', error.code || error.message);
  }
} else if (admin.apps.length) {
  firebaseAdminConfigured = true;
} else {
  firebaseAdminConfigurationError = 'Firebase Admin credentials are missing.';
}

export { firebaseAdminConfigured, firebaseAdminConfigurationError };
export default admin;
