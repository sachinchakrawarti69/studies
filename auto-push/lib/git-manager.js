const { execSync } = require('child_process');
const path = require('path');
const errorHandler = require('./error-handler');

class GitManager {
  constructor() {
    this.rootDir = path.join(__dirname, '..', '..');
    this.isPushing = false;
    this.lastError = null;
  }

  execGit(command, options = {}) {
    try {
      const result = execSync(`git ${command}`, {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });
      return result.trim();
    } catch (error) {
      const analysis = errorHandler.logError(error, {
        command: `git ${command}`,
        cwd: this.rootDir
      });
      this.lastError = analysis;
      return null;
    }
  }

  gitStatus() {
    const output = this.execGit('status --porcelain');
    if (!output) return [];
    return output.split('\n')
      .filter(line => line.trim())
      .map(line => ({
        status: line.substring(0, 2),
        path: line.substring(3).trim()
      }));
  }

  gitAdd(paths = '.') {
    const result = this.execGit(`add ${paths}`);
    if (result === null) {
      throw new Error('Failed to stage files');
    }
    return true;
  }

  gitCommit(message) {
    const result = this.execGit(`commit -m "${message.replace(/"/g, '\\"')}"`);
    if (result === null) {
      throw new Error('Failed to commit');
    }
    const hash = this.execGit('rev-parse HEAD');
    return {
      success: true,
      hash: hash ? hash.substring(0, 7) : 'unknown'
    };
  }

  gitPush(remote = 'origin', branch = 'main') {
    // Try regular push first
    let result = this.execGit(`push ${remote} ${branch}`);
    if (result !== null) return true;

    // Try with specific flags
    const pushCommands = [
      `push ${remote} ${branch} --force-with-lease`,
      `push ${remote} HEAD:${branch}`,
      `push ${remote} --all`
    ];

    for (const cmd of pushCommands) {
      const retryResult = this.execGit(cmd);
      if (retryResult !== null) {
        return true;
      }
    }

    return false;
  }

  gitPull(remote = 'origin', branch = 'main') {
    const result = this.execGit(`pull ${remote} ${branch}`);
    return result !== null;
  }

  gitRebase(remote = 'origin', branch = 'main') {
    const result = this.execGit(`rebase ${remote}/${branch}`);
    return result !== null;
  }

  gitStash() {
    const result = this.execGit('stash');
    return result !== null;
  }

  gitStashPop() {
    const result = this.execGit('stash pop');
    return result !== null;
  }

  hasChanges() {
    try {
      const status = this.gitStatus();
      return status.length > 0;
    } catch (error) {
      return false;
    }
  }

  getChangedFiles() {
    const status = this.gitStatus();
    return status.map(f => f.path);
  }

  getLastCommit() {
    const output = this.execGit('log -1 --format=%H');
    if (!output) return null;
    return {
      hash: output.substring(0, 7),
      fullHash: output,
      message: this.execGit('log -1 --format=%s'),
      author: this.execGit('log -1 --format=%an'),
      date: this.execGit('log -1 --format=%ai')
    };
  }

  getRemoteUrl() {
    const output = this.execGit('remote -v');
    if (!output) return null;
    const match = output.match(/origin\s+(.+?)\s+\(fetch\)/);
    return match ? match[1] : null;
  }

  getCurrentBranch() {
    const output = this.execGit('branch --show-current');
    return output || 'main';
  }

  // Smart push with recovery strategies
  async pushWithRecovery(message) {
    if (this.isPushing) {
      throw new Error('Already pushing');
    }

    this.isPushing = true;
    try {
      // Check if there are changes
      if (!this.hasChanges()) {
        throw new Error('No changes to commit');
      }

      // Try to add and commit
      try {
        this.gitAdd('.');
      } catch (error) {
        // Try with specific files
        const files = this.getChangedFiles();
        if (files.length > 0) {
          this.gitAdd(files.join(' '));
        } else {
          throw new Error('No files to add');
        }
      }

      // Commit
      const commitResult = this.gitCommit(message);
      if (!commitResult.success) {
        throw new Error('Failed to commit');
      }

      // Try to push with retry logic
      const maxRetries = 3;
      let pushSuccess = false;
      let lastError = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Check if we're behind remote
          const fetchResult = this.execGit('fetch');
          if (fetchResult !== null) {
            const ahead = this.execGit('log origin/$(git branch --show-current)..HEAD --oneline');
            const behind = this.execGit('log HEAD..origin/$(git branch --show-current) --oneline');
            
            if (behind && behind.length > 0) {
              // We're behind, try to pull/rebase
              console.log('📥 Pulling latest changes...');
              const pullSuccess = this.gitPull();
              if (!pullSuccess) {
                // Try rebase as fallback
                console.log('🔄 Trying rebase...');
                const rebaseSuccess = this.gitRebase();
                if (!rebaseSuccess) {
                  // Stash and retry
                  console.log('📦 Stashing changes...');
                  this.gitStash();
                  this.gitPull();
                  this.gitStashPop();
                }
              }
            }
          }

          // Push
          if (this.gitPush()) {
            pushSuccess = true;
            break;
          } else {
            // Try force with lease as fallback
            const branch = this.getCurrentBranch();
            const result = this.execGit(`push origin ${branch} --force-with-lease`);
            if (result !== null) {
              pushSuccess = true;
              break;
            }
          }

          if (attempt < maxRetries) {
            console.log(`⏳ Retry ${attempt}/${maxRetries} in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            console.log(`⏳ Retry ${attempt}/${maxRetries} in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (!pushSuccess) {
        throw new Error(lastError || 'Failed to push after multiple attempts');
      }

      return {
        success: true,
        commitHash: commitResult.hash,
        commitMessage: message,
        filesChanged: this.getChangedFiles().length
      };

    } catch (error) {
      const analysis = errorHandler.logError(error, {
        operation: 'pushWithRecovery',
        message: message
      });
      this.lastError = analysis;
      throw error;
    } finally {
      this.isPushing = false;
    }
  }

  getLastError() {
    return this.lastError;
  }

  clearLastError() {
    this.lastError = null;
  }
}

module.exports = new GitManager();