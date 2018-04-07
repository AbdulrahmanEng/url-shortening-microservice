const express = require('express');
const morgan = require('morgan');
const nedb = require('nedb');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

const urls = fs.readFileSync(__dirname + '/seed.json');

const db = new nedb({
  filename: '.data/datafile',
  autoload: true
});
const dbMessages = {
  error: err => {
    if (err) {
      console.log('There is a problem with the database:', err);
    }
  },
  insertSeed: () => {
    console.log('Seed data has been successfully imported.');
  }
};

// Insert seed data if there are no urls in the database.
db.count({}, function(err, count) {
  console.log(`There are ${count} urls in the database.`);
  dbMessages.error(err);

  if (count <= 0) {
    // Insert seed data.
    db.insert(JSON.parse(urls), (err, urlsAdded) => {

      dbMessages.error(err);
      if (urlsAdded) {
        dbMessages.insertSeed();
      }
    });
  }
  else {}
});

app.get('/reset', (request, response) => {
  db.remove({}, {
    multi: true
  }, err => {
    dbMessages.error(err);
    console.log('Database has been reset.');
  });
  // Insert seed data.
  db.insert(JSON.parse(urls), (err, urlsAdded) => {

    dbMessages.error(err);

    if (urlsAdded) {
      dbMessages.insertSeed();
    }
  });

  response.redirect('/');

  //
});

app.get('/new/*', (request, response) => {
  const url = request.params[0];
  console.log(url);

  //   Verify url.
  const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);
  //   Create short url if input is valid.
  if (url.match(regex)) {
    // Get the url total.
    db.count({}, function(err, count) {
      const total = count;
      dbMessages.error(err);

      //       Create a short url document.
      const newUrl = {
        original_url: url,
        short_url: `https://shortn-url.glitch.me/${total+1}`,
        date: Date.now()
      };
      //       Return url if already stored, otherwise save new url.
      db.findOne({
        original_url: url
      }, function(err, url) {

        dbMessages.error(err)

        if (url) {
          response.json(url);
        }
        else {
          // Save url doc to database.
          db.insert(newUrl, function(err, newDoc) {
            if (err) {
              dbMessages.error(err);
            }
            console.log('Inserted document', newDoc);
            response.json(newDoc);
          });
        }
      })

    });

  }
  else {
    // Generate error response.
    response.json({
      error: 'URL is invalid'
    });
  }
});

app.get('/api/urls', (request, response) => {
  db.find({}, (err, docs) => {
    dbMessages.error(err);
    response.json(docs);
  });
});

app.get('/:url', (request, response) => {

  const shortUrl = 'https://' + request.headers.host + request.url;

  db.findOne({
    short_url: shortUrl
  }, function(err, doc) {

    dbMessages.error(err);
    if (doc) {
      response.redirect(doc.original_url);
    }
    else {
      response.redirect('/');
    }
  });
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${listener.address().port}`);
});