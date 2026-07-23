const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor() {
    this.errorLogs = [];
    this.suggestions = {
      'Authentication failed': [
        '🔐 Check your Git credentials',
        '📝 Run: git config --global user.name "Your Name"',
        '📝 Run: git config --global user.email "your.email@example.com"',
        '🔄 Try: git remote set-url origin https://username@github.com/username/repo.git',
        '🔑 Use SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh'
      ],
      'Permission denied': [
        '🔒 Check file permissions',
        '📂 Ensure you have write access to the repository',
        '🔄 Run: chmod -R 755 .',
        '👤 Check if you have push permissions on the remote repository'
      ],
      'failed to push': [
        '🌐 Check your internet connection',
        '🔄 Try: git pull --rebase origin main',
        '📝 Check if remote repository exists',
        '🔑 Verify SSH keys are added to GitHub'
      ],
      'not a git repository': [
        '📁 Initialize git: git init',
        '🔗 Add remote: git remote add origin <repo-url>',
        '📝 Run: git add . && git commit -m "Initial commit"'
      ],
      'no changes added to commit': [
        '📝 Add files: git add .',
        '📝 Or specify files: git add <file-name>',
        '💡 Check if files are ignored in .gitignore'
      ],
      'merge conflict': [
        '⚠️ Resolve conflicts manually',
        '📝 Edit files to resolve conflicts',
        '✅ Run: git add . && git commit -m "Merge resolved"',
        '🔄 Or abort: git merge --abort'
      ],
      'rejected': [
        '📥 Pull latest changes: git pull origin main',
        '🔄 Force push (with caution): git push --force',
        '💡 Use: git pull --rebase origin main'
      ],
      'timeout': [
        '🌐 Check your internet connection',
        '⏱️ Increase timeout: git config --global http.timeout 300',
        '🔄 Try again later'
      ],
      'SSL certificate': [
        '🔒 Disable SSL verification (not recommended): git config --global http.sslVerify false',
        '📝 Or update your Git certificates',
        '💡 Use SSH instead of HTTPS'
      ],
      'error: remote origin already exists': [
        '📝 Update remote: git remote set-url origin <new-url>',
        '🔄 Or remove and add: git remote rm origin && git remote add origin <url>'
      ],
      'could not read': [
        '📁 Check file permissions',
        '🔒 Ensure file is not in use',
        '💡 Try running as administrator'
      ]
    };
  }

  analyzeError(error) {
    const errorMessage = error.message || error.toString();
    const suggestions = [];
    const context = {
      timestamp: new Date().toISOString(),
      message: errorMessage,
      stack: error.stack,
      suggestions: []
    };

    // Match error with suggestions
    for (const [key, tips] of Object.entries(this.suggestions)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        context.suggestions = tips;
        break;
      }
    }

    // Check for specific error patterns
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      context.suggestions = this.suggestions['Authentication failed'];
    } else if (errorMessage.includes('404')) {
      context.suggestions = [
        '📁 Repository not found',
        '🔗 Check remote URL: git remote -v',
        '📝 Verify repository exists and you have access'
      ];
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      context.suggestions = this.suggestions['timeout'];
    } else if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
      context.suggestions = this.suggestions['SSL certificate'];
    }

    // Add generic suggestions if no specific match
    if (context.suggestions.length === 0) {
      context.suggestions = [
        '🔍 Check error details above',
        '💡 Try: git status to check current state',
        '🔄 Try: git pull origin main then push again',
        '📝 Check .git/config file for correct remote URL'
      ];
    }

    this.errorLogs.push(context);
    return context;
  }

  getSuggestion(error) {
    const analysis = this.analyzeError(error);
    return analysis.suggestions;
  }

  logError(error, context = {}) {
    const analysis = this.analyzeError(error);
    const logEntry = {
      timestamp: analysis.timestamp,
      error: analysis.message,
      stack: analysis.stack,
      context: context,
      suggestions: analysis.suggestions
    };

    // Save to error log file
    try {
      const logDir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, 'error-log.json');
      let logs = [];
      if (fs.existsSync(logFile)) {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
      logs.push(logEntry);
      // Keep only last 1000 errors
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    } catch (e) {
      // Silent fail for error logging
    }

    return analysis;
  }

  getRecentErrors(count = 10) {
    try {
      const logFile = path.join(__dirname, '..', 'logs', 'error-log.json');
      if (!fs.existsSync(logFile)) return [];
      const logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      return logs.slice(-count).reverse();
    } catch (e) {
      return [];
    }
  }

  clearErrors() {
    try {
      const logFile = path.join(__dirname, '..', 'logs', 'error-log.json');
      if (fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '[]');
      }
      this.errorLogs = [];
    } catch (e) {
      // Silent fail
    }
  }

  generateErrorReport() {
    const errors = this.getRecentErrors(100);
    if (errors.length === 0) {
      return '✅ No errors found';
    }

    const errorTypes = {};
    errors.forEach(err => {
      const key = err.error || 'Unknown Error';
      errorTypes[key] = (errorTypes[key] || 0) + 1;
    });

    let report = '📊 ERROR REPORT\n';
    report += '═'.repeat(50) + '\n\n';
    report += `📅 Report Date: ${new Date().toLocaleString()}\n`;
    report += `📊 Total Errors: ${errors.length}\n\n`;

    report += '🔍 ERROR TYPES:\n';
    for (const [type, count] of Object.entries(errorTypes).sort((a, b) => b[1] - a[1])) {
      report += `   ${type}: ${count} occurrences\n`;
    }

    report += '\n💡 SUGGESTIONS:\n';
    const lastError = errors[0];
    if (lastError && lastError.suggestions) {
      lastError.suggestions.forEach(s => {
        report += `   ${s}\n`;
      });
    }

    return report;
  }
}

module.exports = new ErrorHandler();