const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureDirectories();
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      dim: '\x1b[2m'
    };
  }

  ensureDirectories() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  color(text, color) {
    return `${this.colors[color] || ''}${text}${this.colors.reset}`;
  }

  success(msg) {
    console.log(this.color(`✅ ${msg}`, 'green'));
    this.logToFile(msg, 'success');
  }

  warning(msg) {
    console.log(this.color(`⚠️  ${msg}`, 'yellow'));
    this.logToFile(msg, 'warning');
  }

  error(msg) {
    console.log(this.color(`❌ ${msg}`, 'red'));
    this.logToFile(msg, 'error');
  }

  info(msg) {
    console.log(this.color(`ℹ️  ${msg}`, 'blue'));
    this.logToFile(msg, 'info');
  }

  highlight(msg) {
    console.log(this.color(`✨ ${msg}`, 'magenta'));
    this.logToFile(msg, 'highlight');
  }

  dim(msg) {
    console.log(this.color(msg, 'dim'));
  }

  separator(char = '═', length = 70) {
    console.log(this.color(char.repeat(length), 'dim'));
  }

  header(text) {
    console.log(this.color('╔' + '═'.repeat(70) + '╗', 'cyan'));
    console.log(this.color(`║   ${text.padEnd(65)}║`, 'cyan'));
    console.log(this.color('╚' + '═'.repeat(70) + '╝', 'cyan'));
  }

  logToFile(message, type = 'info') {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `app-log-${date}.txt`);
      const entry = `${new Date().toISOString()} | [${type.toUpperCase()}] ${message}\n`;
      fs.appendFileSync(logFile, entry);
    } catch (e) {
      // Silent fail
    }
  }

  logPushResult(data) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `push-log-${date}.txt`);
      const entry = `${new Date().toISOString()} | PUSH #${data.pushNumber} | ${data.files} files | ${data.hash} | ${data.message}\n`;
      fs.appendFileSync(logFile, entry);
    } catch (e) {
      // Silent fail
    }
  }

  logError(error, context = {}) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `error-log-${date}.txt`);
      const entry = [
        `${new Date().toISOString()} | ERROR |`,
        `Message: ${error.message}`,
        `Context: ${JSON.stringify(context)}`,
        `Stack: ${error.stack || 'N/A'}`,
        '---'
      ].join('\n');
      fs.appendFileSync(logFile, entry + '\n');
    } catch (e) {
      // Silent fail
    }
  }

  getRecentLogs(type = 'app', count = 100) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `${type}-log-${date}.txt`);
      if (!fs.existsSync(logFile)) return [];
      const content = fs.readFileSync(logFile, 'utf8');
      return content.split('\n').filter(line => line.trim()).slice(-count);
    } catch (e) {
      return [];
    }
  }
}

module.exports = new Logger();