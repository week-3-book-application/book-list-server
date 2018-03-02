'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser').urlencoded({extended: true});

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
// const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL = 'postgres://localhost:5432/books_app';
const TOKEN = process.env.TOKEN;

const client = new pg.Client(DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());

// app.get('/', (req, res) => res.send('Testing 1, 2, 3'));

app.get(`/api/v1/admin`, (request, response) => {
  console.log(request.query.passcode);
  console.log(TOKEN);
  response.send(TOKEN === request.query.passcode);
});

app.get(`/api/v1/books`, (request, response) => {
  client.query(`SELECT * FROM books;`)
    .then(result => response.send(result.rows))
    .catch(console.error);
});

app.get('/api/v1/books/:id', (request, response) => {
  client.query(`SELECT * FROM books WHERE book_id=$1;`,
    [request.params.id])
    .then(result => response.send(result.rows))
    .catch(console.error);
});

app.put('/api/v1/book-:id/update', bodyParser, (request, response) => {
  client.query(`
    UPDATE books
    SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5
    WHERE book_id=$6;`,
  [
    request.body.author,
    request.body.title,
    request.body.isbn,
    request.body.image_url,
    request.body.description,
    request.body.book_id
  ]
  )
    .then(response.send('update complete'));
});

app.post('/api/v1/books/new', bodyParser, (request, response) => {
  client.query(
    `INSERT INTO books (author, title, isbn, image_url, description) 
    VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING;`,
    [
      request.body.author,
      request.body.title,
      request.body.isbn,
      request.body.image_url,
      request.body.description
    ]
  )
    .then(response.send('insert complete'));
});

app.delete('/api/v1/book/delete', bodyParser, (request, response) => {
  client.query(`DELETE FROM books WHERE book_id=$1;`,
    [request.body.book_id])
    .then(response.send('book deleted'));
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));