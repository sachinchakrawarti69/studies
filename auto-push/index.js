#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import modules
const config = require('./config');
const logger = require('./lib/logger');
const gitManager = require('./lib/git-manager');
const commitGenerator = require('./lib/commit-generator');
const FileWatcher = require('./lib/file-watcher');
const progressManager = require('./lib/progress-manager');
const notification = require('./lib/notification');
const achievementManager = require('./lib/achievement');
const statistics = require('./lib/stats');
const reportGenerator = require('./lib/report');
const errorHandler = require('./lib/error-handler');

// State variables
let timeoutId = null;
let pendingChanges = new Set();
let isProcessing = false;

// ============ UTILITY FUNCTIONS ============
function getFormattedDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return { date, time, full: `${date} ${time}`, hour: now.getHours() };
}

// ============ MAIN PUSH FUNCTION ============
async function pushChanges(trigger = 'auto') {
  if (isProcessing) {
    logger.warning('Already processing, skipping...');
    return;
  }
  isProcessing = true;

  try {
    // Check for changes
    const hasChanges = gitManager.hasChanges();
    if (!hasChanges) {
      const { time } = getFormattedDateTime();
      logger.warning(`No changes to commit (${time})`);
      isProcessing = false;
      return;
    }

    const status = gitManager.gitStatus();
    const files = status.map(f => f.path);
    const triggerText = trigger === 'timer' ? '⏰ Scheduled' : 
                        trigger === 'force' ? '💪 Force' : 
                        trigger === 'initial' ? '🚀 Initial' : '📦 Batch';

    // Increment statistics
    statistics.incrementPush(files);
    const { date, time, full, hour } = getFormattedDateTime();
    
    // Generate smart commit message
    const commitMessage = commitGenerator.generateSmartCommit(files, statistics.pushCount);
    
    logger.separator('═');
    logger.highlight(`📦 BATCH PUSH #${statistics.pushCount} - ${triggerText} - ${full}`);
    logger.separator('─');
    logger.info(`📄 Total files changed: ${files.length}`);
    logger.info(`📝 Commit message: ${commitMessage}`);
    
    // Show changed files (limit to 15)
    const displayFiles = files.slice(0, 15);
    displayFiles.forEach(file => {
      const discipline = commitGenerator.detectDiscipline(file);
      const prefix = discipline ? `${discipline.emoji} ` : '📄 ';
      console.log(`   ${prefix}${file}`);
    });
    if (files.length > 15) {
      logger.dim(`   ... and ${files.length - 15} more`);
    }
    
    logger.separator('─');
    
    // Create progress bar
    const progressBar = progressManager.createProgressBar(4);
    
    progressManager.updateProgress(1);
    logger.info('📤 Staging and pushing files...');
    
    // Push with recovery
    const result = await gitManager.pushWithRecovery(commitMessage);
    
    if (result.success) {
      progressManager.updateProgress(4);
      progressManager.stopProgress();
      
      // Calculate XP
      const xpEarned = Math.floor(files.length * 2) + 15;
      statistics.addXP(xpEarned);
      
      logger.success(`✅ Batch push #${statistics.pushCount} successful!`);
      logger.success(`✅ Committed: ${result.commitHash}`);
      logger.success(`✅ Message: ${commitMessage}`);
      console.log(logger.color(`⭐ +${xpEarned} XP (Total: ${statistics.xpPoints} XP)`, 'magenta'));
      
      // Reset pending changes
      pendingChanges.clear();
      
      // Show uptime
      logger.info(`⏱️  Uptime: ${statistics.getUptimeFormatted()}`);
      
      // Check achievements
      const unlockedAchievements = achievementManager.check(
        statistics.pushCount, 
        hour, 
        statistics.todayPushes,
        statistics.totalFilesChanged
      );
      
      if (unlockedAchievements.length > 0) {
        logger.separator('─');
        logger.highlight('🏆 ACHIEVEMENT UNLOCKED! 🏆');
        unlockedAchievements.forEach(ach => {
          console.log(logger.color(`   ${ach.icon} ${ach.name}`, 'magenta'));
          notification.achievementUnlocked(ach);
        });
      }
      
      notification.pushSuccess(statistics.pushCount, files.length, xpEarned);
      
      // Save to log
      logger.logPushResult({
        pushNumber: statistics.pushCount,
        files: files.length,
        hash: result.commitHash,
        message: commitMessage
      });
      
      logger.separator('═');
      logger.highlight(`✨ Batch #${statistics.pushCount} complete!\n`);
      
    } else {
      progressManager.stopProgress();
      logger.error('❌ Push failed');
      
      // Show error suggestions
      const lastError = gitManager.getLastError();
      if (lastError && lastError.suggestions) {
        logger.separator('─');
        logger.info('💡 SUGGESTIONS:');
        lastError.suggestions.forEach(s => {
          console.log(`   ${s}`);
        });
        logger.separator('─');
      }
    }
    
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    
    // Show error suggestions
    const suggestions = errorHandler.getSuggestion(error);
    if (suggestions && suggestions.length > 0) {
      logger.separator('─');
      logger.info('💡 SUGGESTIONS:');
      suggestions.forEach(s => {
        console.log(`   ${s}`);
      });
      logger.separator('─');
    }
    
    // Show recent errors if multiple failures
    const recentErrors = errorHandler.getRecentErrors(5);
    if (recentErrors.length > 1) {
      logger.warning(`⚠️  ${recentErrors.length} recent errors detected`);
      logger.info('📊 Run: npm run report to see error details');
    }
  } finally {
    isProcessing = false;
  }
}

