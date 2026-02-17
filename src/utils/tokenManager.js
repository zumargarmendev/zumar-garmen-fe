
/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} - True if token is expired or invalid
 */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp <= Date.now() / 1000;
  } catch {
    return true;
  }
};

/**
 * Save token to localStorage
 * @param {string} token - JWT token
 * @returns {boolean} - True if saved successfully
 */
export const saveToken = (token) => {
  try {
    localStorage.setItem('token', token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Get token from localStorage
 * Returns null if token doesn't exist or is expired
 * @returns {string|null} - Valid JWT token or null
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    if (isTokenExpired(token)) {
      removeToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if a valid (non-expired) token exists
 * @returns {boolean} - True if valid token exists
 */
export const hasValidToken = () => {
  return getToken() !== null;
};

/**
 * Get decoded token payload
 * @returns {object|null} - Decoded token payload or null
 */
export const getTokenInfo = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
