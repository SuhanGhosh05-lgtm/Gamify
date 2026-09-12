import admin, { firebaseAdminConfigured } from '../config/firebaseAdmin.js';

export async function verifyFirebaseToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication is required.' });
  }

  const token = authorization.slice(7).trim();
  if (!token) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  if (!firebaseAdminConfigured) {
    console.error('Firebase Admin is not configured.');
    return res.status(500).json({ success: false, message: 'Authentication service is unavailable.' });
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.code || error.message);
    return res.status(401).json({ success: false, message: 'Your session is invalid or has expired. Please sign in again.' });
  }
}
