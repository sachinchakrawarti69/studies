const fs = require('fs');
const path = require('path');

class ReportGenerator {
  constructor() {
    this.reportDir = path.join(__dirname, '..', 'reports');
    this.ensureReportDir();
  }

  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  generate(stats, achievements, pushCount, totalFilesChanged) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const report = `
╔═══════════════════════════════════════════════════════════════╗
║                    📊 PUSH REPORT                           ║
╚═══════════════════════════════════════════════════════════════╝

📅 Date: ${date}
⏰ Time: ${time}
⏱️  Uptime: ${stats.uptime}

📊 Statistics:
   • Total Pushes: ${pushCount}
   • Today's Pushes: ${stats.todayPushes || 0}
   • Total Files Changed: ${totalFilesChanged}
   • XP Points: ${stats.xpPoints || 0} ⭐

🏆 Achievements Unlocked: ${achievements.length}
   ${achievements.map(a => `   ${a.icon} ${a.name}`).join('\n') || '   None yet'}

📈 Performance:
   • Average Files per Push: ${stats.averageFilesPerPush || 0}
   • Push Rate: ${stats.pushRate || 0} pushes/hour

📂 File Types Modified:
   ${Object.entries(stats.fileTypes || {})
     .slice(0, 10)
     .map(([ext, count]) => `   .${ext}: ${count} files`)
     .join('\n')}
   ${Object.keys(stats.fileTypes || {}).length > 10 ? `   ... and ${Object.keys(stats.fileTypes).length - 10} more` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    return report;
  }

  save(report, filename = null) {
    if (!filename) {
      const date = new Date().toISOString().split('T')[0];
      filename = `report-${date}.txt`;
    }
    const filePath = path.join(this.reportDir, filename);
    fs.writeFileSync(filePath, report);
    return filePath;
  }

  generateAndSave(stats, achievements, pushCount, totalFilesChanged) {
    const report = this.generate(stats, achievements, pushCount, totalFilesChanged);
    return this.save(report);
  }

  getLatestReport() {
    try {
      const files = fs.readdirSync(this.reportDir)
        .filter(f => f.startsWith('report-') && f.endsWith('.txt'))
        .sort()
        .reverse();
      
      if (files.length === 0) return null;
      
      return fs.readFileSync(path.join(this.reportDir, files[0]), 'utf8');
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ReportGenerator();