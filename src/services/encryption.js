import CryptoJS from 'crypto-js';

const SALT = 'DataLegacySalt2024Secure!@#'; // Improved fixed salt

export const deriveKey = (userEmail) => {
  return CryptoJS.PBKDF2(userEmail + SALT, SALT, {
    keySize: 256/32,
    iterations: 10000 // Increased for better security
  }).toString();
};

export const encryptField = (text, userEmail) => {
  if (!text) return '';
  const key = deriveKey(userEmail);
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
};

export const decryptField = (encryptedText, userEmail) => {
  if (!encryptedText) return '';
  try {
    const key = deriveKey(userEmail);
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption Failed]';
  }
};
