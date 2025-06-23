// src/cyberFrontend/validation.js

/**
 * Sends login credentials to backend
 */
export async function validateLogin(userId, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { token: data.token };
    } else {
      return { message: data.message || 'Login failed' };
    }
  } catch (err) {
    console.error('Network/login error:', err);
    return { message: 'Network error, please try again.' };
  }
}

/**
 * Sends registration data to backend
 */
export async function registerUser(userId, password) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || 'Registration failed' };
    }
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: 'Network error. Please try again.' };
  }
}
