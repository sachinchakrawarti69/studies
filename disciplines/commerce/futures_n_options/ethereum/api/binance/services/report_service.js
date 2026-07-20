/**
 * Report Service
 */

const { getLatestCandle } = require("../database/queries");

async function generateReport() {

    const candle = await getLatestCandle();

    console.log("\n========== Daily Report ==========");

    console.table(candle);

    console.log("==================================");
}

module.exports = generateReport;