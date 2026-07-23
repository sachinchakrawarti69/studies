class NotificationManager {
  constructor() {
    this.enabled = true;
    this.notifications = [];
  }

  send(title, message, options = {}) {
    if (!this.enabled) return;
    
    // Log notification to console
    console.log(`\n🔔 ${title}`);
    console.log(`   ${message}`);
    
    // Store notification
    this.notifications.push({
      timestamp: new Date().toISOString(),
      title,
      message,
      options
    });

    // Try to use system notification if available
    try {
      // Attempt to use node-notifier if installed
      const notifier = require('node-notifier');
      notifier.notify({
        title: title,
        message: message,
        sound: options.sound !== undefined ? options.sound : true,
        wait: options.wait || false,
        icon: options.icon || null
      });
    } catch (error) {
      // Silent fail - notifications will still show in console
    }
  }

  pushSuccess(pushNumber, filesCount, xpEarned) {
    this.send(
      `✅ Batch Push #${pushNumber} Successful`,
      `${filesCount} files pushed | ⭐ +${xpEarned} XP`
    );
  }

  achievementUnlocked(achievement) {
    this.send(
      `🏆 Achievement Unlocked!`,
      `${achievement.icon} ${achievement.name}`
    );
  }

  error(title, message) {
    this.send(
      `❌ ${title}`,
      message,
      { sound: true }
    );
  }

  info(title, message) {
    this.send(
      `ℹ️ ${title}`,
      message
    );
  }

  warning(title, message) {
    this.send(
      `⚠️ ${title}`,
      message,
      { sound: true }
    );
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }

  getNotifications(count = 10) {
    return this.notifications.slice(-count);
  }

  clearNotifications() {
    this.notifications = [];
  }
}

module.exports = new NotificationManager();