// ============ SCHEDULED PUSH ============
function schedulePush() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (pendingChanges.size > 0) {
      pushChanges('batch');
    }
    timeoutId = null;
  }, config.timing.debounceMs);
}

// ============ FILE WATCHER ============
function setupWatcher() {
  const chokidar = require('chokidar');
  
  const watcher = chokidar.watch(path.join(__dirname, '..'), {
    ignored: (filePath) => {
      for (const pattern of config.ignored) {
        if (filePath.includes(pattern)) return true;
      }
      return false;
    },
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });

  watcher
    .on('change', (filePath) => {
      if (filePath.includes('logs/') || filePath.includes('reports/')) return;
      if (filePath.includes('auto-push/')) return;
      const fileName = path.basename(filePath);
      pendingChanges.add(filePath);
      console.log(logger.color(`📝 Modified: ${fileName} (${pendingChanges.size} files)`, 'yellow'));
      schedulePush();
    })
    .on('add', (filePath) => {
      if (filePath.includes('logs/') || filePath.includes('reports/')) return;
      if (filePath.includes('auto-push/')) return;
      const fileName = path.basename(filePath);
      pendingChanges.add(filePath);
      console.log(logger.color(`➕ Added: ${fileName} (${pendingChanges.size} files)`, 'green'));
      schedulePush();
    })
    .on('unlink', (filePath) => {
      if (filePath.includes('logs/') || filePath.includes('reports/')) return;
      if (filePath.includes('auto-push/')) return;
      const fileName = path.basename(filePath);
      pendingChanges.add(filePath);
      console.log(logger.color(`➖ Deleted: ${fileName} (${pendingChanges.size} files)`, 'red'));
      schedulePush();
    })
    .on('error', (error) => {
      logger.error(`Watcher error: ${error.message}`);
    });

  return watcher;
}

// ============ TIMERS ============
function setupTimers() {
  // Batch interval
  setInterval(async () => {
    try {
      if (gitManager.hasChanges()) {
        logger.info('⏰ Scheduled batch push triggered');
        await pushChanges('timer');
      }
    } catch (error) {
      logger.error(`Scheduled push error: ${error.message}`);
    }
  }, config.timing.batchIntervalMs);

  // Force push interval
  setInterval(async () => {
    try {
      if (gitManager.hasChanges()) {
        logger.warning('💪 Force push triggered - pushing all changes');
        await pushChanges('force');
      }
    } catch (error) {
      logger.error(`Force push error: ${error.message}`);
    }
  }, config.timing.forcePushIntervalMs);
}

