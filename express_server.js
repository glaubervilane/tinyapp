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
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const templateVars = { id, longURL: urlDatabase[id] };
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
  res.render("register");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  console.log(req.body);

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
  const { username } = req.body;

  res.cookie("username", username);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});