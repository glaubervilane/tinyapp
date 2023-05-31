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
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
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

// Helper function to retrieve URLs for a specific user
const urlsForUser = (userId) => {
  return Object.fromEntries(
    Object.entries(urlDatabase).filter(([_, url]) => url.userID === userId)
  );
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
  // Check if the user is logged in
  if (!user) {
    res.status(401).send("You must be logged in to access this page.");
    return;
  }
  // Check if the URL exists in the database
  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }
  // Check if the URL belongs to the logged-in user
  if (url.userID !== user.id) {
    res.status(403).send("Access Denied");
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

// GET route for registering a new user
app.get('/register', (req, res) => {
  res.render('register', { user: req.user });
});

// GET route for login In
app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

// Default route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Route to retrieve the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to display the list of URLs
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is logged in
  if (!user) {
    res.render("urls_login_prompt", { user });
    return;
  }
  // Retrieve the URLs belonging to the logged-in user
  const userUrls = urlsForUser(user.id);
  const templateVars = { urls: userUrls, user };
  res.render("urls_index", templateVars);
});

// Route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Email and password fields cannot be empty.");
    return;
  }

  const existingUser = Object.values(users).find(user => user.email === email);

  if (existingUser) {
    res.status(400).send("Email is already registered.");
    return;
  }

  const userId = generateRandomString(6);
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = { id: userId, email: email, password: hashedPassword };

  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// Route to handle user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = Object.values(users).find(user => user.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid email or password.");
    return;
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

// Route to handle user logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Route to handle URL creation
app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];

  if (!user) {
    res.status(401).send("You must be logged in to create a URL.");
    return;
  }

  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id,
  };

  res.redirect(`/urls/${shortURL}`);
});

// Route to handle URL update
app.post("/urls/:id/update", (req, res) => {
  const { id } = req.params;
  const user = users[req.cookies.user_id];
  const url = urlDatabase[id];

  if (!user) {
    res.status(401).send("You must be logged in to update a URL.");
    return;
  }

  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  if (url.userID !== user.id) {
    res.status(403).send("Access Denied");
    return;
  }

  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Route to handle URL deletion
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  const user = users[req.cookies.user_id];
  const url = urlDatabase[id];

  if (!user) {
    res.status(401).send("You must be logged in to delete a URL.");
    return;
  }

  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  if (url.userID !== user.id) {
    res.status(403).send("Access Denied. Private URL created by another user");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});