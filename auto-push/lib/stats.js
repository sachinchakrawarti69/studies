class Statistics {
  constructor() {
    this.startTime = new Date();
    this.pushCount = 0;
    this.todayPushes = 0;
    this.totalFilesChanged = 0;
    this.xpPoints = 0;
    this.fileTypes = {};
    this.lastPushTime = null;
    this.dailyResetTime = new Date().setHours(0, 0, 0, 0);
  }

  incrementPush(files = []) {
    this.pushCount++;
    this.todayPushes++;
    this.totalFilesChanged += files.length;
    this.lastPushTime = new Date();
    
    // Track file types
    files.forEach(file => {
      const ext = this.getFileExtension(file);
      this.fileTypes[ext] = (this.fileTypes[ext] || 0) + 1;
    });
  }

  getFileExtension(file) {
    const parts = file.split('.');
    return parts.length > 1 ? parts.pop() : 'unknown';
  }

  addXP(amount) {
    this.xpPoints += amount;
    return this.xpPoints;
  }

  getUptime() {
    return Math.floor((new Date() - this.startTime) / 1000);
  }

  getUptimeFormatted() {
    const uptime = this.getUptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  getAverageFilesPerPush() {
    return this.pushCount > 0 ? (this.totalFilesChanged / this.pushCount).toFixed(1) : 0;
  }

  getPushRate() {
    const uptime = this.getUptime() / 3600;
    return this.pushCount > 0 && uptime > 0 ? (this.pushCount / uptime).toFixed(1) : 0;
  }

  resetDaily() {
    this.todayPushes = 0;
    this.fileTypes = {};
  }

  getStats() {
    return {
      pushCount: this.pushCount,
      todayPushes: this.todayPushes,
      totalFilesChanged: this.totalFilesChanged,
      xpPoints: this.xpPoints,
      fileTypes: this.fileTypes,
      uptime: this.getUptimeFormatted(),
      averageFilesPerPush: this.getAverageFilesPerPush(),
      pushRate: this.getPushRate(),
      lastPushTime: this.lastPushTime
    };
  }

  reset() {
    this.pushCount = 0;
    this.todayPushes = 0;
    this.totalFilesChanged = 0;
    this.xpPoints = 0;
    this.fileTypes = {};
    this.lastPushTime = null;
    this.startTime = new Date();
  }

  checkDailyReset() {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    if (today > this.dailyResetTime) {
      this.resetDaily();
      this.dailyResetTime = today;
    }
  }
}

module.exports = new Statistics();