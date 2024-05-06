const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

// Object to store login attempts and their timestamps
const loginAttempts = {};

/**
 * Handle user login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function loginUser(request, response, next) {
  try {
    const email = request.body.email;
    const password = request.body.password;

    // Check if login attempts for this email has reached the limit
    if (loginAttempts[email] && loginAttempts[email].count >= 5) {
      const lastAttemptTime = loginAttempts[email].timestamp;
      const elapsedTime = (new Date() - lastAttemptTime) / (1000 * 60); // elapsed time in minutes
      if (elapsedTime < 30) {
        throw errorResponder(
          errorTypes.FORBIDDEN,
          'Too many failed login attempts'
        );
      } else {
        // Reset login attempts if more than 30 minutes have passed
        delete loginAttempts[email];
      }
    }

    const user = await usersService.getUserByEmail(email);

    if (!user || user.password !== password) {
      // Increment login attempts count for this email
      if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 1, timestamp: new Date() };
      } else {
        loginAttempts[email].count++;
        loginAttempts[email].timestamp = new Date();
      }

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Invalid email or password'
      );
    }

    // Clear login attempts if login is successful
    delete loginAttempts[email];

    return response.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  loginUser,
};
