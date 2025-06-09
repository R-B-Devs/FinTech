// src/cyberFrontend/validation.js
 
/**
 * Sends the user's credentials to the backend and returns the parsed response.
 * @param {string} userId
 * @param {string} password
 * @returns {Promise<{ token?: string, message?: string }>}
 */
 
 
export async function validateLogin(userId, password) {
  try {
    const response = await fetch('https://localhost:3000/LoginPage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });
 
    const data = await response.json();
 
    if (response.ok) {
      console.log('Login successful:', data);
      // On success, backend should return { token: '...' }
      return { token: data.token };
    } else {
      // On failure, backend might return { message: 'Invalid credentials' }
      return { message: data.message || 'Login failed' };
    }
  } catch (err) {
    console.error('Network/login error:', err);
    return { message: 'Network error, please try again.' };
  }
}
 