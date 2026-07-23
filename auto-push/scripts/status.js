#!/usr/bin/env node

const logger = require('../lib/logger');
const gitManager = require('../lib/git-manager');
const statistics = require('../lib/stats');
const achievementManager = require('../lib/achievement');

async function showStatus() {
  logger.header('📊 SYSTEM STATUS');
  
  try {
    // Git status
    logger.info('📌 Git Status:');
    const hasChanges = gitManager.hasChanges();
    const status = gitManager.gitStatus();
    const branch = gitManager.getCurrentBranch();
    const remote = gitManager.getRemoteUrl();
    
    console.log(`   Branch: ${branch}`);
    console.log(`   Remote: ${remote || 'Not set'}`);
    console.log(`   Changes: ${hasChanges ? 'Yes' : 'No'}`);
    console.log(`   Files Changed: ${status.length}`);
    
    // Statistics
    logger.info('📌 Statistics:');
    const stats = statistics.getStats();
    console.log(`   Total Pushes: ${stats.pushCount}`);
    console.log(`   Today's Pushes: ${stats.todayPushes}`);
    console.log(`   Total Files: ${stats.totalFilesChanged}`);
    console.log(`   XP Points: ${stats.xpPoints}`);
    console.log(`   Uptime: ${stats.uptime}`);
    
    // Achievements
    logger.info('🏆 Achievements:');
    const achievements = achievementManager.getUnlocked();
    if (achievements.length === 0) {
      console.log('   None yet');
    } else {
      achievements.forEach(a => {
        console.log(`   ${a.icon} ${a.name}`);
      });
    }
    
    // Errors
    logger.info('📌 Recent Errors:');
    const errorHandler = require('../lib/error-handler');
    const recentErrors = errorHandler.getRecentErrors(5);
    if (recentErrors.length === 0) {
      console.log('   No recent errors');
    } else {
      console.log(`   ${recentErrors.length} recent errors (run 'npm run report' for details)`);
    }
    
    console.log('\n' + '═'.repeat(50));
    
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

showStatus();