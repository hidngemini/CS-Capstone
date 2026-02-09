const express = require('express');
const app = express();
const dbInterface = require('./db/dbInterface.js')

app.set('view engine', 'ejs'); // set ejs as view engine

// initialize form data thingy
app.use(express.urlencoded({ extended: true }));

// initalize db interface
var db = new dbInterface.DB('db/db.db', 'db/db_schema.sql')

// #####################
// #     HOME PAGE     #
// #####################

app.get('/', (req, res) => {
  res.render('home');
});

// ####################
// #   PALETTE PAGE   #
// ####################

// Palette page get request
app.get('/palettes', (req, res) => {
  res.render('palettes', { colour: null });
});

// Palette submission post request
app.post('/paletteSubmit', (req, res) => {
  //TODO: This is currently just doing colours. Update this for full palettes

  // unpack request
  const colour = req.body.colour;

  // insert into db
  db.insertColour(colour);

  // render page with request details
  res.render('palettes', { colour: colour });
});

// #####################
// #   GRADIENT PAGE   #
// #####################

// Gradients page get request
app.get('/gradients', (req, res) => {
  res.render('gradients', { numBlocks: null, fromColour: "#000000", toColour: "#ffffff"});
});

// Gradients page post request
app.post('/gradientSubmit', (req, res) => {
  // unpack request
  const numBlocks = req.body.numBlocks;
  const fromColour = req.body.fromColour;
  const toColour = req.body.toColour;

  // insert into db
  db.insertGradient(numBlocks, fromColour, toColour);

  // render page with request details
  res.render('gradients', { numBlocks: numBlocks, fromColour: fromColour, toColour: toColour });
});

// ####################
// #    CURVE PAGE    #
// ####################

// Gradients page get request
app.get('/curves', (req, res) => {
  res.render('curves', { size: 10 });
});

app.post('/curveSubmit', (req, res) => {
  const size = req.body.size;
  res.render('curves', { size: size });
});

// Run server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
