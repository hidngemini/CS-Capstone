const avgColour = require('fast-average-color-node');
const dbInterface = require('../db/dbInterface.js');
const fs = require('node:fs');
const mcAssets = require("minecraft-assets")("1.21.8");

async function populateDB(db) {
    // iterate through each block
    mcAssets.blocksArray.forEach(async element => {
        blob = mcAssets.textureContent[element.name].texture;
        // if it has a texture, insert the block
        if (blob != null) {
            await prepareAndInsert(db, itemName, blob);
        }
    });
}

async function miniPopulateDB(db) {
    var full = mcAssets.blocksArray.length-1
    for (var i = 0; i <= full; i++) {
        var element = mcAssets.blocksArray[i];
        blob = mcAssets.textureContent[element.name].texture;
        if (blob != null) {
            await prepareAndInsert(db, element.name, blob);
        }
    }
}

async function prepareAndInsert(db, itemName, textureBlob) {
    // compute average colour based on texture
    var colour = await avgColour.getAverageColor(textureBlob); 

    // insert texture into db
    db.insertTexture(itemName, textureBlob, colour.hex);
}

function hexStrToDec(hexStr) {
    // return number representation of hex string
    return Number("0x" + hexStr.substring(1));
}

function decToHexStr(dec) {
    // convert decimal to hex
    var hex = dec.toString(16);

    // zero pad until hex is 6 chars long
    while (hex.length < 6) {
        hex = "0" + hex;
    }

    // return string of hex with leading "#"
    return "#" + hex;
}

function getDistance(colour1, colour2) {
    // find the difference between colour1 and colour2 in r, g, and b values.
    var rDiff = hexStrToDec("#" + colour1.slice(1,3)) - hexStrToDec("#" + colour2.slice(1,3));
    var gDiff = hexStrToDec("#" + colour1.slice(3,5)) - hexStrToDec("#" + colour2.slice(3,5));
    var bDiff = hexStrToDec("#" + colour1.slice(5,7)) - hexStrToDec("#" + colour2.slice(5,7));

    // square differences
    diffsSquared = rDiff**2 + gDiff**2 + bDiff**2;

    // distance is sqrt of squared differences; return
    return Math.sqrt(diffsSquared);
}

async function getNearestColour(db, colour, strict) {
    // if strict, only allow solid blocks
    if (strict) {
        var colours = await db.getAllowedColours();
    } else {
        var colours = await db.getAllColours();
        
    }
    
    // throw error if the db is empty
    if (colours.length == 0) {
        console.log("err: empty db");
        return;
    }

    // pick the first colour to be the closest
    var closest = decToHexStr(colours[0].avgColour);
    var closestDist = getDistance(colour, closest);

    // iterate through all other colours. if it's closer than the current one, update closest
    for (var i = 1; i < colours.length; i++) {
        var newColour = decToHexStr(colours[i].avgColour);
        var newDist = getDistance(colour, newColour);
        if (newDist < closestDist) {
            closest = newColour;
            closestDist = newDist;
        }
    }
    
    // return closest colour as a hex string
    return closest.toString();
}

function generateGradient(colour1, colour2, size) {
    // step gives gaps between each colour
    var step = 1 / size;
    var startStep = step / 2;

    // get integer representations of both colours' r, g, and b values.
    var r1 = hexStrToDec("#" + colour1.slice(1,3));
    var r2 = hexStrToDec("#" + colour2.slice(1,3));
    var g1 = hexStrToDec("#" + colour1.slice(3,5));
    var g2 = hexStrToDec("#" + colour2.slice(3,5));
    var b1 = hexStrToDec("#" + colour1.slice(5,7));
    var b2 = hexStrToDec("#" + colour2.slice(5,7));

    // start array with first colour
    var colours = [colour1]

    // get intermediate colours
    for (var i = 0; i < size-2; i++) {
        // calculate new r, g, and b based on weighted average of both colours
        var weightedR = Math.floor(r2 * ((startStep + (step*i))) + r1 * (1 - ((startStep + (step*i)))));
        var weightedG = Math.floor(g2 * ((startStep + (step*i))) + g1 * (1 - ((startStep + (step*i)))));
        var weightedB = Math.floor(b2 * ((startStep + (step*i))) + b1 * (1 - ((startStep + (step*i)))));

        // convert into hex
        var rHex = Math.floor(weightedR).toString(16);
        if (rHex.length == 1) {
            rHex = "0" + rHex;
        }
        var gHex = Math.floor(weightedG).toString(16);
        if (gHex.length == 1) {
            gHex = "0" + gHex;
        }
        var bHex = Math.floor(weightedB).toString(16);
        if (bHex.length == 1) {
            bHex = "0" + bHex;
        }

        colours.push("#" + rHex + gHex + bHex);
    }   

    // end array with last colour
    colours.push(colour2);

    // return colour array
    return colours;
}

