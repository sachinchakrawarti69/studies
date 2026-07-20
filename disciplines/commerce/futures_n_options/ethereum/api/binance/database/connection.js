/**
 * SQLite Connection
 */

const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db = null;

async function connect() {

    if (db) {
        return db;
    }

    db = await open({

        filename: path.join(
            __dirname,
            "../../../../database/ethereum.db"
        ),

        driver: sqlite3.Database
    });

    console.log("Connected to SQLite");

    return db;
}

module.exports = connect;