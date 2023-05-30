const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
};

app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is logged in
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", { user });
  }
});



app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const user = users[req.cookies.user_id];
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const { id } = req.params;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is already logged in
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", { user });
  }
});


// GET /login endpoint
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is already logged in
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", { user });
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if the user is logged in
  if (!user) {
    res.status(401).send("You must be logged in to shorten URLs.");
    return;
  }
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});


app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[id] = newLongURL;

  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

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
  if (user.password !== password) {
    res.status(403).send("Invalid password");
    return;
  }

  // Set the user_id cookie with the matching user's ID
  res.cookie("user_id", user.id);

  // Redirect to /urls
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the user_id cookie
  res.redirect("/login");
});

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
    password,
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});