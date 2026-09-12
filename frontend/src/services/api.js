const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export async function authenticatedRequest(path, firebaseUser, options = {}) {
  if (!apiUrl) throw new Error('The application server is not configured yet.');
  if (!firebaseUser) throw new Error('Please sign in before continuing.');

  const token = await firebaseUser.getIdToken();
  let response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('The application server is unavailable. Please try again shortly.');
  }
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Unable to complete that request.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}