function RGB2HSL(colour) {
    // get int representation of r, g, and b
    var r = hexStrToDec("#" + colour.slice(1,3)) / 255;
    var g = hexStrToDec("#" + colour.slice(3,5)) / 255;
    var b = hexStrToDec("#" + colour.slice(5,7)) / 255;

    // find largest, smallest, and delta between them
    var min = Math.min(r,g,b);
    var max = Math.max(r,g,b);
    var del = max - min;

    // hue calculation
    var hue;
    if (del == 0) {
        hue = 0; // if r==g==b, hue is 0
    } else if (r == max) {
        hue = 60 * (((g-b)/del)%6);
    } else if (g == max) {
        hue = 60 * (((b-r)/del)+2);
    } else {
        hue = 60 * (((r-g)/del)+4);
    }

    // lightness calculation
    var light = (max + min) / 2;

    // saturation calculation
    var sat;
    if (del == 0) {
        sat = 0;
    } else {
        sat = del / (1 - Math.abs(2*light-1));
    }

    return [hue, sat, light];
}

function HSL2RGB(h,s,l) {
    // formulas for intermediate variables
    var c = (1-Math.abs(2*l-1))*s;
    var x = c * (1-Math.abs(((h/60)%2)-1));
    var m = l - c/2;

    // declare fractional red, green, and blue vars
    var rp;
    var gp;
    var bp;

    // long and icky if statement for hue angle computation
    if (h >= 0 && h < 60) {
        rp = c;
        gp = x;
        bp = 0;
    } else if (h >= 60 && h < 120) {
        rp = x;
        gp = c;
        bp = 0;
    } else if (h >= 120 && h < 180) {
        rp = 0;
        gp = c;
        bp = x;
    } else if (h >= 180 && h < 240) {
        rp = 0;
        gp = x;
        bp = c;
    } else if (h >= 240 && h < 300) {
        rp = x;
        gp = 0;
        bp = c;
    } else if (h >= 300 && h < 360) {
        rp = c;
        gp = 0;
        bp = x;
    }

    // compute rgb ints from fractional r, g, and b
    var r = (rp+m)*255;
    var g = (gp+m)*255;
    var b = (bp+m)*255;

    // convert rgb ints into rgb hex strings (padding where necessary)
    var rHex = Math.floor(r).toString(16);
    if (rHex.length == 1) {
        rHex = "0" + rHex;
    }
    var gHex = Math.floor(g).toString(16);
    if (gHex.length == 1) {
        gHex = "0" + gHex;
    }
    var bHex = Math.floor(b).toString(16);
    if (bHex.length == 1) {
        bHex = "0" + bHex;
    }

    // return hex string
    return "#" + rHex + gHex + bHex
}

function getComplementary(colour) {
    // get hsl value
    var hsl = RGB2HSL(colour);

    // rotate 180 degrees to find complementary
    hsl[0] += 180;
    hsl[0] %= 360;

    // convert rotated hsl back to rgb and return
    var rgb = HSL2RGB(hsl[0], hsl[1], hsl[2]);
    return rgb;
}

module.exports = {
    populateDB, getNearestColour, hexStrToDec, generateGradient, getComplementary, miniPopulateDB
};

// TESTING CODE
async function test() {
    var target = "#ffaa00"
    var hsl = RGB2HSL(target);
    console.log(hsl[0], hsl[1], hsl[2])
    var comp = getComplementary(target);
}
// test()
