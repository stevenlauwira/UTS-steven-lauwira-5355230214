const { joiPasswordExtendCore } = require('joi-password');
const joi = require('joi');
const bcrypt = require('bcrypt');

// Inisialisasi objek untuk menyimpan informasi login attempts
const loginAttempts = {};

// Fungsi untuk melakukan validasi email dan password
function validateLogin(email, password) {
  // Lakukan validasi terhadap email dan password di sini
  // Contoh sederhana: validasi email harus ada di database, password harus sesuai

  // Dummy data, ganti dengan proses validasi sesuai dengan aplikasi Anda
  const dummyUserData = {
    email: 'test@example.com',
    passwordHash:
      '$2b$10$Xx2bOLsN7F7CMKUcIQG48.yQ0vHwd8wy9fRLgwyfbh6UGeFOtXQ5C', // Password: example123
  };

  if (
    email === dummyUserData.email &&
    bcrypt.compareSync(password, dummyUserData.passwordHash)
  ) {
    return true;
  }
  return false;
}

// Fungsi untuk melakukan login
function loginUser(email, password) {
  if (validateLogin(email, password)) {
    // Reset counter login attempts dan waktu terakhir saat berhasil login
    delete loginAttempts[email];
    return true;
  } else {
    // Jika user belum pernah mencoba login atau sudah lebih dari 30 menit sejak percobaan login terakhir
    if (
      !loginAttempts[email] ||
      Date.now() - loginAttempts[email].lastAttemptTime > 30 * 60 * 1000
    ) {
      loginAttempts[email] = {
        attempts: 1,
        lastAttemptTime: Date.now(),
      };
    } else {
      // Jika masih dalam jangka waktu 30 menit dan belum mencapai limit 5 attempts
      loginAttempts[email].attempts++;
      loginAttempts[email].lastAttemptTime = Date.now();
      if (loginAttempts[email].attempts === 5) {
        // Jika sudah mencapai limit 5 attempts, kembalikan false
        return false;
      }
    }
    return false;
  }
}

// Contoh penggunaan
const email = 'test@example.com';
const password = 'example123';

if (loginUser(email, password)) {
  console.log('Login berhasil');
} else {
  console.log('Login gagal');
}
