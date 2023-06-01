const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "abcdef": { longURL: "http://www.example.com", userID: "userRandomID" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe('urlsForUser', function() {
  it('should return URLs for a specific user', function() {
    const userId = "userRandomID";
    const expectedURLs = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
      "abcdef": { longURL: "http://www.example.com", userID: "userRandomID" }
    };
    const result = urlsForUser(userId, testUrls);
    assert.deepEqual(result, expectedURLs);
  });

  it('should return an empty object for a user with no URLs', function() {
    const userId = "nonexistentID";
    const result = urlsForUser(userId, testUrls);
    assert.deepEqual(result, {});
  });
});