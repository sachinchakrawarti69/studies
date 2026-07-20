/**
 * Binance API Entry
 */

const fetchLatest = require("./collectors/fetch_latest");
const fetchDaily = require("./collectors/fetch_daily");

async function main() {

    console.log("====================================");
    console.log(" Binance Ethereum API");
    console.log("====================================");

    const latest = await fetchLatest();

    console.log("\nLatest Price");

    console.table(latest);

    const daily = await fetchDaily(5);

    console.log("\nLast 5 Daily Candles");

    console.table(daily);
}

main().catch(console.error);