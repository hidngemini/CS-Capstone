const sqlite3 = require("better-sqlite3");
const fs = require("node:fs")

class DB {
    #db; // # means private :)

    constructor(dbFile, schema = null) {
        this.#db = new sqlite3(dbFile);

        if (schemaFile !== null) {
            const schemaData = fs.readFileSync(schema, 'utf-8');
            this.#db.exec(schemaData);
        }
    }

    close() {
        this.#db.close()
    }

    insertColour(hexString) {
        console.log(hexString)
    }
}

var mydb = new DB('db/colourdb.db');
// mydb.insertColour("#ffffff")
// mydb.close()
console.log('hello world')
// module.exports = DB;