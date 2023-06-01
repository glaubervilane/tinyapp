// Helper function to retrieve user from Email information
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
const urlsForUser = (userId, urlDatabase) => {
  return Object.fromEntries(
    Object.entries(urlDatabase).filter(([, url]) => url.userID === userId)
  );
};

module.exports = {
  getUserByEmail,
  urlsForUser,
};