const avgColour = require('fast-average-color-node');
const dbInterface = require('../db/dbInterface.js');
const fs = require('node:fs');
const mcAssets = require("minecraft-assets")("1.21.8");

async function populateDB(db) {
    mcAssets.blocksArray.forEach(async element => {
        blob = mcAssets.textureContent[element.name].texture
        if (blob != null) {
            await prepareAndInsert(db, blob)
        }
    });
}

async function prepareAndInsert(db, textureBlob) {
    var colour = await avgColour.getAverageColor(textureBlob); // GET AVERAGE COLOUR
    db.insertTexture(textureBlob, colour.hex); // INSERT INTO DB
}

function hexStrToDec(hexStr) {
    return Number("0x" + hexStr.substring(1));
}

function decToHexStr(dec) {
    return "#" + dec.toString(16);
}

function getDistance(colour1, colour2) {
    rDiff = hexStrToDec("#" + colour1.slice(1,3)) - hexStrToDec("#" + colour2.slice(1,3));
    gDiff = hexStrToDec("#" + colour1.slice(3,5)) - hexStrToDec("#" + colour2.slice(3,5));
    bDiff = hexStrToDec("#" + colour1.slice(5,7)) - hexStrToDec("#" + colour2.slice(5,7));
    diffsSquared = rDiff**2 + gDiff**2 + bDiff**2;
    return Math.sqrt(diffsSquared);
}

async function getNearestColour(db, colour) {
    var colours = await db.getAllColours()
    if (colours.length == 0) {
        console.log("err: empty db");
        return;
    }
    closest = decToHexStr(colours[0].avgColour);
    closestDist = getDistance(colour, closest);
    for (var i = 1; i < colours.length; i++) {
        var newColour = decToHexStr(colours[i].avgColour);
        var newDist = getDistance(colour, newColour);
        if (newDist < closestDist) {
            closest = newColour;
            closestDist = newDist;
        }
    }
    return closest.toString();
}

module.exports = {
    populateDB, getNearestColour, hexStrToDec
};

// TESTING CODE
async function test() {
    var db = new dbInterface.DB('db/db.db');
    var target = "#ffaa00"
    var col = await getNearestColour(db, target);
    console.log(col);
    console.log(typeof(col));

    console.log(target);
    console.log(typeof(target));
    console.log(await db.getTex(col));
}

// test()


//TODO: 
// THE mcAssets.textureContent RETURNS A BLOB LEADING WITH 'data:image/png;base64,'
// THIS PROBABLY IS WHATS BREAKING THE ACTUAL OUTPUT FILE, WHICH WE WILL NEED