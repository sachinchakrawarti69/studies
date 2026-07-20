const path = require('path');

module.exports = {
  // Timing configuration
  DEBOUNCE_MS: 5000,
  BATCH_INTERVAL_MS: 60000,
  FORCE_PUSH_INTERVAL: 120000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000,
  
  // Root directory
  ROOT_DIR: path.join(__dirname, '..', '..'),
  
  // Ignored paths
  IGNORED_PATHS: [
    /(^|[\/\\])\../,
    /node_modules/,
    /\.git/,
    /build/,
    /dist/,
    /\.docusaurus/,
    /\.cache/,
    /package-lock\.json/,
    /Out-Null/,
    /logs/,
    /reports/,
    /auto-push/
  ],
  
  // Error handling
  ERROR_HANDLING: {
    logErrors: true,
    showSuggestions: true,
    retryOnFailure: true,
    maxRetries: 3,
    retryDelay: 5000
  },
  
  // Git error patterns
  GIT_ERROR_PATTERNS: {
    'Authentication failed': {
      suggestion: '🔑 Check your Git credentials. Run: git config --global user.name "Your Name" && git config --global user.email "your.email@example.com"',
      severity: 'high'
    },
    'Permission denied': {
      suggestion: '🔒 You don\'t have permission. Check repository access or use SSH keys.',
      severity: 'high'
    },
    'Connection refused': {
      suggestion: '🌐 Network connection issue. Check your internet connection and firewall settings.',
      severity: 'medium'
    },
    'Failed to connect': {
      suggestion: '🌐 Network timeout. Check your internet connection or try a different network.',
      severity: 'medium'
    },
    'remote rejected': {
      suggestion: '🚫 Push rejected. Pull latest changes first: git pull --rebase',
      severity: 'high'
    },
    'non-fast-forward': {
      suggestion: '📥 Branch diverged. Run: git pull --rebase origin main',
      severity: 'high'
    },
    'failed to push': {
      suggestion: '🔄 Retry push after pulling: git pull && git push',
      severity: 'medium'
    },
    'not a git repository': {
      suggestion: '📂 Not a git repository. Run: git init',
      severity: 'critical'
    },
    'no such file': {
      suggestion: '📁 File not found. Check if the file exists and is accessible.',
      severity: 'medium'
    },
    'invalid path': {
      suggestion: '🔍 Invalid file path. Check for special characters or spaces.',
      severity: 'medium'
    },
    'merge conflict': {
      suggestion: '⚔️ Merge conflict detected. Resolve conflicts: git mergetool or manually fix files.',
      severity: 'critical'
    },
    'rejected by hook': {
      suggestion: '🚫 Pre-push hook rejected. Check your git hooks configuration.',
      severity: 'medium'
    },
    'exceeds limit': {
      suggestion: '📦 Push exceeds size limit. Use git-lfs or split into smaller commits.',
      severity: 'high'
    }
  }
};