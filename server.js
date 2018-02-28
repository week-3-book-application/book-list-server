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

const client = new pg.Client(DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors({origin : true}));

app.get('/', (req, res) => res.send('Testing 1, 2, 3'));

app.get(`/api/v1/books`, (request, response) => {
  client.query(`SELECT * FROM books;`)
    .then(result => response.send(result.rows));
});

app.get('/api/v1/books/:id', (request, response) => {
  client.query(`SELECT * FROM books WHERE book_id=$1;`,
    [request.params.id])
    .then(result => response.send(result.rows))
    .catch(console.error);
});

app.post('/api/v1/books/new', bodyParser, (request, response) => {
  console.log(request);
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
  );
  response.send('insert complete');
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));