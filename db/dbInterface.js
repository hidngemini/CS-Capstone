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

    insertColour(hexString) {
        console.log(`inserting ${hexString}`)

        var formattedString = "0x" + hexString.substring(1);
        const insertColourString = this.#db.prepare('INSERT INTO Colour (hex) VALUES (?);');
        insertColourString.run(Number(formattedString));
    }

    close() {
        this.#db.close()
    }
}

module.exports = {
    DB
}