const { assert } = require('chai');
const { getUserByEmail, generateRandomString, urlsForUser, requireLogin, requireNotLoggedIn } = require('../helpers.js');

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

describe('generateRandomString', function() {
  it('should return a string of the specified length', function() {
    const length = 6;
    const randomString = generateRandomString(length);
    assert.strictEqual(randomString.length, length);
  });

  it('should return a different string on each call', function() {
    const length = 6;
    const randomString1 = generateRandomString(length);
    const randomString2 = generateRandomString(length);
    assert.notStrictEqual(randomString1, randomString2);
  });
});

describe('requireLogin', function() {
  it('should call the next middleware if the user is logged in', function() {
    const req = { session: { userId: 'userRandomID' } };
    const res = {};
    const next = function() {
      assert.isTrue(true);
    };

    requireLogin(req, res, next);
  });

  it('should redirect to /login if the user is not logged in', function() {
    const req = { session: {} };
    const res = { redirect: function(url) {
      assert.strictEqual(url, '/login');
    }};
    const next = function() {
      assert.fail('next() should not be called');
    };

    requireLogin(req, res, next);
  });
});

describe('requireNotLoggedIn', function() {
  it('should redirect to /urls if the user is logged in', function() {
    const req = { session: { userId: 'userRandomID' } };
    const res = { redirect: function(url) {
      assert.strictEqual(url, '/urls');
    }};
    const next = function() {
      assert.fail('next() should not be called');
    };

    requireNotLoggedIn(req, res, next);
  });

  it('should call the next middleware if the user is not logged in', function() {
    const req = { session: {} };
    const res = {};
    const next = function() {
      assert.isTrue(true); // Test passes if next() is called
    };

    requireNotLoggedIn(req, res, next);
  });
});