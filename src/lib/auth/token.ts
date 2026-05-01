// Lightweight token accessor used by the API layer so it doesn't depend
// directly on React or the auth provider. AuthProvider keeps this updated.

let currentToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

export async function getAuthToken(): Promise<string | null> {
  return currentToken;
}
