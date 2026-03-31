const CryptoJS = require('crypto-js');

const SALT = 'DataLegacySalt2024Secure!@#';

const deriveKey = (userEmail) => {
  return CryptoJS.PBKDF2(userEmail + SALT, SALT, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
};

const decryptField = (encryptedText, userEmail) => {
  if (!encryptedText) return '';
  try {
    const key = deriveKey(userEmail);
    const bytes = CryptoJS.AES.decrypt(encryptedText, key);
    console.log(`For ${userEmail}: bytes.length=${bytes.sigBytes}, words=${bytes.words.length}`);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || '[Empty]';
  } catch (error) {
    return `[Failed for ${userEmail}]: ${error.message}`;
  }
};

const encrypted = 'U2FsdGVkX18jzduXj8U59OpKZEqZ9Sfo3NdVP3PS8Hk=';

const testEmails = [
  'test@example.com',
  'admin@example.com',
  'user@example.com',
  'srish@example.com',
  'demo@example.com',
  'user@datalegacymanager.com',
  '',
  'legacy-ai-app-9a475@firebaseapp.com',
  'srish@gmail.com',
  'user@legacy-ai-app-9a475.firebaseapp.com',
  'vaultuser@example.com'
];

console.log('Testing decryption with common emails:\n');
testEmails.forEach(email => {
  const result = decryptField(encrypted, email);
  console.log(`${email}: ${result}`);
});
