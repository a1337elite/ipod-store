const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

async function hashPassword(password, saltRounds = 10) {
  if (!password) {
    throw new Error('Password is required');
  }
  
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}
async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

function validatePasswordStrength(password) {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = {
    isValid: password.length >= minLength,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    score: 0
  };
  
  if (password.length >= minLength) strength.score += 1;
  if (hasUpperCase) strength.score += 1;
  if (hasLowerCase) strength.score += 1;
  if (hasNumbers) strength.score += 1;
  if (hasSpecialChar) strength.score += 1;
  
  return strength;
}

module.exports = {
  generateSalt,
  hashPassword,
  comparePassword,
  validatePasswordStrength
};