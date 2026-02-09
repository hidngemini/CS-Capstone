const avgColour = require('fast-average-color-node');
const dbInterface = require('../db/dbInterface.js');
const fs = require('node:fs');
const mcAssets = require("minecraft-assets")("1.21.8");

function populateDB(db, textureFolderPath) {
    
}

async function prepareAndInsertTexture(db, textureBlob) {
    var colour = await avgColour.getAverageColor(textureBlob);
    db.insertTexture(blob, colour.hex, debug=true);
}

module.exports = {
    populateDB, prepareAndInsertTexture
};

var db = new dbInterface.DB('db/db.db', 'db/db_schema.sql');
blob = mcAssets.textureContent["deepslate_emerald_ore"].texture;
prepareAndInsertTexture(db, blob);