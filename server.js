const express = require('express');
const app = express();
const dbInterface = require('./db/dbInterface.js')

app.set('view engine', 'ejs'); // set ejs as view engine

// initialize form data thingy
app.use(express.urlencoded({ extended: true }));

// initalize db interface
var db = new dbInterface.DB('db/colourdb.db', 'db/colours_schema.sql')

// #####################
// #     HOME PAGE     #
// #####################

app.get('/', (req, res) => {
  res.render('home');
});

// ####################
// #   PALETTE PAGE   #
// ####################

// Palette page post request
app.get('/palettes', (req, res) => {
  res.render('palettes', { colour: null });
});

// Palette submission post request
app.post('/paletteSubmit', (req, res) => {
  const colour = req.body.colour;
  db.insertColour(colour);
  res.render('palettes', { colour: colour });
});

// Run server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
