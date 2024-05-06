// Import library atau modul yang diperlukan
const usersModel = require('./users-model');
const moment = require('moment');

// Fungsi untuk memeriksa dan memperbarui upaya login
async function checkAndUpdateLoginAttempts(email) {
  // Dapatkan data pengguna dari basis data berdasarkan email
  let userData = await usersModel.getUserByEmail(email);
  if (!userData) {
    throw new Error('User not found');
  }

  // Periksa apakah pengguna telah mencapai batas upaya login
  if (userData.loginAttempts >= 5) {
    const lastAttemptTime = moment(userData.lastLoginAttempt);
    const currentTime = moment();
    const timeDiff = moment
      .duration(currentTime.diff(lastAttemptTime))
      .asMinutes();

    // Jika lebih dari 30 menit, reset counter dan waktu terakhir login attempt
    if (timeDiff >= 30) {
      await usersModel.resetLoginAttempts(email);
    } else {
      throw new Error(
        'Too many failed login attempts. Please try again later.'
      );
    }
  }

  // Jika belum mencapai batas, tambahkan upaya login dan update waktu terakhir login attempt
  await usersModel.incrementLoginAttempts(email);
}

// Middleware untuk menangani upaya login
async function handleLoginAttempt(req, res, next) {
  const { email, password } = req.body;

  try {
    // Periksa dan perbarui upaya login
    await checkAndUpdateLoginAttempts(email);

    // Lanjutkan dengan proses autentikasi
    next();
  } catch (error) {
    // Tangani kesalahan upaya login
    res.status(403).json({ error: error.message });
  }
}

module.exports = {
  handleLoginAttempt,
};
