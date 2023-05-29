const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

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
  const id = req.params.id; // Get the id from the route parameter
  const newLongURL = req.body.longURL; // Get the updated long URL from req.body

  // Update the value of the stored long URL based on the new value
  // You need to implement your own logic here to update the URL in your data store
  // For example, if you're using an object to store the URLs:
  urlDatabase[id] = newLongURL;

  res.redirect('/urls'); // Redirect the client back to /urls
});


app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { username } = req.body; // Get the submitted username from req.body

  // Set the cookie named "username" with the submitted value
  res.cookie("username", username);

  res.redirect("/urls"); // Redirect the browser back to the /urls page
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});