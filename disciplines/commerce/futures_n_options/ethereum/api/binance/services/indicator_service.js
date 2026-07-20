/**
 * Technical Indicator Service
 */

const { getAllCandles } = require("../database/queries");

async function calculateIndicators() {

    const candles = await getAllCandles();

    console.log(`${candles.length} candles loaded.`);

    console.log("Calculating indicators...");

    // TODO:
    // RSI
    // EMA
    // SMA
    // MACD
    // Bollinger Bands
}

module.exports = calculateIndicators;