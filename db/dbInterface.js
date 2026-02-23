const sqlite3 = require("sqlite3");
const fs = require("node:fs");

class DB {
    #db; // # means private :)

    constructor(dbFile, schema = null) {
        this.#db = new sqlite3.Database(dbFile);
        if (schema !== null) {
            const schemaData = fs.readFileSync(schema, 'utf-8');
            this.#db.exec(schemaData);
        }
    }

    convertColour(hexStr) {
        return Number("0x" + hexStr.substring(1));
    }

    // this method won't be used. It is a very basic example of how to query the db.
    insertColour(hexStr, debug=false) {
        // print stuff if debugging
        if (debug) {
            console.log(`inserting ${hexStr}`);
        }

        // setup sql query
        const insertColourString = this.#db.prepare('INSERT INTO Colour (dateCreated, hex) VALUES (?, ?);');

        // value calculations
        var date = Date.now();
        var colourInt = this.convertColour(hexStr);

        // insert after converting
        insertColourString.run(date, colourInt);
    }

    insertGradient(numBlocks, fromHexStr, toHexStr, debug=false) {
        // print stuff if debugging
        if (debug) {
            console.log(`inserting gradient with ${numBlocks} blocks from ${fromHexStr} to ${toHexStr}`);
        }

        // prepare sql query
        const insertGradientString = this.#db.prepare(`INSERT INTO Gradient
            (dateCreated,numBlocks,fromHex,toHex) VALUES (?,?,?,?)`);
        
        var date = Date.now();
        var fromHex = this.convertColour(fromHexStr);
        var toHex = this.convertColour(toHexStr);

        // insert after computing
        insertGradientString.run(date, numBlocks, fromHex, toHex);
    }

    insertTexture(textureBlob, hexStr, debug=false) {
        // print stuff if debugging
        if (debug) {
            console.log(`inserting texture with colour: ${hexStr}`);
            console.log(`inserting this blob:`);
            console.log(textureBlob);
        }

        // prepare sql query
        const insertTextureString = this.#db.prepare(`INSERT INTO Texture
            (texture, avgColour) VALUES (?,?)`);

        var colourHex = this.convertColour(hexStr);

        insertTextureString.run(textureBlob, colourHex);
    }

    async getAllColours() {
        return new Promise((resolve, reject) => {
            this.#db.all(
                "SELECT avgColour FROM Texture",
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async getTex(hexStr) {
        var colourDec = this.convertColour(hexStr);
        return new Promise((resolve, reject) => {
            this.#db.all(
                "SELECT * FROM Texture WHERE avgColour = ?",
                [colourDec],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    close() {
        this.#db.close()
    }
}

module.exports = {
    DB
}