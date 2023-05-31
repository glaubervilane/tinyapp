const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database of shortened URLs
const urlDatabase = {
  b6UTxQ: {
    shortURL: "b6UTxQ",
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    shortURL: "i3BoGr",
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Database of registered users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

// Function to generate a random string of a given length
const generateRandomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
};

// Route to create a new shortened URL
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is logged in
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { user });
  }
});

// Route to display a specific URL
app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const user = users[req.cookies.user_id];
  const url = urlDatabase[id];
  // Check if the URL exists in the database
  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  const templateVars = { id, longURL: url.longURL, user };
  res.render("urls_show", templateVars);
});

// Route to redirect to the long URL
app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const urlObj = urlDatabase[id];

  if (!urlObj) {
    res.status(404).send("URL Not Found");
    return;
  }

  const longURL = urlObj.longURL;
  res.redirect(longURL);
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route to retrieve the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to display the list of URLs for a user
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];

  // Check if the user is logged in
  if (!user) {
    res.redirect("/login");
    return;
  }

  const userUrls = Object.fromEntries(
    Object.entries(urlDatabase).filter(([key, value]) => value.userID === user.id)
  );

  const templateVars = {
    user: user,
    urls: userUrls
  };

  res.render("urls_index", templateVars);
});

// Route to register a new user
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is already logged in
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", { user });
  }
});

// Route to login
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is already logged in
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", { user });
  }
});

// Route to test rendering HTML with EJS
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route to create a new shortened URL
app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is logged in
  if (!user) {
    res.status(401).send("You must be logged in to shorten URLs.");
    return;
  }
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id
  };

  res.redirect(`/urls/${shortURL}`);
});

// Route to update the long URL of a shortened URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[id].longURL = newLongURL;

  res.redirect('/urls');
});

// Route to delete a shortened URL
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Route to handle the login form submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Look up the user by email
  const user = getUserByEmail(email);

  // Check if user with that email exists
  if (!user) {
    res.status(403).send("Invalid email");
    return;
  }

  // Check if the password matches
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid password");
    return;
  }

  // Set the user_id cookie with the matching user's ID
  res.cookie("user_id", user.id);

  // Redirect to /urls
  res.redirect("/urls");
});

// Route to handle the logout action
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the user_id cookie
  res.redirect("/login");
});

// Route to register a new user
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password are empty strings
  if (email === "" || password === "") {
    res.status(400).send("Email and password cannot be empty");
    return;
  }

  // Check if email already exists in the users object
  const user = getUserByEmail(email);
  if (user) {
    res.status(400).send("Email already registered");
    return;
  }

  const userId = generateRandomString();

  users[userId] = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, 10),
  };

  // Set a user_id cookie containing the user's newly generated ID
  res.cookie("user_id", userId);

  // Redirect the user to the /urls page
  res.redirect("/urls");
});

// Helper function to lookup a user by email
const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});