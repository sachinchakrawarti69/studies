class ProgressManager {
  constructor() {
    this.spinner = null;
    this.progressBar = null;
    this.isSpinnerActive = false;
  }

  // Simple spinner without external dependencies
  startSpinner(text = 'Processing...', color = 'cyan') {
    this.isSpinnerActive = true;
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    this.spinner = setInterval(() => {
      if (this.isSpinnerActive) {
        process.stdout.write(`\r${frames[i]} ${text}`);
        i = (i + 1) % frames.length;
      }
    }, 80);
    
    return this.spinner;
  }

  stopSpinner() {
    this.isSpinnerActive = false;
    if (this.spinner) {
      clearInterval(this.spinner);
      this.spinner = null;
    }
    process.stdout.write('\r' + ' '.repeat(50) + '\r');
  }

  updateSpinner(text) {
    if (this.isSpinnerActive) {
      process.stdout.write(`\r${text}`);
    }
  }

  // Simple progress bar without external dependencies
  createProgressBar(total = 4) {
    this.progressBar = {
      total: total,
      current: 0,
      startTime: Date.now()
    };
    return this.progressBar;
  }

  updateProgress(value) {
    if (this.progressBar) {
      this.progressBar.current = value;
      const percent = Math.round((value / this.progressBar.total) * 100);
      const barLength = 30;
      const filled = Math.round((value / this.progressBar.total) * barLength);
      const empty = barLength - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      
      process.stdout.write(`\r📤 Push Progress |${bar}| ${percent}% | ${value}/${this.progressBar.total} steps`);
    }
  }

  stopProgress() {
    if (this.progressBar) {
      process.stdout.write('\n');
      this.progressBar = null;
    }
  }

  cleanup() {
    this.stopSpinner();
    this.stopProgress();
  }
}

module.exports = new ProgressManager();