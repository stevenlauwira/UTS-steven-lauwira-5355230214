const { User } = require('../../../models');

// Fungsi untuk menambahkan percobaan login gagal pada user
async function addFailedLoginAttempt(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  user.failedLoginAttempts += 1;
  user.lastFailedLoginAt = new Date();
  await user.save();
}

// Fungsi untuk memeriksa apakah user telah melebihi batasan percobaan login gagal
async function isLoginLimitExceeded(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const { failedLoginAttempts, lastFailedLoginAt } = user;
  const currentTime = new Date();
  const timeDiff = currentTime - lastFailedLoginAt;
  const thirtyMinutesInMillis = 30 * 60 * 1000; // 30 menit dalam milidetik

  return failedLoginAttempts >= 5 && timeDiff < thirtyMinutesInMillis;
}

// Fungsi untuk mengatur ulang percobaan login gagal dan waktu terakhir login gagal
async function resetFailedLoginAttempt(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  user.failedLoginAttempts = 0;
  user.lastFailedLoginAt = null;
  await user.save();
}

// Fungsi untuk melakukan login
async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email');
  }

  if (user.password !== password) {
    await addFailedLoginAttempt(email);

    if (await isLoginLimitExceeded(email)) {
      throw new Error(
        'Too many failed login attempts. Please try again later.'
      );
    }

    throw new Error('Invalid password');
  }

  // Reset failed login attempts upon successful login
  await resetFailedLoginAttempt(email);

  return user;
}

module.exports = {
  addFailedLoginAttempt,
  isLoginLimitExceeded,
  resetFailedLoginAttempt,
  loginUser,
};
