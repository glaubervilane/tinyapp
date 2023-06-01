const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, urlsForUser, generateRandomString, requireLogin } = require('./helpers');
const { users, urlDatabase, } = require('./databases');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-key'],
}));

// Route to create a new shortened URL
app.get("/urls/new", requireLogin, (req, res) => {
  res.render("urls_new", { user: users[req.session.userId] });
});

// Route to display a specific URL
app.get("/urls/:id", requireLogin, (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  if (url.userID !== req.session.userId) {
    res.status(403).send("Access Denied");
    return;
  }

  res.render("urls_show", { id, longURL: url.longURL, user: users[req.session.userId] });
});

// Route to redirect to the long URL
app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  res.redirect(url.longURL);
});

// GET route for registering a new user
app.get('/register', (req, res) => {
  res.render('register', { user: users[req.session.userId] });
});

// GET route for login In
app.get('/login', (req, res) => {
  res.render('login', { user: users[req.session.userId] });
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
  const userUrls = urlsForUser(req.session.userId, urlDatabase);

  if (!userUrls) {
    res.render("urls_login_prompt", { user: users[req.session.userId] });
    return;
  }

  res.render("urls_index", { urls: userUrls, user: users[req.session.userId] });
});

// Route to handle user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Email and password fields cannot be empty.");
    return;
  }

  const existingUser = getUserByEmail(email, users);

  if (existingUser) {
    res.status(400).send("Email is already registered.");
    return;
  }

  const userId = generateRandomString(6);
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = { id: userId, email, password: hashedPassword };

  req.session.userId = userId;
  res.redirect("/urls");
});

// Route to handle user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid email or password.");
    return;
  }

  req.session.userId = user.id;
  res.redirect("/urls");
});

// Route to handle user logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Route to handle URL creation
app.post("/urls", requireLogin, (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.userId,
  };

  res.redirect("/urls");
});

// Route to handle URL update
app.post("/urls/:id/update", requireLogin, (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  if (url.userID !== req.session.userId) {
    res.status(403).send("Access Denied");
    return;
  }

  url.longURL = req.body.longURL;
  res.redirect("/urls");
});

// Route to handle URL deletion
app.post("/urls/:id/delete", requireLogin, (req, res) => {
  const { id } = req.params;
  const url = urlDatabase[id];

  if (!url) {
    res.status(404).send("URL Not Found");
    return;
  }

  if (url.userID !== req.session.userId) {
    res.status(403).send("Access Denied");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});