#!/usr/bin/env node

const logger = require('../lib/logger');
const gitManager = require('../lib/git-manager');
const commitGenerator = require('../lib/commit-generator');
const statistics = require('../lib/stats');
const errorHandler = require('../lib/error-handler');

async function manualPush() {
  logger.header('📤 MANUAL PUSH');
  
  try {
    const hasChanges = gitManager.hasChanges();
    if (!hasChanges) {
      logger.warning('No changes to commit');
      process.exit(0);
    }

    const status = gitManager.gitStatus();
    const files = status.map(f => f.path);
    const commitMessage = commitGenerator.generateSmartCommit(files, statistics.pushCount + 1);
    
    logger.info(`📄 Files to push: ${files.length}`);
    logger.info(`📝 Commit message: ${commitMessage}`);
    
    // Show files
    files.slice(0, 10).forEach(file => {
      console.log(`   📄 ${file}`);
    });
    if (files.length > 10) {
      logger.dim(`   ... and ${files.length - 10} more`);
    }
    
    // Confirm
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Proceed with push? (y/n): ', async (answer) => {
      readline.close();
      if (answer.toLowerCase() !== 'y') {
        logger.warning('Push cancelled');
        process.exit(0);
      }
      
      logger.info('📤 Pushing changes...');
      
      try {
        const result = await gitManager.pushWithRecovery(commitMessage);
        if (result.success) {
          logger.success(`✅ Push successful!`);
          logger.success(`✅ Committed: ${result.commitHash}`);
          logger.success(`✅ Message: ${commitMessage}`);
          statistics.incrementPush(files);
          console.log(`⭐ +${Math.floor(files.length * 2) + 15} XP`);
        } else {
          logger.error('❌ Push failed');
        }
      } catch (error) {
        logger.error(`Error: ${error.message}`);
        const suggestions = errorHandler.getSuggestion(error);
        if (suggestions.length > 0) {
          logger.info('💡 Suggestions:');
          suggestions.forEach(s => console.log(`   ${s}`));
        }
      }
    });
    
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

manualPush();