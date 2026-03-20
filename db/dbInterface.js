const sqlite3 = require("sqlite3");
const fs = require("node:fs");
const readline = require('readline');

class DB {
    #db; // # means private :)
    #allowArray;

    constructor(dbFile, schema = null) {
        // load database
        this.#db = new sqlite3.Database(dbFile);

        // clear database if schema file provided
        if (schema !== null) {
            const schemaData = fs.readFileSync(schema, 'utf-8');
            this.#db.exec(schemaData);
        }

        // read in allow data from text file
        this.#allowArray = this.readAllowData("array.csv");
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
        
        // get timestamp
        var date = Date.now();
        
        // convert hex
        var fromHex = this.convertColour(fromHexStr);
        var toHex = this.convertColour(toHexStr);

        // insert after computing
        insertGradientString.run(date, numBlocks, fromHex, toHex);
    }

    insertTexture(itemName, textureBlob, hexStr, debug=false) {
        // prepare variables
        var colourHex = this.convertColour(hexStr);
        var allowed = 0;
        if (this.#allowArray.includes(itemName)) {
            allowed = 1;
        }
        
        // prepare sql; this is vulnerable to sql injection, but it is not public facing, so this isn't an issue.
        const sqlStr = `INSERT INTO Texture (itemName, texture, avgColour, allowed) VALUES ("${itemName}", "${textureBlob}", ${colourHex}, ${allowed})`;

        // execute sql
        this.#db.exec(sqlStr);
    }

    readAllowData(filename) {
        var allowedArr = [];

        const fileStream = fs.createReadStream(filename);

        const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
        });

        rl.on('line', (line) => {
        // Each line like: "1, 1"
        const [value1, value2] = line.split(',').map(v => v.trim());

        // Convert to numbers if needed
        const itemName = value1
        const allowed = parseInt(value2, 10);

        if (allowed == 1) {
            allowedArr.push(itemName);
        }

        });

        rl.on('close', () => {

        });

        return allowedArr;
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

    async getAllowedColours() {
        return new Promise((resolve, reject) => {
            this.#db.all(
                "SELECT avgColour FROM Texture WHERE allowed == 1",
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

    async getAllValues() {
        return new Promise((resolve, reject) => {
            this.#db.all(
                "SELECT * FROM Texture",
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

    close() {
        this.#db.close()
    }
}

module.exports = {
    DB
}