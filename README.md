# URL Shortener

This is a web application that allows users to shorten long URLs. It is built using Node.js and Express, and provides authentication protection to ensure secure access to the shortened URLs.

## Project Features

- User registration and login functionality
- Shorten long URLs to create unique and compact short URLs
- View, edit, and delete existing URLs
- Redirect to the original long URL when accessing a shortened URL

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/your-username/url-shortener.git

2. Navigate to the project directory:

   ```shell
   cd url-shortener

3. Install the dependencies:

   ```shell
   npm install

4. Start the server:

   ```shell
   npm start
  
5. Open your browser and access the application at http://localhost:8080.

## Project Structure
The project structure is organized as follows:

   - helpers.js: Contains helper functions used by the server code.
   - views/: Contains the EJS templates used to render the HTML views.
   - views/partial/: Contains a header template used in all views.
   - test/: Contains tests for helper functions.
   - express_server.js: Entry point of the application.

## Dependencies
The project uses the following main dependencies:

   - Express: Fast and minimalist web framework for Node.js
   - EJS: Embedded JavaScript templates for rendering dynamic HTML pages
   - Cookie-Session: Middleware for session management using encrypted cookies
   - Bcryptjs: Library for hashing and comparing passwords securely
To install all dependencies, run `npm install`.

## Routes
The following routes are available in the application:

   - GET /: Home route. Redirects to /urls if the user is logged in, or to /login if not.
   - GET /urls: Displays a list of URLs created by the logged-in user.
   - GET /urls/new: Shows a form to create a new shortened URL.
   - GET /urls/:id: Shows details of a specific URL.
   - GET /u/:id: Redirects to the original long URL associated with the given short URL.
   - POST /urls: Creates a new shortened URL.
   - POST /urls/:id/update: Updates the long URL of a specific shortened URL.
   - POST /urls/:id/delete: Deletes a specific shortened URL.
   - GET /register: Displays the registration form.
   - POST /register: Handles user registration.
   - GET /login: Displays the login form.
   - POST /login: Handles user login.
   - POST /logout: Logs out the user by deleting the session cookie.

## Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or a pull request in the repository.

## License
This project is licensed under the MIT License.