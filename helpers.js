const { users } = require('./databases');

// Helper function to generate a random alphanumeric string
const generateRandomString = function(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  const user = users[req.session.userId];
  if (!user) {
    res.status(401).send("You must be logged in to access this page.");
    return;
  }
  next();
};

// Helper function to retrieve user from email information
const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

// Helper function to retrieve URLs for a specific user
const urlsForUser = function(userId, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.userID === userId) {
      userUrls[shortURL] = url;
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomString,
  requireLogin,
  getUserByEmail,
  urlsForUser,
};