// ============ GRACEFUL SHUTDOWN ============
function setupShutdown(watcher) {
  process.on('SIGINT', async () => {
    progressManager.stopSpinner();
    logger.separator('═');
    logger.info('\n👋 Shutting down auto-push...');
    const { full } = getFormattedDateTime();
    logger.info(`📅 Stopped at: ${full}`);
    logger.info(`📊 Total batch pushes: ${statistics.pushCount}`);
    logger.info(`📊 Total files pushed: ${statistics.totalFilesChanged}`);
    logger.info(`⭐ Total XP: ${statistics.xpPoints}`);
    logger.info(`🏆 Achievements: ${achievementManager.getCount()}`);
    
    // Check for final changes
    try {
      if (gitManager.hasChanges()) {
        logger.info('📤 Pushing final batch...');
        await pushChanges('final');
      }
    } catch (error) {
      logger.error(`Final push error: ${error.message}`);
    }
    
    // Generate and save report
    const report = reportGenerator.generate(
      statistics.getStats(),
      achievementManager.getUnlocked(),
      statistics.pushCount,
      statistics.totalFilesChanged
    );
    const reportPath = reportGenerator.save(report);
    logger.info(`📊 Report saved to: ${reportPath}`);
    
    // Generate error report
    const errorReport = errorHandler.generateErrorReport();
    const errorReportPath = path.join(__dirname, 'reports', `error-report-${new Date().toISOString().split('T')[0]}.txt`);
    fs.writeFileSync(errorReportPath, errorReport);
    logger.info(`📊 Error report saved to: ${errorReportPath}`);
    
    await watcher.close();
    logger.success('✅ Auto-push stopped');
    logger.separator('═');
    process.exit(0);
  });
}

// ============ STARTUP ============
function startup() {
  logger.header('📦 BATCH AUTO-PUSH WATCHER STARTED');
  console.log(`\n📁 Root: ${logger.color(path.join(__dirname, '..'), 'cyan')}`);
  console.log(`⏱️  Debounce: ${logger.color(config.timing.debounceMs/1000 + ' seconds', 'yellow')}`);
  console.log(`⏰ Scheduled Batch: ${logger.color(config.timing.batchIntervalMs/60000 + ' minutes', 'yellow')}`);
  console.log(`💪 Force Push: ${logger.color(config.timing.forcePushIntervalMs/60000 + ' minutes', 'yellow')}`);
  console.log(`📅 Started: ${logger.color(getFormattedDateTime().full, 'green')}`);
  console.log(`🤖 Smart Commit Messages: ${logger.color('ENABLED', 'magenta')}`);
  console.log(`🏆 Achievements: ${logger.color('Enabled', 'magenta')}`);
  console.log(`⭐ XP System: ${logger.color('Enabled', 'magenta')}`);
  console.log(`🔔 Notifications: ${logger.color('Enabled', 'magenta')}`);
  console.log(`📦 Batch Mode: ${logger.color('ALL CHANGES BATCHED TOGETHER', 'magenta')}`);
  console.log(`🚫 Ignored: ${logger.color('logs/, reports/, node_modules/, .git/, auto-push/', 'dim')}`);
  console.log('🔒 Press Ctrl+C to stop\n');
  logger.separator('─');
  
  // Start spinner
  progressManager.startSpinner('Watching for file changes...', 'cyan');
  
  // Setup file watcher
  const watcher = setupWatcher();
  
  // Setup timers
  setupTimers();
  
  // Setup shutdown
  setupShutdown(watcher);
  
  // Initial check
  setTimeout(async () => {
    try {
      if (gitManager.hasChanges()) {
        const status = gitManager.gitStatus();
        const { full } = getFormattedDateTime();
        logger.info(`📄 Found ${status.length} uncommitted changes at ${full}`);
        progressManager.stopSpinner();
        await pushChanges('initial');
        progressManager.startSpinner('Watching for file changes...', 'cyan');
      } else {
        logger.success('✅ Repository clean');
        logger.separator('─');
      }
    } catch (error) {
      logger.error(`Initial check error: ${error.message}`);
      const suggestions = errorHandler.getSuggestion(error);
      if (suggestions.length > 0) {
        logger.info('💡 Suggestions:');
        suggestions.forEach(s => console.log(`   ${s}`));
      }
    }
  }, 1000);
}

// Start the application
startup();