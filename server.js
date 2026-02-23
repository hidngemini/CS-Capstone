const express = require('express');
const app = express();
const dbInterface = require('./db/dbInterface.js');
const colourUtils = require('./colours/colours.js');

app.set('view engine', 'ejs'); // set ejs as view engine

// initialize form data thingy
app.use(express.urlencoded({ extended: true }));

// initalize db interface
var db = new dbInterface.DB('db/db.db', 'db/db_schema.sql')
colourUtils.populateDB(db);

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
  res.render('palettes', { colour: null, imageData: null });
});

// Palette submission post request
app.post('/paletteSubmit', async (req, res) => {
  //TODO: This is currently just doing colours. Update this for full palettes

  // unpack request
  const colour = req.body.colour;

  // insert into db
  // db.insertColour(colour);
  
  // get nearest colour
  const nearest = await colourUtils.getNearestColour(db, colour);
  const texData = await db.getTex(nearest);
  const texture = texData[0].texture;

  // render page with request details
  res.render('palettes', { colour: colour, imageData: texture });
});

// #####################
// #   GRADIENT PAGE   #
// #####################

// Gradients page get request
app.get('/gradients', (req, res) => {
  res.render('gradients', { numBlocks: null, fromColour: "#000000", toColour: "#ffffff", textures: null});
});

// Gradients page post request
app.post('/gradientSubmit', async (req, res) => {
  // unpack request
  const numBlocks = req.body.numBlocks;
  const fromColour = req.body.fromColour;
  const toColour = req.body.toColour;

  // insert into db
  db.insertGradient(numBlocks, fromColour, toColour);

  // get nearest colours
  const nearest1 = await colourUtils.getNearestColour(db, fromColour);
  const texData1 = await db.getTex(nearest1);
  const texture1 = texData1[0].texture;
  
  const nearest2 = await colourUtils.getNearestColour(db, toColour);
  const texData2 = await db.getTex(nearest2);
  const texture2 = texData2[0].texture;

  // package colours into array
  var texArr = [];
  texArr.push(texture1);
  texArr.push(texture2);

  // render page with request details
  res.render('gradients', { numBlocks: numBlocks, fromColour: fromColour, toColour: toColour, textures: texArr });
});

// ####################
// #    CURVE PAGE    #
// ####################

// Gradients page get request
app.get('/curves', (req, res) => {
  res.render('curves', { size: 10});
});

app.post('/curveSubmit', (req, res) => {
  const size = req.body.size;
  res.render('curves', { size: size});
});

// Run server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
