/**
 * Database Queries
 */

const connect = require("./connection");

async function getAllCandles() {

    const db = await connect();

    return await db.all(

        `

        SELECT *

        FROM market_ohlcv

        ORDER BY open_time

        `

    );
}

async function getLatestCandle() {

    const db = await connect();

    return await db.get(

        `

        SELECT *

        FROM market_ohlcv

        ORDER BY open_time DESC

        LIMIT 1

        `

    );
}

async function countCandles() {

    const db = await connect();

    const row = await db.get(

        `

        SELECT COUNT(*) AS total

        FROM market_ohlcv

        `

    );

    return row.total;
}

module.exports = {

    getAllCandles,
    getLatestCandle,
    countCandles
};