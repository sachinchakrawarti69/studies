#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');
const statistics = require('../lib/stats');
const achievementManager = require('../lib/achievement');
const reportGenerator = require('../lib/report');
const errorHandler = require('../lib/error-handler');

async function generateFullReport() {
  logger.header('📊 GENERATING FULL REPORT');
  
  try {
    // Generate main report
    const stats = statistics.getStats();
    const achievements = achievementManager.getUnlocked();
    const report = reportGenerator.generate(
      stats,
      achievements,
      statistics.pushCount,
      statistics.totalFilesChanged
    );
    const reportPath = reportGenerator.save(report);
    logger.success(`✅ Main report saved: ${reportPath}`);
    
    // Generate error report
    const errorReport = errorHandler.generateErrorReport();
    const errorReportPath = path.join(__dirname, '..', 'reports', `error-report-${new Date().toISOString().split('T')[0]}.txt`);
    fs.writeFileSync(errorReportPath, errorReport);
    logger.success(`✅ Error report saved: ${errorReportPath}`);
    
    // Show summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 REPORT SUMMARY');
    console.log('═'.repeat(50));
    console.log(`📊 Total Pushes: ${statistics.pushCount}`);
    console.log(`📊 Total Files: ${statistics.totalFilesChanged}`);
    console.log(`⭐ Total XP: ${statistics.xpPoints}`);
    console.log(`🏆 Achievements: ${achievementManager.getCount()}`);
    console.log(`📁 Reports saved in: ${path.join(__dirname, '..', 'reports')}`);
    console.log('═'.repeat(50));
    
  } catch (error) {
    logger.error(`Error generating report: ${error.message}`);
    process.exit(1);
  }
}

generateFullReport();