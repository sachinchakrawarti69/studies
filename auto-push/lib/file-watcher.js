const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class FileWatcher {
  constructor(options = {}) {
    this.watcher = null;
    this.onChange = options.onChange || (() => {});
    this.onAdd = options.onAdd || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onError = options.onError || (() => {});
    this.ignored = options.ignored || [
      'node_modules',
      '.git',
      'build',
      'dist',
      '.docusaurus',
      '.cache',
      'package-lock.json',
      'Out-Null',
      'logs',
      'reports',
      'auto-push'
    ];
    this.rootDir = options.rootDir || path.join(__dirname, '..', '..');
    this.isWatching = false;
  }

  /**
   * Check if a file path should be ignored
   */
  shouldIgnore(filePath) {
    // Normalize path for comparison
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Check if path is in logs or reports
    if (normalizedPath.includes('/logs/') || 
        normalizedPath.includes('/reports/') ||
        normalizedPath.includes('/auto-push/')) {
      return true;
    }

    // Check against ignored patterns
    for (const pattern of this.ignored) {
      if (normalizedPath.includes(pattern.replace(/\\/g, '/'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Start watching for file changes
   */
  start() {
    if (this.isWatching) {
      console.warn('⚠️  File watcher is already running');
      return this.watcher;
    }

    try {
      // Ensure root directory exists
      if (!fs.existsSync(this.rootDir)) {
        throw new Error(`Root directory does not exist: ${this.rootDir}`);
      }

      console.log(`📁 Watching directory: ${this.rootDir}`);

      this.watcher = chokidar.watch(this.rootDir, {
        ignored: (filePath) => {
          return this.shouldIgnore(filePath);
        },
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        },
        depth: 99,
        followSymlinks: false
      });

      // Event handlers
      this.watcher
        .on('change', (filePath) => {
          if (this.shouldIgnore(filePath)) return;
          const fileName = path.basename(filePath);
          console.log(`📝 File changed: ${fileName}`);
          this.onChange(filePath);
        })
        .on('add', (filePath) => {
          if (this.shouldIgnore(filePath)) return;
          const fileName = path.basename(filePath);
          console.log(`➕ File added: ${fileName}`);
          this.onAdd(filePath);
        })
        .on('unlink', (filePath) => {
          if (this.shouldIgnore(filePath)) return;
          const fileName = path.basename(filePath);
          console.log(`➖ File deleted: ${fileName}`);
          this.onDelete(filePath);
        })
        .on('addDir', (dirPath) => {
          if (this.shouldIgnore(dirPath)) return;
          const dirName = path.basename(dirPath);
          console.log(`📁 Directory added: ${dirName}`);
        })
        .on('unlinkDir', (dirPath) => {
          if (this.shouldIgnore(dirPath)) return;
          const dirName = path.basename(dirPath);
          console.log(`📁 Directory deleted: ${dirName}`);
        })
        .on('error', (error) => {
          console.error(`❌ Watcher error: ${error.message}`);
          this.onError(error);
        })
        .on('ready', () => {
          this.isWatching = true;
          console.log('✅ File watcher is ready');
        });

      return this.watcher;

    } catch (error) {
      console.error(`❌ Failed to start watcher: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop watching for file changes
   */
  async close() {
    if (!this.isWatching || !this.watcher) {
      console.warn('⚠️  File watcher is not running');
      return;
    }

    try {
      await this.watcher.close();
      this.isWatching = false;
      this.watcher = null;
      console.log('✅ File watcher stopped');
    } catch (error) {
      console.error(`❌ Error stopping watcher: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the current status of the watcher
   */
  getStatus() {
    return {
      isWatching: this.isWatching,
      rootDir: this.rootDir,
      ignored: this.ignored
    };
  }

  /**
   * Add a new ignored pattern
   */
  addIgnoredPattern(pattern) {
    if (!this.ignored.includes(pattern)) {
      this.ignored.push(pattern);
    }
  }

  /**
   * Remove an ignored pattern
   */
  removeIgnoredPattern(pattern) {
    const index = this.ignored.indexOf(pattern);
    if (index > -1) {
      this.ignored.splice(index, 1);
    }
  }

  /**
   * Get all ignored patterns
   */
  getIgnoredPatterns() {
    return [...this.ignored];
  }

  /**
   * Watch a specific directory instead of the root
   */
  watchDirectory(directory) {
    this.rootDir = directory;
    if (this.isWatching) {
      this.close().then(() => {
        this.start();
      });
    }
  }

  /**
   * Get list of currently tracked files
   */
  getTrackedFiles() {
    if (!this.isWatching || !this.watcher) {
      return [];
    }

    // This is a limitation - chokidar doesn't expose tracked files directly
    // We can use a workaround by checking the watched directories
    try {
      const watched = this.watcher.getWatched();
      const files = [];
      for (const [dir, items] of Object.entries(watched)) {
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (!this.shouldIgnore(fullPath)) {
            files.push(fullPath);
          }
        }
      }
      return files;
    } catch (error) {
      console.error(`Error getting tracked files: ${error.message}`);
      return [];
    }
  }

  /**
   * Check if a specific file is being watched
   */
  isFileWatched(filePath) {
    if (!this.isWatching) return false;
    if (this.shouldIgnore(filePath)) return false;
    
    // Check if file exists and is within watched directory
    try {
      const relativePath = path.relative(this.rootDir, filePath);
      return !relativePath.startsWith('..') && fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Restart the watcher
   */
  async restart() {
    await this.close();
    this.start();
  }

  /**
   * Get statistics about the watcher
   */
  getStats() {
    const trackedFiles = this.getTrackedFiles();
    return {
      isWatching: this.isWatching,
      rootDir: this.rootDir,
      trackedFiles: trackedFiles.length,
      ignoredPatterns: this.ignored.length,
      uptime: this.isWatching ? Date.now() - this.startTime : 0
    };
  }
}

module.exports = FileWatcher;