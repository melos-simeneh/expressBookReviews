const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res
    .status(200)
    .type("application/json")
    .send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;
  const booksByAuthor = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor[isbn] = books[isbn];
    }
  });

  if (Object.keys(booksByAuthor).length === 0) {
    return res.status(404).json({ message: "No books found for the given author." });
  }

  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;
  const booksByTitle = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle[isbn] = books[isbn];
    }
  });

  if (Object.keys(booksByTitle).length === 0) {
    return res.status(404).json({ message: "No books found for the given title." });
  }

  return res.status(200).json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (Object.keys(book.reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }

  return res.status(200).json(book.reviews);
});

public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get("http://127.0.0.1:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch books asynchronously." });
  }
});

module.exports.general = public_users;
