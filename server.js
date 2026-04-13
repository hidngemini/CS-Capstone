const express = require('express');
const app = express();
const dbInterface = require('./db/dbInterface.js');
const colourUtils = require('./colours/colours.js');
const fs = require('node:fs');

app.set('view engine', 'ejs'); // set ejs as view engine

// initialize form data thingy
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// initalize db interface
var db = new dbInterface.DB('db/db.db', 'db/db_schema.sql');
colourUtils.miniPopulateDB(db);

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
  res.render('palettes', { colours: ["#dedede", "#d3901d", "#303030"], comps: null, textures: null });
});

// Palette submission post request
app.post('/paletteSubmit', async (req, res) => {
  // unpack request
  const colours = req.body.colours;

  // insert into db
  // db.insertColour(colour);
  
  // get nearest colour
  var textures = []
  var comps = []
  for (var i = 0; i < colours.length; i++) {
    colour = colours[i];
    const nearest = await colourUtils.getNearestColour(db, colour, false);
    const texData = await db.getTex(nearest);
    const texture = texData[0].texture;
    textures.push(texture);
    var comp = colourUtils.getComplementary(colours[i]);
    if (!colours.includes(comp)) {
      comps.push(comp);
    }
  }

  // render page with request details
  res.render('palettes', { colours: colours, comps: comps, textures: textures });
});

// #####################
// #   GRADIENT PAGE   #
// #####################

// Gradients page get request
app.get('/gradients', async (req, res) => {
  const colours = colourUtils.generateGradient("#000000", "#ffffff", 8);
  var textures = [];

  for (var i = 0; i < colours.length; i++) {
    var nearest = await colourUtils.getNearestColour(db, colours[i], true);
    var texData = await db.getTex(nearest);
    textures.push(texData[0].texture);
  }

  res.render('gradients', { numBlocks: 8, fromColour: "#000000", toColour: "#ffffff", textures: textures });
});

// Gradients page post request
app.post('/gradients', async (req, res) => {
  // unpack request
  const numBlocks = req.body.numBlocks;
  const fromColour = req.body.fromColour;
  const toColour = req.body.toColour;

  // insert into db
  db.insertGradient(numBlocks, fromColour, toColour);

  const colours = colourUtils.generateGradient(fromColour, toColour, numBlocks);
  var textures = [];
  for (var i = 0; i < colours.length; i++) {
    var nearest = await colourUtils.getNearestColour(db, colours[i], true);
    var texData = await db.getTex(nearest);
    textures.push(texData[0].texture);
  }

  // render page with request details
  res.render('gradients', { numBlocks: numBlocks, fromColour: fromColour, toColour: toColour, textures: textures });
});

// ####################
// #    CURVE PAGE    #
// ####################

// Gradients page get request
app.get('/curves', (req, res) => {
  res.render('curves', { size: 10});
});

///////////////////////

// var file = fs.createWriteStream('debugArray.txt');
// app.get('/categorize', async (req, res) => {
//   const textureDataArr = await db.getAllValues();
//   const tex = textureDataArr[0].texture;
//   res.render('categorization', { i: 0, good: 1, tex: tex })
// });

// app.post('/categorySubmit', async (req, res) => {
//   const i = req.body.i;
//   var good = req.body.good;
//   const textureDataArr = await db.getAllValues();

//   if (Number(i) == textureDataArr.length) {
//     file.end();
//   } else {
//     const tex = textureDataArr[Number(i)+1].texture;
//     file.write(textureDataArr[Number(i)].itemName + ", " + good + '\n');
//     res.render('categorization', { i: Number(i)+1, good: good, tex: tex });
//   }
// });

///////////////////////

// Run server on port 3000
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
